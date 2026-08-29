"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RegisterFormData, CatalogSize } from './types';
import { ArrowLeft, Sparkles, CheckSquare, Square, Loader2, PackageOpen, Printer, ScanBarcode } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StepStorePreferencesProps {
  data: RegisterFormData;
  updateData: (fields: Partial<RegisterFormData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isLoading: boolean;
  serverError?: string;
}

export function StepStorePreferences({
  data,
  updateData,
  onSubmit,
  onPrev,
  isLoading,
  serverError,
}: StepStorePreferencesProps) {
  const [termsError, setTermsError] = useState('');

  const catalogOptions: { id: CatalogSize; label: string; desc: string }[] = [
    { id: 'small', label: '1 a 500 productos', desc: 'Ferretería pequeña o tienda de barrio' },
    { id: 'medium', label: '500 a 2.500 productos', desc: 'Ferretería consolidada en crecimiento' },
    { id: 'large', label: 'Más de 2.500 productos', desc: 'Depósito grande o distribuidora' },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTermsError('');
    if (!data.acceptTerms) {
      setTermsError('Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">3. Configuración Inicial y Equipamiento</h2>
        <p className="text-xs text-slate-400">
          Personaliza tu espacio de trabajo para que el sistema se adapte a las necesidades exactas de tu mostrador.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-300">
          ¿Cuántos productos manejas aproximadamente?
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {catalogOptions.map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => updateData({ catalogSize: opt.id })}
              className={`p-3 rounded-xl border text-left transition-all ${
                data.catalogSize === opt.id
                  ? 'border-blue-500 bg-blue-600/15 text-white ring-1 ring-blue-500'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-white">{opt.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-slate-300">
          Equipos POS que tienes en tu mostrador (Opcional)
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateData({ hasBarcodeScanner: !data.hasBarcodeScanner })}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              data.hasBarcodeScanner
                ? 'border-blue-500 bg-blue-600/10 text-white'
                : 'border-slate-800 bg-slate-900/40 text-slate-400'
            }`}
          >
            <ScanBarcode className={`h-5 w-5 ${data.hasBarcodeScanner ? 'text-blue-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-semibold text-white">Lector de Código de Barras</div>
              <div className="text-[10px] text-slate-400">USB o inalámbrico</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateData({ hasThermalPrinter: !data.hasThermalPrinter })}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              data.hasThermalPrinter
                ? 'border-blue-500 bg-blue-600/10 text-white'
                : 'border-slate-800 bg-slate-900/40 text-slate-400'
            }`}
          >
            <Printer className={`h-5 w-5 ${data.hasThermalPrinter ? 'text-blue-400' : 'text-slate-500'}`} />
            <div>
              <div className="text-xs font-semibold text-white">Impresora Térmica de Recibos</div>
              <div className="text-[10px] text-slate-400">Formato 58mm o 80mm</div>
            </div>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <PackageOpen className="h-4 w-4" />
            <span>Precargar Catálogo Demo de Ferretería</span>
          </div>
          <button
            type="button"
            onClick={() => updateData({ preloadDemoData: !data.preloadDemoData })}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              data.preloadDemoData
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {data.preloadDemoData ? 'Activado' : 'Desactivado'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Carga automáticamente 30 productos populares (cemento, tubería PVC, herramientas Bosch, tornillería) con precios y códigos para que pruebes el POS de inmediato.
        </p>
      </div>

      <div className="space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={data.acceptTerms}
            onChange={(e) => updateData({ acceptTerms: e.target.checked })}
            className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
          />
          <span>
            Acepto los <strong className="text-white">Términos de Servicio</strong> y la{' '}
            <strong className="text-white">Política de Privacidad de Datos</strong> de Ferretería PRO.
          </span>
        </label>
      </div>

      {(termsError || serverError) && (
        <Alert variant="destructive" className="py-2 text-xs bg-red-950/50 border-red-800 text-red-300">
          <AlertDescription>{termsError || serverError}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button
          type="button"
          variant="ghost"
          disabled={isLoading}
          onClick={onPrev}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Volver al paso 2</span>
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-11 shadow-xl shadow-blue-600/30 text-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Configurando tu ferretería...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Crear Ferretería y Entrar al Sistema</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
