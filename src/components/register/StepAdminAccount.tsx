"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RegisterFormData } from './types';
import { ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StepAdminAccountProps {
  data: RegisterFormData;
  updateData: (fields: Partial<RegisterFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepAdminAccount({ data, updateData, onNext, onPrev }: StepAdminAccountProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const getPasswordStrength = () => {
    const p = data.password;
    if (!p) return { label: 'Sin contraseña', score: 0, color: 'bg-slate-700' };
    if (p.length < 6) return { label: 'Muy débil (mínimo 6)', score: 1, color: 'bg-red-500' };
    if (p.length >= 8 && /[0-9]/.test(p) && /[a-zA-Z]/.test(p)) {
      return { label: 'Fuerte y segura', score: 3, color: 'bg-emerald-500' };
    }
    return { label: 'Aceptable', score: 2, color: 'bg-amber-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (data.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">2. Cuenta del Administrador Principal</h2>
        <p className="text-xs text-slate-400">
          Esta cuenta tendrá acceso total para administrar usuarios, inventarios, precios y configuraciones.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">
            Nombre Completo del Propietario / Gerente <span className="text-red-400">*</span>
          </Label>
          <Input
            placeholder="Ej: Carlos Andrés Meza"
            value={data.ownerName}
            onChange={(e) => updateData({ ownerName: e.target.value })}
            required
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Cargo en el Negocio</Label>
          <Input
            placeholder="Ej: Propietario / Gerente General"
            value={data.ownerRole}
            onChange={(e) => updateData({ ownerRole: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">
            Nombre de Usuario para Iniciar Sesión <span className="text-red-400">*</span>
          </Label>
          <Input
            placeholder="Ej: admin_carlos"
            value={data.username}
            onChange={(e) => updateData({ username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
            required
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
          <p className="text-[10px] text-slate-400">Solo letras, números y guión bajo.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">
            Correo Electrónico Principal <span className="text-red-400">*</span>
          </Label>
          <Input
            type="email"
            placeholder="contacto@ferreteria.com"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            required
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">
            Contraseña de Acceso <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => updateData({ password: e.target.value })}
              required
              minLength={6}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10 pr-10"
            />
            <button
              type="button"
              className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">Nivel de seguridad:</span>
            <span className="font-semibold text-slate-300">{strength.label}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">
            Confirmar Contraseña <span className="text-red-400">*</span>
          </Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={data.confirmPassword}
            onChange={(e) => updateData({ confirmPassword: e.target.value })}
            required
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2 text-xs bg-red-950/50 border-red-800 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button
          type="button"
          variant="ghost"
          onClick={onPrev}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Volver al paso 1</span>
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 h-11 shadow-lg shadow-blue-600/25"
        >
          <span>Siguiente: Preferencias de Inventario</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
