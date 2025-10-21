"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { cn } from './ui/utils';
import {
  AlertTriangle,
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  Package,
  User,
  Calendar,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useAuth, usePermissions } from './auth-context';
import { Product } from './inventory-dashboard';
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';

// Interfaces ajustadas a la DB
interface StockReport {
  id: string;
  report_number: string | null;
  product_id: string;
  reported_by: string;
  report_date: string;
  report_time: string;
  current_stock: number;
  reported_stock: number;
  priority: 'low' | 'medium' | 'high' | 'critical' | 'defective';
  status: 'pending' | 'reviewed' | 'resolved' | 'cancelled';
  notes: string | null;
  location: string | null;
  products: { name: string; categories: { name: string } | null } | null;
  reporter: { name: string } | null;
}

interface LowStockProduct extends Product {
  category_name: string | null;
  stock_status: 'critical' | 'low' | 'normal';
}

export function ReportsSystem() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const { user } = useAuth();
  const { userRole } = usePermissions();

  const [reports, setReports] = useState<StockReport[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('create'); // Estado para la pestaña activa
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [newReport, setNewReport] = useState({
    productId: '',
    reportedStock: '',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical' | 'defective'
  });

  const [selectedReport, setSelectedReport] = useState<StockReport | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    const { data: reportsData, error: reportsError } = await supabase
      .from('stock_reports')
      .select(`
        *,
        products (name, categories (name)),
        reporter:profiles!reported_by (name)
      `)
      .order('report_date', { ascending: false })
      .order('report_time', { ascending: false });

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');

    const { data: lowStockData, error: lowStockError } = await supabase
      .from('low_stock_products')
      .select('*');

    if (reportsError) {
      toast.error('Error al cargar los reportes.', { description: reportsError.message });
    } else {
      setReports(reportsData || []);
    }

    if (productsError) toast.error('Error al cargar los productos.');
    else setProducts(productsData || []);

    if (lowStockError) toast.error('Error al cargar alertas de stock.', { description: lowStockError.message });
    else setLowStockProducts(lowStockData || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [supabase]);

  // Métricas calculadas
  const criticalProducts = lowStockProducts.filter(p => p.stock_status === 'critical');
  const lowStockAlerts = lowStockProducts.filter(p => p.stock_status === 'low');
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  // Filtrar reportes para el historial
  const filteredReports = reports.filter(report => {
    const productName = report.products?.name || '';
    const reporterName = report.reporter?.name || '';
    const categoryName = report.products?.categories?.name || '';

    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateReport = async () => {
    if (!newReport.productId || newReport.reportedStock === '' || !user) {
      toast.error('Por favor completa todos los campos obligatorios.');
      return;
    }

    const product = products.find(p => p.id === newReport.productId);
    if (!product) return;

    // Generar un número de reporte único
    const reportNumber = `REP-${Date.now()}`;

    const { error } = await supabase.from('stock_reports').insert({
      report_number: reportNumber,
      product_id: product.id,
      reported_by: user.id,
      current_stock: product.stock,
      reported_stock: Number(newReport.reportedStock),
      priority: newReport.priority,
      notes: newReport.notes,
      location: product.location,
      status: 'pending'
    });

    if (error) {
      toast.error('Error al crear el reporte.', { description: error.message });
    } else {
      toast.success('Reporte creado exitosamente.');
      setNewReport({ productId: '', reportedStock: '', notes: '', priority: 'medium' });
      await fetchAllData(); // Recargar datos
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    const { error } = await supabase
      .from('stock_reports')
      .update({ status: newStatus, resolved_by: newStatus === 'resolved' ? user?.id : null, resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null })
      .eq('id', reportId);

    if (error) {
      toast.error('Error al actualizar el estado.', { description: error.message });
    } else {
      toast.success(`Reporte actualizado a "${newStatus}".`);
      await fetchAllData();
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive">Crítico</Badge>;
      case 'high': return <Badge variant="secondary" className="bg-orange-500 text-white">Alto</Badge>;
      case 'medium': return <Badge variant="secondary" className="bg-yellow-500 text-white">Medio</Badge>;
      case 'low': return <Badge variant="outline">Bajo</Badge>;
      case 'defective': return <Badge variant="destructive" className="bg-gray-900 text-white">Item Defectuoso</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pendiente</Badge>;
      case 'reviewed': return <Badge variant="secondary" className="bg-blue-500 text-white">Revisado</Badge>;
      case 'resolved': return <Badge variant="default" className="bg-green-600 text-white">Resuelto</Badge>;
      case 'cancelled': return <Badge variant="outline">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { variant: 'destructive' as const, text: 'Agotado' };
    if (stock <= minStock) return { variant: 'secondary' as const, text: 'Stock Bajo' };
    return { variant: 'default' as const, text: 'Disponible' };
  };

  if (loading) {
    return <div>Cargando sistema de reportes...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Agotados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalProducts.length}</div>
            <p className="text-xs text-muted-foreground">requieren reposición inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockAlerts.length}</div>
            <p className="text-xs text-muted-foreground">por debajo del mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReportsCount}</div>
            <p className="text-xs text-muted-foreground">esperando revisión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reportes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">reportes registrados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1">
          <TabsTrigger
            value="create"
            className={cn(
              "text-xs sm:text-sm",
              activeTab === 'create' && "bg-primary text-primary-foreground shadow-sm"
            )}
          >
            <span className="hidden sm:inline">Crear Reporte</span>
            <span className="sm:hidden">Crear</span>
          </TabsTrigger>
          <TabsTrigger
            value="alerts"
            className={cn(
              "text-xs sm:text-sm",
              activeTab === 'alerts' && "bg-primary text-primary-foreground shadow-sm"
            )}
          >
            <span className="hidden sm:inline">Alertas de Stock</span>
            <span className="sm:hidden">Alertas</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={cn(
              "text-xs sm:text-sm",
              activeTab === 'history' && "bg-primary text-primary-foreground shadow-sm"
            )}
          >
            <span className="hidden sm:inline">Historial de Reportes</span>
            <span className="sm:hidden">Historial</span>
          </TabsTrigger>
        </TabsList>

        {/* Crear nuevo reporte */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Reportar Novedad de Stock
              </CardTitle>
              <CardDescription>
                Informa sobre productos sin stock o con inventario crítico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Producto *</Label>
                  <Select value={newReport.productId} onValueChange={(value) => setNewReport({ ...newReport, productId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{product.name}</span>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant={getStockStatus(product.stock, product.min_stock).variant} className="text-xs">
                                Stock: {product.stock}
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportedStock">Stock Actual Contado *</Label>
                  <Input
                    id="reportedStock"
                    type="number"
                    min="0"
                    value={newReport.reportedStock}
                    onChange={(e) => setNewReport({ ...newReport, reportedStock: e.target.value })}
                    placeholder="Cantidad verificada físicamente"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad / Motivo</Label>
                <Select value={newReport.priority} onValueChange={(value: any) => setNewReport({ ...newReport, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja - Stock disponible pero bajo</SelectItem>
                    <SelectItem value="medium">Media - Stock muy bajo</SelectItem>
                    <SelectItem value="high">Alta - Stock crítico</SelectItem>
                    <SelectItem value="critical">Crítica - Producto agotado</SelectItem>
                    <SelectItem value="defective">Item Defectuoso - Producto con fallas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea
                  id="notes"
                  value={newReport.notes}
                  onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                  placeholder="Describe la situación, demanda del producto, clientes esperando, etc."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleCreateReport}
                disabled={!newReport.productId || newReport.reportedStock === ''}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Crear Reporte
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alertas de stock */}
        <TabsContent value="alerts" className="space-y-4 mt-4">
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Productos Agotados
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Productos con stock cero.</CardDescription>
              </CardHeader>
              <CardContent>
                {criticalProducts.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">¡Genial! No hay productos agotados.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                    {criticalProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 sm:p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{product.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{product.category_name} - {product.location}</div>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <Badge variant="destructive" className="text-xs">Agotado</Badge>
                          <div className="text-xs text-muted-foreground mt-1">Min: {product.min_stock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-600 text-base sm:text-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                  Stock Bajo
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Productos por debajo del stock mínimo.</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockAlerts.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">Todos los productos tienen stock adecuado.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                    {lowStockAlerts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-2 sm:p-3 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{product.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{product.category_name} - {product.location}</div>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <Badge variant="secondary" className="bg-orange-500 text-white text-xs">Stock: {product.stock}</Badge>
                          <div className="text-xs text-muted-foreground mt-1">Min: {product.min_stock}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Historial de reportes */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1 text-xs sm:text-sm h-9">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="reviewed">Revisado</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="flex-1 text-xs sm:text-sm h-9">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Historial de Reportes</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Todos los reportes de stock registrados.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Producto</TableHead>
                      <TableHead className="text-xs sm:text-sm">Reportado por</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Stock (Contado/Sist.)</TableHead>
                      <TableHead className="text-xs sm:text-sm">Prioridad</TableHead>
                      <TableHead className="text-xs sm:text-sm">Estado</TableHead>
                      <TableHead className="text-xs sm:text-sm">Fecha</TableHead>
                      <TableHead className="text-xs sm:text-sm">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="min-w-[150px]">
                          <div className="font-medium text-xs sm:text-sm">{report.products?.name || 'Producto no encontrado'}</div>
                          <div className="text-xs text-muted-foreground">{report.report_number || 'Sin número'}</div>
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{report.reporter?.name || 'Usuario desconocido'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <div className="text-center font-medium text-xs sm:text-sm">{report.reported_stock} / {report.current_stock}</div>
                        </TableCell>
                        <TableCell className="min-w-[100px]">{getPriorityBadge(report.priority)}</TableCell>
                        <TableCell className="min-w-[120px]">
                          {userRole === 'admin' ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex gap-1 items-center h-8 px-2 text-xs sm:text-sm">
                                  {getStatusBadge(report.status)}
                                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {report.status === 'pending' && <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'reviewed')}>Marcar como Revisado</DropdownMenuItem>}
                                {report.status === 'reviewed' && <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'resolved')}>Marcar como Resuelto</DropdownMenuItem>}
                                <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'cancelled')}>Cancelar Reporte</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            getStatusBadge(report.status)
                          )}
                        </TableCell>
                        <TableCell className="min-w-[100px]">
                          <div className="flex items-center gap-1 text-xs sm:text-sm">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            {new Date(report.report_date).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-muted-foreground">{report.report_time}</div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedReport(report);
                              setShowReportDialog(true);
                            }}
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredReports.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">No se encontraron reportes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para ver detalles del reporte */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Reporte</DialogTitle>
            <DialogDescription>
              {selectedReport?.report_number || 'Sin número de reporte'}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Información del producto */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Información del Producto
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Producto</p>
                    <p className="font-medium">{selectedReport.products?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="font-medium">{selectedReport.products?.categories?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium">{selectedReport.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock en Sistema</p>
                    <p className="font-medium text-blue-600">{selectedReport.current_stock} unidades</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Información del reporte */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Detalles del Reporte
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Contado</p>
                    <p className="font-medium text-orange-600">{selectedReport.reported_stock} unidades</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Diferencia</p>
                    <p className={`font-medium ${selectedReport.reported_stock !== selectedReport.current_stock ? 'text-destructive' : 'text-green-600'}`}>
                      {selectedReport.reported_stock - selectedReport.current_stock > 0 ? '+' : ''}{selectedReport.reported_stock - selectedReport.current_stock} unidades
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prioridad</p>
                    <div className="mt-1">{getPriorityBadge(selectedReport.priority)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Información del reportero */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Reportado Por
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuario</p>
                    <p className="font-medium">{selectedReport.reporter?.name || 'Usuario desconocido'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                    <p className="font-medium">
                      {new Date(selectedReport.report_date).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedReport.report_time}</p>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {selectedReport.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Observaciones</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedReport.notes}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Acciones (solo para admin) */}
              {userRole === 'admin' && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Acciones</h3>
                    <div className="flex gap-2">
                      {selectedReport.status === 'pending' && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            handleStatusChange(selectedReport.id, 'reviewed');
                            setShowReportDialog(false);
                          }}
                        >
                          Marcar como Revisado
                        </Button>
                      )}
                      {selectedReport.status === 'reviewed' && (
                        <Button
                          variant="default"
                          onClick={() => {
                            handleStatusChange(selectedReport.id, 'resolved');
                            setShowReportDialog(false);
                          }}
                        >
                          Marcar como Resuelto
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleStatusChange(selectedReport.id, 'cancelled');
                          setShowReportDialog(false);
                        }}
                      >
                        Cancelar Reporte
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}