"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RegisterFormData, BusinessType } from './types';
import { ArrowRight, Store, Building2, Zap, Truck, AlertCircle } from 'lucide-react';

interface StepBusinessInfoProps {
  data: RegisterFormData;
  updateData: (fields: Partial<RegisterFormData>) => void;
  onNext: () => void;
}

export function StepBusinessInfo({ data, updateData, onNext }: StepBusinessInfoProps) {
  const [error, setError] = useState('');

  const businessTypes: { id: BusinessType; title: string; desc: string; icon: React.ElementType }[] = [
    { id: 'ferreteria_general', title: 'Ferretería General', desc: 'Herramientas, tornillos, pinturas y mostrador', icon: Store },
    { id: 'deposito_materiales', title: 'Depósito de Materiales', desc: 'Cemento, arenas, varillas y obra pesada', icon: Building2 },
    { id: 'electricos_plomeria', title: 'Eléctricos & Plomería', desc: 'Cables, tubería PVC, accesorios y grifería', icon: Zap },
    { id: 'distribuidora_mayorista', title: 'Distribuidora Mayorista', desc: 'Venta por volumen, multi-bodega y rutas', icon: Truck },
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length === 0) {
      updateData({ phone: '' });
      return;
    }
    if (raw[0] !== '3') {
      setError('El número de celular en Colombia debe comenzar con el dígito 3.');
      return;
    }
    updateData({ phone: raw.slice(0, 10) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!data.storeName.trim()) {
      setError('El nombre de la ferretería es obligatorio.');
      return;
    }

    if (!data.phone || data.phone.length !== 10 || !data.phone.startsWith('3')) {
      setError('El número de celular debe comenzar con 3 y tener exactamente 10 dígitos (ej: 3101234567).');
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white">1. Información de tu Ferretería</h2>
        <p className="text-xs text-slate-400">Ingresa los datos comerciales de tu establecimiento en Colombia.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">
            Nombre Comercial <span className="text-red-400">*</span>
          </Label>
          <Input
            placeholder="Ej: Ferretería & Materiales El Roble"
            value={data.storeName}
            onChange={(e) => updateData({ storeName: e.target.value })}
            required
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">NIT o RUT</Label>
          <Input
            placeholder="Ej: 900.543.210-8 o Cédula"
            value={data.nit}
            onChange={(e) => updateData({ nit: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-300">Especialidad de la Ferretería</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {businessTypes.map((item) => {
            const Icon = item.icon;
            const isSelected = data.businessType === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => updateData({ businessType: item.id })}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-600/15 text-white ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{item.title}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Ciudad / Municipio</Label>
          <Input
            placeholder="Ej: Bogotá, Medellín, Cali..."
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-300">Dirección</Label>
          <Input
            placeholder="Ej: Calle 45 # 12 - 34"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold text-slate-300">
              Celular / WhatsApp <span className="text-red-400">*</span>
            </Label>
            <span className="text-[10px] text-slate-400 font-mono">
              {data.phone.length}/10 dígitos
            </span>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-xs font-bold text-slate-400 select-none">
              +57
            </span>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="310 123 4567"
              value={data.phone}
              onChange={handlePhoneChange}
              maxLength={10}
              required
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-10 pl-12 font-mono"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2 text-xs bg-red-950/50 border-red-800 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-800">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 h-11 shadow-lg shadow-blue-600/25">
          <span>Siguiente: Cuenta de Administrador</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
