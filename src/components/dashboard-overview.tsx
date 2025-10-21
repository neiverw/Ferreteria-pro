import React, { useEffect, useState, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, DollarSign, Users, AlertTriangle, ShoppingCart } from 'lucide-react';
import { getColombiaFirstDayOfMonth } from '@/lib/date-utils';

type ProductCat = {
  id: string;
  category_id: string;
  name: string;
  price: number;
  stock: number;
  min_stock: number;
};

export function DashboardOverview() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [ventasMes, setVentasMes] = useState(0);
  const [productosVendidos, setProductosVendidos] = useState(0);
  const [clientesActivos, setClientesActivos] = useState(0);
  const [ticketPromedio, setTicketPromedio] = useState(0);
  const [salesData, setSalesData] = useState<{ month: string; sales: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number; revenue: number }[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<{ product: string; current: number; minimum: number; severity: string }[]>([]);


  
  useEffect(() => {
    const fetchMetrics = async () => {
      // Ventas del mes
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, total')
        .eq('status', 'paid')
        .gte('invoice_date', getColombiaFirstDayOfMonth());
      if (invoices) {
        const totalVentas = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
        setVentasMes(totalVentas);
        setTicketPromedio(invoices.length ? totalVentas / invoices.length : 0);
      }

      // Productos vendidos del mes
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('quantity, invoice_id');
      if (items && invoices) {
        const vendidos = items.filter((item: { invoice_id: string }) =>
          invoices.some((inv: { id: string }) => inv.id === item.invoice_id)
        );
        setProductosVendidos(vendidos.reduce((sum: number, item: { quantity: number }) => sum + Number(item.quantity), 0));
      }

      // Clientes activos
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id')
        .eq('is_active', true);
      if (customers) {
        setClientesActivos(customers.length);
      }

      // Tendencia de ventas por mes
      const { data: monthlyInvoices } = await supabase
        .from('invoices')
        .select('total, invoice_date')
        .eq('status', 'paid');
      if (monthlyInvoices) {
        const grouped = monthlyInvoices.reduce((acc: Record<string, number>, inv: { invoice_date?: string, total: number }) => {
          const month = inv.invoice_date?.slice(0, 7) ?? '';
          acc[month] = (acc[month] || 0) + Number(inv.total);
          return acc;
        }, {});
        setSalesData(
          Object.entries(grouped).map(([month, sales]) => ({ month, sales }))
        );
      }

      // Ventas por categoría y top productos vendidos
      const { data: itemsCat, error: itemsCatError } = await supabase
        .from('invoice_items')
        .select('product_id, quantity');
      const { data: productsCat } = await supabase
        .from('products')
        .select('id, category_id, name, price, stock, min_stock');
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name, color');
      if (itemsCat && productsCat && categories) {
        // Ventas por categoría
        const catSales: Record<string, number> = {};
        itemsCat.forEach((item: { product_id: string, quantity: number }) => {
          const prod = productsCat.find((p: ProductCat) => p.id === item.product_id);
          if (prod) {
            catSales[prod.category_id] = (catSales[prod.category_id] || 0) + Number(item.quantity);
          }
        });
        setCategoryData(
          categories.map((cat: { id: string, name: string, color: string | null }) => ({
            name: cat.name,
            value: catSales[cat.id] || 0,
            color: cat.color || '#cccccc' // Usar el color de la DB o un gris por defecto
          }))
        );

        // Top productos vendidos
        const prodSales: Record<string, { name: string; sales: number; revenue: number }> = {};
        itemsCat.forEach((item: { product_id: string, quantity: number }) => {
          const prod = productsCat.find((p: ProductCat) => p.id === item.product_id);
          if (prod) {
            if (!prodSales[prod.id]) {
              prodSales[prod.id] = { name: prod.name, sales: 0, revenue: 0 };
            }
            prodSales[prod.id].sales += Number(item.quantity);
            prodSales[prod.id].revenue += Number(item.quantity) * Number(prod.price);
          }
        });
        setTopProducts(
          Object.values(prodSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5)
        );

        // Alertas de stock bajo
        setLowStockAlerts(
          productsCat
            .filter((p: ProductCat) => Number(p.stock) <= Number(p.min_stock))
            .map((p: ProductCat) => ({
              product: p.name,
              current: Number(p.stock),
              minimum: Number(p.min_stock),
              severity: Number(p.stock) === 0 ? 'high' : 'medium'
            }))
        );
      }
    };
    fetchMetrics();
  }, [supabase]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ventasMes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productosVendidos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesActivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${ticketPromedio.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-full">
        {/* Gráfico de ventas */}
        <Card className="w-full max-w-full">
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
            <CardDescription>Ventas mensuales y productos vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.length > 0 ? salesData : [{ month: 'Sin datos', sales: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" name="Ventas ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por categorías */}
        <Card className="w-full max-w-full">
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
            <CardDescription>Distribución de ventas por tipo de producto</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                No hay ventas por categoría registradas.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Gráfica circular más pequeña */}
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Leyenda de categorías */}
                <div className="grid grid-cols-1 gap-2">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate">{category.name}</span>
                      </div>
                      <span className="font-medium ml-2">{category.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-full">
        {/* Productos más vendidos */}
        <Card className="w-full max-w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>Top 5 productos por volumen de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {product.sales} unidades vendidas
                    </div>
                    <Progress 
                      value={(product.sales / Math.max(...topProducts.map(p => p.sales))) * 100} 
                      className="mt-2 h-2"
                    />
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-medium">${product.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">ingresos</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de stock bajo */}
        <Card className="w-full max-w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Alertas de Inventario
            </CardTitle>
            <CardDescription>Productos que requieren reposición</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockAlerts.map((alert, index) => {
                const getSeverityBadge = (severity: string) => {
                  switch (severity) {
                    case 'high':
                      return <Badge variant="destructive">Crítico</Badge>;
                    case 'medium':
                      return <Badge variant="secondary">Medio</Badge>;
                    case 'low':
                      return <Badge variant="outline">Bajo</Badge>;
                    default:
                      return <Badge variant="outline">Normal</Badge>;
                  }
                };

                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{alert.product}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock actual: {alert.current} | Mínimo: {alert.minimum}
                      </div>
                      <Progress 
                        value={(alert.current / alert.minimum) * 100} 
                        className="mt-2 h-2"
                      />
                    </div>
                    <div className="ml-4">
                      {getSeverityBadge(alert.severity)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}