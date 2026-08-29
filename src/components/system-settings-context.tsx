"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './auth-context';

export interface SystemSettings {
  companyName: string;
  companyNit: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultTaxRate: number;
}

interface SystemSettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  refreshSettings: () => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    // Si no está autenticado, no hacer peticiones al backend
    if (!isAuthenticated) {
      setSettings(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/system-settings', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const settingsData = result.settings || {};

        const newSettings: SystemSettings = {
          companyName: settingsData.company_name || '',
          companyNit: settingsData.company_nit || '',
          companyAddress: settingsData.company_address || '',
          companyPhone: settingsData.company_phone || '',
          companyEmail: settingsData.company_email || '',
          defaultTaxRate: parseFloat(settingsData.default_tax_rate) || 16.0,
        };

        setSettings(newSettings);
        setError(null);
      } else if (response.status === 401) {
        setSettings(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Error al cargar configuración');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar configuración';
      console.error('Error loading system settings:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchSettings();
      } else {
        setSettings(null);
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading, fetchSettings]);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      setError(null);
      
      const dbSettings: Record<string, string> = {};
      
      if (newSettings.companyName !== undefined) {
        dbSettings.company_name = newSettings.companyName;
      }
      if (newSettings.companyNit !== undefined) {
        dbSettings.company_nit = newSettings.companyNit;
      }
      if (newSettings.companyAddress !== undefined) {
        dbSettings.company_address = newSettings.companyAddress;
      }
      if (newSettings.companyPhone !== undefined) {
        dbSettings.company_phone = newSettings.companyPhone;
      }
      if (newSettings.companyEmail !== undefined) {
        dbSettings.company_email = newSettings.companyEmail;
      }
      if (newSettings.defaultTaxRate !== undefined) {
        dbSettings.default_tax_rate = newSettings.defaultTaxRate.toString();
      }

      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: dbSettings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Error al guardar configuración');
      }

      setSettings(prev => prev ? ({ ...prev, ...newSettings }) : null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar configuración';
      console.error('Error updating system settings:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, loading, error, updateSettings, refreshSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};
