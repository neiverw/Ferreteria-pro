import React from 'react';
import { Store, UserCheck, Sliders, Check } from 'lucide-react';
import { StepNumber } from './types';

interface RegisterStepperProps {
  currentStep: StepNumber;
}

export function RegisterStepper({ currentStep }: RegisterStepperProps) {
  const steps = [
    { num: 1, label: 'Datos de la Ferretería', icon: Store },
    { num: 2, label: 'Cuenta de Administrador', icon: UserCheck },
    { num: 3, label: 'Preferencias & POS', icon: Sliders },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map((step) => {
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const Icon = step.icon;

          return (
            <div
              key={step.num}
              className={`flex flex-col sm:flex-row items-center sm:items-start gap-2 p-2.5 sm:p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-blue-500 bg-blue-600/10 shadow-md shadow-blue-500/5'
                  : isDone
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="text-center sm:text-left">
                <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Paso 0{step.num}
                </span>
                <p className={`text-xs font-bold line-clamp-1 ${isCurrent ? 'text-white' : isDone ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
