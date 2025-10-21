"use client";

import { useEffect } from 'react';
import { useSystemSettings } from '@/components/system-settings-context';

export function DynamicTitle() {
  const { settings } = useSystemSettings();

  useEffect(() => {
    if (settings?.companyName) {
      document.title = `${settings.companyName} - SGI`;
    } else {
      document.title = 'Cargando...';
    }
  }, [settings?.companyName]);

  return null;
}
