"use client";

import { useEffect } from 'react';
import { useSystemSettings } from '@/components/system-settings-context';
import { useAuth } from '@/components/auth-context';

export function DynamicTitle() {
  const { isAuthenticated } = useAuth();
  const { settings } = useSystemSettings();

  useEffect(() => {
    if (isAuthenticated && settings?.companyName) {
      document.title = `${settings.companyName} - SGI`;
    } else {
      document.title = 'Ferretería Pro - SGI';
    }
  }, [isAuthenticated, settings?.companyName]);

  return null;
}
