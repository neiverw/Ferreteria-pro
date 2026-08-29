import React from 'react';
import { TrendingUp, Store, ShieldCheck, DollarSign } from 'lucide-react';

export function LandingStats() {
  const stats = [
    {
      icon: Store,
      value: '+1.250',
      label: 'Ferreterías y depósitos activos',
      highlight: 'en toda la región',
    },
    {
      icon: DollarSign,
      value: '$48M+',
      label: 'En ventas mensuales procesadas',
      highlight: 'con 0% errores de caja',
    },
    {
      icon: TrendingUp,
      value: '+35%',
      label: 'Incremento en rentabilidad',
      highlight: 'gracias al control de mermas',
    },
    {
      icon: ShieldCheck,
      value: '99.98%',
      label: 'Disponibilidad Cloud',
      highlight: 'backups diarios en la nube',
    },
  ];

  return (
    <section className="border-y border-slate-800 bg-slate-900/50 py-12 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-black text-white tracking-tight">{stat.value}</span>
                <p className="mt-1 text-sm font-semibold text-slate-200">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.highlight}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
