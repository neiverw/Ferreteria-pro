import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { PricingPlan, BillingCycle } from './types';

interface PricingCardProps {
  plan: PricingPlan;
  billingCycle: BillingCycle;
}

export function PricingCard({ plan, billingCycle }: PricingCardProps) {
  const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
  const isPopular = plan.popular;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
        isPopular
          ? 'border-2 border-blue-500 bg-slate-900 shadow-2xl shadow-blue-500/20 scale-100 lg:scale-105 z-10'
          : 'border border-slate-800 bg-slate-950/70 hover:border-slate-700'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
            Más Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
        <p className="mt-1 text-xs text-slate-400 min-h-[32px]">{plan.tagline}</p>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {formatCurrency(price)}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ mes</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {billingCycle === 'annual' ? 'Facturado anualmente (20% OFF)' : 'Facturación mensual'}
        </p>
      </div>

      <Link href="/register" className="w-full mb-6">
        <Button
          className={`w-full h-11 font-semibold text-sm ${
            isPopular
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
          }`}
        >
          {plan.ctaText}
        </Button>
      </Link>

      <div className="border-t border-slate-800/80 pt-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Incluye:
          </p>
          <ul className="space-y-2.5">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <div
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    feature.included
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Check className="h-3 w-3" />
                </div>
                <span className={feature.highlight ? 'font-semibold text-white' : ''}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
