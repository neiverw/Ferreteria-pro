import React from 'react';
import { RegisterFormData } from './types';
import { Store, ShieldCheck, Zap, HelpCircle, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';

interface RegisterSidebarSummaryProps {
  data: RegisterFormData;
}

export function RegisterSidebarSummary({ data }: RegisterSidebarSummaryProps) {
  const getBusinessTypeName = () => {
    switch (data.businessType) {
      case 'ferreteria_general': return 'Ferretería General';
      case 'deposito_materiales': return 'Depósito de Materiales';
      case 'electricos_plomeria': return 'Eléctricos & Plomería';
      case 'distribuidora_mayorista': return 'Distribuidora Mayorista';
      default: return 'Ferretería';
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Store className="h-4 w-4 text-blue-400" />
            <span>Ficha del Establecimiento</span>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
            Nuevo Registro
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">Nombre Comercial:</span>
            <p className="text-sm font-bold text-white truncate">
              {data.storeName || 'Tu Ferretería'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 text-[11px]">Tipo de Negocio:</span>
              <p className="font-semibold text-slate-200">{getBusinessTypeName()}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">Ubicación:</span>
              <p className="font-semibold text-slate-200 truncate">{data.city || 'No especificada'}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 text-[11px]">Administrador Principal:</span>
            <p className="font-semibold text-white truncate">
              {data.ownerName || 'Administrador'} {data.username ? `(@${data.username})` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Benefits checklist */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-6 space-y-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Lo que obtienes al crear tu cuenta:
        </h4>
        <ul className="space-y-2.5 text-xs text-slate-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Acceso completo e inmediato al módulo POS y Facturación.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Control de inventario con alertas de stock mínimo.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Importador masivo desde Excel con plantilla asistida.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Base de datos en la nube con copias de seguridad automáticas.</span>
          </li>
        </ul>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
          <span>Información 100% protegida y encriptada.</span>
        </div>
      </div>
    </div>
  );
}
