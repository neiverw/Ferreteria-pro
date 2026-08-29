import React from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import { TestimonialItem } from './types';

export function LandingTestimonials() {
  const testimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Carlos Andrés Meza',
      storeName: 'Ferretería & Construcciones El Martillo',
      location: 'Bogotá, Colombia',
      initials: 'CM',
      growthMetric: '+42% en velocidad de despacho',
      quote: 'Antes tardábamos minutos buscando precios y perdiendo ventas en fila. Con Ferretería PRO los cajeros facturan en segundos y el stock cuadra al milímetro.',
      rating: 5,
    },
    {
      id: '2',
      name: 'Elena Morales',
      storeName: 'Depósito de Materiales La Sierra',
      location: 'Medellín, Colombia',
      initials: 'EM',
      growthMetric: 'Cero pérdidas por descuadres',
      quote: 'El control de fiados a contratistas y el sistema de alertas de stock mínimo salvaron mi rentabilidad. No imagino operar mi negocio sin esta suscripción.',
      rating: 5,
    },
    {
      id: '3',
      name: 'Javier Restrepo',
      storeName: 'Distribuciones Eléctricas & Plomería JR',
      location: 'Cali, Colombia',
      initials: 'JR',
      growthMetric: '15 hrs ahorradas cada semana',
      quote: 'El cambio a la nube nos permitió revisar ventas y compras desde cualquier lugar. El soporte es impecable y la interfaz es facilísima para el personal.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-slate-900/40 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full">
            Casos de Éxito Reales
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Más de 1.250 ferreteros confían diariamente en nuestro sistema
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Descubre cómo dueños y administradores han multiplicado sus ganancias y organizado sus inventarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-xl relative group hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-slate-700 group-hover:text-blue-500/40 transition-colors" />
                </div>
                <p className="text-sm text-slate-300 italic leading-relaxed mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs">
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.storeName}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> {item.growthMetric}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
