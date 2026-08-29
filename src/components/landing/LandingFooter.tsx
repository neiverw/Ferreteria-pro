import React from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs sm:text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-base font-black text-white tracking-tight">FERRETERÍA PRO</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma SaaS de gestión de inventarios, facturación POS y administración para ferreterías modernas.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistemas operando al 100%</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Producto</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Punto de Venta POS</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Control de Inventario</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Cuentas por Cobrar & Clientes</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Planes y Precios</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Recursos</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentación de la API</Link></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Casos de Éxito</a></li>
              <li><span className="text-slate-500 cursor-not-allowed">Guías de Optimización Ferretera</span></li>
            </ul>
          </div>

          {/* Contact & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Contacto y Soporte</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>contacto@ferreteriapro.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span>+57 (300) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Encriptación SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Ferretería PRO Cloud. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Términos de Servicio</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacidad de Datos</span>
            <span className="hover:text-slate-400 cursor-pointer">Seguridad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
