"use client";

import React, { ReactNode } from 'react';
import { AppLayoutShell } from './AppLayoutShell';

export function AppMain({ children }: { children?: ReactNode }) {
  return <AppLayoutShell>{children}</AppLayoutShell>;
}
