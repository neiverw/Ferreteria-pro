import { useState, useEffect } from 'react';

interface SystemSettings {
  companyName: string;
  companyNit: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultTaxRate: number;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'Ferretería Pro',
    companyNit: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    defaultTaxRate: 16.0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log('🔍 Cargando configuraciones del sistema...');
        
        const response = await fetch('/api/system-settings', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('📊 Configuraciones recibidas:');
          
          const settingsData = result.settings || {};

          const newSettings = {
            companyName: settingsData.company_name || 'Ferretería Pro',
            companyNit: settingsData.company_nit || '',
            companyAddress: settingsData.company_address || '',
            companyPhone: settingsData.company_phone || '',
            companyEmail: settingsData.company_email || '',
            defaultTaxRate: parseFloat(settingsData.default_tax_rate) || 16.0,
          };

          console.log('✅ Configuraciones procesadas:');
          setSettings(newSettings);
          setError(null);
        } else {
          const errorData = await response.json();
          console.error('❌ Error del servidor:', errorData);
          throw new Error(errorData.details || 'Error al cargar configuración');
        }
      } catch (err: any) {
        console.error('💥 Error loading system settings:', err);
        setError(err.message);
        
        // Mantener configuraciones por defecto en caso de error
        console.log('🔄 Usando configuraciones por defecto');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      setError(null);
      
      // Transformar de vuelta al formato de base de datos
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

      // Actualizar el estado local
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (err: any) {
      console.error('Error updating system settings:', err);
      setError(err.message);
      throw err;
    }
  };

  return { 
    settings, 
    loading, 
    error, 
    updateSettings,
    refreshSettings: () => window.location.reload() 
  };
}