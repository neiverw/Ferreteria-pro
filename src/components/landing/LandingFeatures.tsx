import React from 'react';
import { 
  Package, 
  FileText, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Boxes, 
  Clock 
} from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      icon: Package,
      title: 'Inventario Inteligente',
      description: 'Alertas automáticas de stock mínimo, gestión por códigos de barras, marcas y cálculo de costos en tiempo real.',
      badge: 'Cero Mermas',
    },
    {
      icon: Zap,
      title: 'Punto de Venta Ultrarrápido',
      description: 'Facturación en segundos diseñada para mostradores de ferretería con alto flujo. Compatible con lectores y gavetas.',
      badge: 'Alta Velocidad',
    },
    {
      icon: Users,
      title: 'Crédito y Cartera de Clientes',
      description: 'Lleva el control de fiados a contratistas y maestros de obra con límites de crédito y recordatorios de cobro.',
      badge: 'Fidelización',
    },
    {
      icon: Boxes,
      title: 'Gestión de Proveedores',
      description: 'Historial de compras, comparación de precios entre distribuidores y gestión organizada de órdenes de compra.',
      badge: 'Compras Óptimas',
    },
    {
      icon: BarChart3,
      title: 'Reportes y Analítica en Vivo',
      description: 'Métricas de rentabilidad por producto, balance diario de caja y reportes exportables a PDF y Excel al instante.',
      badge: 'Decisiones Claras',
    },
    {
      icon: ShieldCheck,
      title: 'Roles y Seguridad Total',
      description: 'Control de accesos diferenciado para Administrador, Cajero y Bodega. Tus datos blindados en la nube.',
      badge: 'Seguridad Cloud',
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3.5 py-1 text-xs font-bold text-blue-400 uppercase tracking-wider">
            Diseñado para el Negocio Ferretero
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Todo lo que tu ferretería necesita para operar en piloto automático
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Olvídate de cuadernos, hojas de Excel desactualizadas y pérdidas inexplicables. Ferretería PRO centraliza cada aspecto de tu negocio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
