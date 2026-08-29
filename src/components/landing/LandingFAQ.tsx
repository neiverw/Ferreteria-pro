"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from './types';

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: '¿Cómo funciona la prueba gratuita de 14 días?',
      answer: 'Tienes acceso total e ilimitado a todas las funciones del Plan PRO sin necesidad de ingresar tarjeta de crédito. Al finalizar los 14 días puedes elegir el plan de suscripción que mejor se adapte a tu ferretería.',
    },
    {
      id: '2',
      question: '¿Puedo importar mi inventario actual desde Excel?',
      answer: '¡Sí! Contamos con un asistente de importación que te permite cargar miles de productos con sus códigos de barras, precios y stock en menos de 2 minutos desde una plantilla estándar de Excel.',
    },
    {
      id: '3',
      question: '¿Qué hardware o equipos necesito para usar el sistema?',
      answer: 'Cualquier computador (Windows, Mac o Linux) o tablet con conexión a internet. Es 100% compatible con lectores de código de barras USB/Bluetooth e impresoras térmicas de recibos de 58mm y 80mm.',
    },
    {
      id: '4',
      question: '¿Cómo es el modelo de suscripción y métodos de pago?',
      answer: 'Funciona exactamente como Adobe o Netflix. Pagas una tarifa fija mensual o anual (con 20% de descuento) mediante tarjeta de crédito, débito, transferencia bancaria o PSE. Sin contratos forzosos ni penalizaciones de cancelación.',
    },
    {
      id: '5',
      question: '¿Mis datos e inventarios están respaldados y seguros?',
      answer: 'Absolutamente. Toda la información está encriptada con estándares bancarios en la nube de Supabase/AWS con copias de seguridad automatizadas diarias. Si tu computador se daña, tus datos siguen 100% a salvo.',
    },
    {
      id: '6',
      question: '¿Puedo cambiar de plan o añadir más usuarios más adelante?',
      answer: 'Sí, puedes escalar o cambiar entre planes Básico, PRO y Empresarial en cualquier momento desde tu panel de configuración con ajuste automático de cobro.',
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-slate-950 border-t border-slate-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 px-3.5 py-1 rounded-full">
            Resolvemos tus dudas
          </span>
          <h2 className="text-3xl font-extrabold text-white">Preguntas Frecuentes</h2>
          <p className="text-slate-400 text-sm">
            Todo lo que necesitas saber antes de empezar a digitalizar tu ferretería.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-colors hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between p-5 text-left font-semibold text-white transition-all text-sm sm:text-base"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-blue-400 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 mt-1">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
