"use client";

import React from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LoginFormModal } from './LoginFormModal';
import { Wrench } from 'lucide-react';

interface LandingLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LandingLoginModal({ isOpen, onClose }: LandingLoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white p-6 shadow-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 text-white">
            <Wrench className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
            Iniciar Sesión
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-400">
            Ingresa con tus credenciales de administrador, cajero o bodega.
          </DialogDescription>
        </DialogHeader>

        <LoginFormModal
          onSuccess={onClose}
          onSwitchToRegister={() => {
            onClose();
            window.location.href = '/register';
          }}
        />

        <div className="pt-2 text-center">
          <Link
            href="/register"
            onClick={onClose}
            className="text-xs text-blue-400 hover:underline font-semibold"
          >
            ¿No tienes cuenta? Registra tu ferretería aquí
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
