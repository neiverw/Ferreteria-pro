import React, { useEffect, useState, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { useAuth } from './auth-context';
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
  const { user } = useAuth();
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
      // 1. Obtener facturas activas filtradas por tienda
      let invoicesQuery = supabase
        .from('invoices')
        .select('id, total, status, invoice_date')
        .neq('status', 'cancelled');

      if (user?.storeId) {
        invoicesQuery = invoicesQuery.eq('store_id', user.storeId);
      }

      const { data: invoices } = await invoicesQuery;
      const allStoreInvoices = invoices || [];
      const invoiceIds = new Set(allStoreInvoices.map(inv => inv.id));

      // Ventas del mes actual
      const currentMonthPrefix = getColombiaFirstDayOfMonth().slice(0, 7);
      const monthInvoices = allStoreInvoices.filter(inv => {
        const d = inv.invoice_date || '';
        return d.startsWith(currentMonthPrefix) || d >= getColombiaFirstDayOfMonth();
      });

      const totalVentas = monthInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
      setVentasMes(totalVentas);
      setTicketPromedio(monthInvoices.length ? totalVentas / monthInvoices.length : 0);

      // 2. Productos vendidos del mes
      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*');

      if (itemsError) {
        console.error('Error cargando invoice_items en dashboard:', itemsError);
      }

      const storeItems = (items || []).filter(item => item.invoice_id && invoiceIds.has(item.invoice_id));
      const monthInvoiceIds = new Set(monthInvoices.map(inv => inv.id));
      const monthItems = storeItems.filter(item => item.invoice_id && monthInvoiceIds.has(item.invoice_id));

      setProductosVendidos(
        monthItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
      );

      // 3. Clientes activos filtrados por tienda
      let customersQuery = supabase
        .from('customers')
        .select('id')
        .eq('is_active', true);

      if (user?.storeId) {
        customersQuery = customersQuery.eq('store_id', user.storeId);
      }

      const { data: customers } = await customersQuery;
      setClientesActivos(customers?.length || 0);

      // 4. Tendencia de ventas por mes filtrada por tienda
      if (allStoreInvoices.length > 0) {
        const grouped = allStoreInvoices.reduce((acc: Record<string, number>, inv) => {
          const month = inv.invoice_date ? inv.invoice_date.slice(0, 7) : currentMonthPrefix;
          acc[month] = (acc[month] || 0) + Number(inv.total || 0);
          return acc;
        }, {});

        setSalesData(
          Object.entries(grouped).map(([month, sales]) => ({ month, sales }))
        );
      } else {
        setSalesData([]);
      }

      // 5. Productos y categorías filtrados por tienda
      let prodQuery = supabase
        .from('products')
        .select('id, category_id, name, price, stock, min_stock');

      let catQuery = supabase
        .from('categories')
        .select('id, name, color');

      if (user?.storeId) {
        prodQuery = prodQuery.eq('store_id', user.storeId);
        catQuery = catQuery.eq('store_id', user.storeId);
      }

      const [{ data: productsCat }, { data: categories }] = await Promise.all([
        prodQuery,
        catQuery
      ]);

      const prodsList = productsCat || [];
      const catsList = categories || [];
      const categoryMap = new Map(catsList.map(c => [c.id, c]));

      // Top productos vendidos
      const prodSales: Record<string, { name: string; sales: number; revenue: number }> = {};
      storeItems.forEach(item => {
        const prod = prodsList.find(p => p.id === item.product_id);
        const prodName = prod?.name || item.product_name || 'Producto';
        const prodId = item.product_id || prod?.id || 'prod';
        const prodPrice = prod?.price || item.unit_price || 0;

        if (!prodSales[prodId]) {
          prodSales[prodId] = { name: prodName, sales: 0, revenue: 0 };
        }
        prodSales[prodId].sales += Number(item.quantity || 0);
        prodSales[prodId].revenue += Number(item.quantity || 0) * Number(prodPrice);
      });

      setTopProducts(
        Object.values(prodSales)
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5)
      );

      // Ventas por categoría
      const catSales: Record<string, { name: string; value: number; color: string }> = {};
      const defaultColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];
      let colorIndex = 0;

      storeItems.forEach(item => {
        const prod = prodsList.find(p => p.id === item.product_id);
        const catId = prod?.category_id || 'general';
        const catObj = prod?.category_id ? categoryMap.get(prod.category_id) : null;
        const catName = catObj?.name || 'General / Varios';
        const catColor = catObj?.color || defaultColors[colorIndex % defaultColors.length];

        if (!catSales[catId]) {
          catSales[catId] = { name: catName, value: 0, color: catColor };
          colorIndex++;
        }
        catSales[catId].value += Number(item.quantity || 0);
      });

      const validCatData = Object.values(catSales).filter(c => c.value > 0);
      setCategoryData(validCatData);

      // Alertas de stock bajo
      setLowStockAlerts(
        prodsList
          .filter(p => Number(p.stock) <= Number(p.min_stock))
          .map(p => ({
            product: p.name,
            current: Number(p.stock),
            minimum: Number(p.min_stock),
            severity: Number(p.stock) === 0 ? 'high' : 'medium'
          }))
      );
    };

    fetchMetrics();

    // Suscripción en Tiempo Real
    const channel = supabase
      .channel('realtime_dashboard_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoice_items' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => fetchMetrics())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.storeId]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de ventas */}
        <Card>
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
        <Card>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>Top 5 productos por volumen de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                No hay productos vendidos registrados todavía.
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Alertas de stock bajo */}
        <Card>
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
