"use client";

import React, { useState } from 'react';
import { PricingCard } from './PricingCard';
import { PricingPlan, BillingCycle } from './types';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export function LandingPricing() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  const plans: PricingPlan[] = [
    {
      id: 'basico',
      name: 'Ferre-Básico',
      tagline: 'Ideal para ferreterías de barrio o talleres comenzando su digitalización.',
      priceMonthly: 59000,
      priceAnnual: 47000,
      popular: false,
      ctaText: 'Comenzar con Plan Básico',
      ctaVariant: 'outline',
      features: [
        { text: '1 Punto de Venta (POS)', included: true },
        { text: 'Hasta 1.500 productos en inventario', included: true },
        { text: 'Alertas de stock mínimo', included: true },
        { text: 'Control de 1 usuario (Admin)', included: true },
        { text: 'Reportes de ventas diarios', included: true },
        { text: 'Soporte estándar por correo', included: true },
        { text: 'Múltiples sucursales', included: false },
        { text: 'Acceso a API de integraciones', included: false },
      ],
    },
    {
      id: 'pro',
      name: 'Ferre-PRO',
      badge: 'Más Popular',
      tagline: 'Para ferreterías consolidadas que requieren máxima velocidad y control.',
      priceMonthly: 119000,
      priceAnnual: 95000,
      popular: true,
      ctaText: 'Probar Ferre-PRO Gratis',
      ctaVariant: 'default',
      features: [
        { text: 'Puntos de Venta (POS) Ilimitados', included: true, highlight: true },
        { text: 'Inventario ilimitado de productos', included: true, highlight: true },
        { text: 'Gestión completa de proveedores y compras', included: true },
        { text: 'Control de cartera y crédito de clientes', included: true },
        { text: 'Hasta 5 usuarios con roles (Admin, Caja, Bodega)', included: true, highlight: true },
        { text: 'Analítica financiera & balance diario en vivo', included: true },
        { text: 'Alertas automáticas de reposición', included: true },
        { text: 'Soporte prioritario por WhatsApp y soporte 1-a-1', included: true },
      ],
    },
    {
      id: 'empresarial',
      name: 'Ferre-Empresarial',
      tagline: 'Para depósitos de materiales, distribuidoras y cadenas multi-sucursal.',
      priceMonthly: 239000,
      priceAnnual: 191000,
      popular: false,
      ctaText: 'Comenzar con Enterprise',
      ctaVariant: 'outline',
      features: [
        { text: 'Multi-sucursal y multi-bodega en tiempo real', included: true, highlight: true },
        { text: 'Usuarios y cajeros ilimitados', included: true, highlight: true },
        { text: 'Traslados entre bodegas con validación', included: true },
        { text: 'API completa para integración e-commerce / ERP', included: true },
        { text: 'Copias de seguridad automáticas cada hora', included: true },
        { text: 'Gerente de cuenta dedicado y capacitación VIP', included: true },
        { text: 'Reportes contables personalizados', included: true },
        { text: 'SLA de disponibilidad garantizado 99.99%', included: true },
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 px-3.5 py-1 rounded-full">
            Planes y Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Precios transparentes y sin letras pequeñas
          </h2>
          <p className="text-slate-400 text-base">
            Elige el plan perfecto para tu ferretería o depósito de materiales.
          </p>

          {/* Billing switcher toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Mensual
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-slate-700 bg-slate-800 transition-colors focus:outline-none"
              aria-label="Alternar ciclo de facturación"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-blue-500 shadow-lg ring-0 transition duration-200 ease-in-out ${
                  billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-0.5'
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>
                Anual
              </span>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                Ahorra 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingCycle={billingCycle}
            />
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Garantía de Satisfacción Total</h4>
              <p className="text-xs text-slate-400">Migración asistida de tu catálogo en Excel sin costo adicional.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span>¿Preguntas sobre compatibilidad POS? Nuestro equipo te asesora.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
