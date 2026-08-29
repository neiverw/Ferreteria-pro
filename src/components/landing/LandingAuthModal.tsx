"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LoginFormModal } from './LoginFormModal';
import { RegisterFormModal } from './RegisterFormModal';
import { Wrench } from 'lucide-react';
import { AuthModalState } from './types';

interface LandingAuthModalProps {
  modalState: AuthModalState;
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export function LandingAuthModal({ modalState, onClose, onSwitchMode }: LandingAuthModalProps) {
  const isRegister = modalState.mode === 'register';

  return (
    <Dialog open={modalState.isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-slate-950 border-slate-800 text-white p-6 shadow-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 text-white">
            <Wrench className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
            {isRegister ? 'Comienza tu Prueba Gratuita' : 'Iniciar Sesión'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-400">
            {isRegister
              ? 'Acceso instantáneo de 14 días sin tarjeta de crédito. Configura tu tienda en minutos.'
              : 'Ingresa a tu panel de administración de Ferretería PRO.'}
          </DialogDescription>
        </DialogHeader>

        {/* Tab selector */}
        <div className="grid grid-cols-2 rounded-xl bg-slate-900 p-1 border border-slate-800 my-2">
          <button
            type="button"
            onClick={() => onSwitchMode('login')}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              !isRegister
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('register')}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              isRegister
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrarse (14 Días Gratis)
          </button>
        </div>

        {isRegister ? (
          <RegisterFormModal
            initialPlan={modalState.selectedPlan || 'pro'}
            onSuccess={onClose}
            onSwitchToLogin={() => onSwitchMode('login')}
          />
        ) : (
          <LoginFormModal
            onSuccess={onClose}
            onSwitchToRegister={() => onSwitchMode('register')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
