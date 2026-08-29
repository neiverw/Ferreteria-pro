"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { RegisterStepper } from './RegisterStepper';
import { StepBusinessInfo } from './StepBusinessInfo';
import { StepAdminAccount } from './StepAdminAccount';
import { StepStorePreferences } from './StepStorePreferences';
import { RegisterSidebarSummary } from './RegisterSidebarSummary';
import { RegisterFormData, StepNumber } from './types';

export function RegisterWizard() {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    storeName: '',
    nit: '',
    address: '',
    city: '',
    phone: '',
    businessType: 'ferreteria_general',
    ownerName: '',
    ownerRole: 'Propietario / Administrador',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    catalogSize: 'medium',
    hasBarcodeScanner: true,
    hasThermalPrinter: false,
    preloadDemoData: true,
    acceptTerms: true,
  });

  const updateData = (fields: Partial<RegisterFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => (Math.min(prev + 1, 3) as StepNumber));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => (Math.max(prev - 1, 1) as StepNumber));
  };

  const handleFinalSubmit = async () => {
    setServerError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: formData.storeName,
          nit: formData.nit,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
          businessType: formData.businessType,
          name: formData.ownerName,
          ownerRole: formData.ownerRole,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          catalogSize: formData.catalogSize,
          preloadDemoData: formData.preloadDemoData,
          role: 'admin',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear la cuenta.');
      }

      // Automatically log the user in
      await login(formData.username, formData.password);
      router.push('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al registrar el negocio.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-step Wizard */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-slate-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <RegisterStepper currentStep={currentStep} />

          {currentStep === 1 && (
            <StepBusinessInfo
              data={formData}
              updateData={updateData}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <StepAdminAccount
              data={formData}
              updateData={updateData}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 3 && (
            <StepStorePreferences
              data={formData}
              updateData={updateData}
              onSubmit={handleFinalSubmit}
              onPrev={handlePrevStep}
              isLoading={isLoading}
              serverError={serverError}
            />
          )}
        </div>

        {/* Right Column: Dynamic Profile & Perks */}
        <div className="lg:col-span-4 sticky top-24">
          <RegisterSidebarSummary data={formData} />
        </div>
      </div>
    </div>
  );
}
