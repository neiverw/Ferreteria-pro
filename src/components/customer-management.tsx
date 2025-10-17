import React, { useState, useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  FileText, 
  Calendar, 
  DollarSign,
  Package,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Pencil,
} from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
  document: number;
  document_type: 'CC' | 'NIT' | 'CE' | 'PASSPORT';
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  department: string | null;
  registration_date: string;
  is_active: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string; // <-- AÑADIR ESTA LÍNEA
  date: string;
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
  items: any[]; // O una interfaz más específica si la tienes
}

// --- SE ELIMINAN mockCustomers y mockCustomerInvoices ---

export function CustomerManagement() {
  // --- CORRECCIÓN: Envolver la creación del cliente en useMemo ---
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([]);
  const [loading, setLoading] = useState(true); // Estado para la carga inicial
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState<{
    name: string;
    document: number | null; // Permitir null para el estado inicial
    document_type: 'CC' | 'NIT' | 'CE' | 'PASSPORT';
    phone: string;
    email: string;
    address: string;
    city: string;
    department: string;
    notes: string;
    is_active: boolean;
  }>(
    {
      name: '',
      document: null, // Inicializar como null
      document_type: 'CC',
      phone: '',
      email: '',
      address: '',
      city: '',
      department: '',
      notes: '',
      is_active: true
    }
  );
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Omit<Customer, 'document'> & { document: number | null } | null>(null);

  // Cargar clientes y facturas desde Supabase al inicializar
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Obtener clientes
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (customersError) {
        console.error('Error fetching customers:', customersError);
      } else if (customersData) {
        // Mapear snake_case de la DB a camelCase de la UI
        const formattedCustomers = customersData.map(c => ({
          ...c,
          registrationDate: c.registration_date,
          totalPurchases: c.total_purchases,
          totalSpent: c.total_spent,
          lastPurchase: c.last_purchase,
        }));
        setCustomers(formattedCustomers);
      }

      // 2. Obtener facturas (opcional, pero recomendado)
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*)'); // Asume que tienes una tabla 'invoice_items'

      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
      } else if (invoicesData) {
         const formattedInvoices = invoicesData.map(inv => ({
          ...inv,
          customerId: inv.customer_id,
          invoiceNumber: inv.invoice_number,
          date: inv.invoice_date, // <-- Usa el campo correcto
          items: inv.items.map((item: any) => ({
            ...item,
            productName: item.product_name,
            unitPrice: item.unit_price,
          }))
        }));
        setCustomerInvoices(formattedInvoices);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]); // Añadir supabase a las dependencias

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.document.toString().includes(searchTerm) || // Convertir a string para buscar
    (customer.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerInvoices = (customerId: string) => {
    return customerInvoices.filter(invoice => invoice.customerId === customerId);
  };

  const getCustomerStats = (customerId: string) => {
    const invoices = getCustomerInvoices(customerId);
    const totalSpent = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalPurchases = invoices.length;
    const lastPurchase = invoices.length > 0 
      ? invoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : null;
    
    return { totalSpent, totalPurchases, lastPurchase };
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || newCustomer.document === null) return; // Validar que no sea null

    const newCustomerData = {
      name: newCustomer.name,
      document: newCustomer.document, // Ya es un número
      document_type: newCustomer.document_type,
      phone: newCustomer.phone || null,
      email: newCustomer.email || null,
      address: newCustomer.address || null,
      city: newCustomer.city || null,
      department: newCustomer.department || null,
      registration_date: new Date().toISOString().split('T')[0],
      is_active: true,
      notes: newCustomer.notes || null
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(newCustomerData)
      .select()
      .single();

    if (error) {
      console.error('Error adding customer:', error);
    } else if (data) {
      setCustomers([...customers, data]);
      setNewCustomer({
        name: '',
        document: null, // Resetear a null
        document_type: 'CC',
        phone: '',
        email: '',
        address: '',
        city: '',
        department: '',
        notes: '',
        is_active: true
      });
      setShowAddCustomer(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500">Pagada</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Indicador de carga
  if (loading) {
    return <div>Cargando clientes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Métricas de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerInvoices.length}</div>
            <p className="text-xs text-muted-foreground">facturas generadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customerInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">ventas acumuladas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Cliente</CardTitle> 
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customers.length > 0 ? Math.round(customerInvoices.reduce((sum, inv) => sum + inv.total, 0) / customers.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">gasto promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Registra un nuevo cliente en el sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="Nombre del cliente"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Documento *</Label>
                  <div className="grid grid-cols-2 gap-2 items-center ">
                      <select
                        className="col-span-1 border border-gray-300 rounded-md px-2 py-1"
                      value={newCustomer.document_type}
                      onChange={(e) => setNewCustomer({ 
                        ...newCustomer, 
                        document_type: e.target.value as 'CC' | 'NIT' | 'CE' | 'PASSPORT' 
                      })}
                    >
                      <option value="CC">CC</option>
                      <option value="NIT">NIT</option>
                      <option value="CE">CE</option>
                      <option value="PASSPORT">PASS</option>
                    </select>
                    <Input
                      className="col-span-2 w-full"
                      id="document"
                      value={newCustomer.document ?? ''} // Mostrar '' si es null
                      onChange={(e) => {
                        const value = e.target.value;
                        // Si el campo está vacío, establece null. Si no, conviértelo a número.
                        const numericValue = value === '' ? null : Number(value.replace(/\D/g, ''));
                        setNewCustomer({ ...newCustomer, document: numericValue });
                      }}
                      placeholder="Número de documento"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="300-123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={newCustomer.department}
                    onChange={(e) => setNewCustomer({ ...newCustomer, department: e.target.value })}
                    placeholder="Departamento"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="Dirección de residencia"
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Input
                    id="notes"
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                    placeholder="Notas adicionales"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddCustomer(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCustomer} disabled={!newCustomer.name || newCustomer.document === null}>
                  Agregar Cliente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de edición */}
        <Dialog open={showEditCustomer} onOpenChange={setShowEditCustomer}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>Modifica los datos del cliente.</DialogDescription>
            </DialogHeader>
            {editCustomer && (
              <form
                className="space-y-4"
                onSubmit={async e => {
                  e.preventDefault();
                  // Añadir una comprobación para asegurar que editCustomer y su documento existen
                  if (!editCustomer || editCustomer.document === null) {
                    console.error("El documento no puede estar vacío.");
                    return;
                  }
                  const { error } = await supabase
                    .from('customers')
                    .update({
                      name: editCustomer.name,
                      document: editCustomer.document, // Ahora TypeScript sabe que no es null
                      document_type: editCustomer.document_type,
                      phone: editCustomer.phone,
                      email: editCustomer.email,
                      address: editCustomer.address,
                      city: editCustomer.city,
                      department: editCustomer.department,
                      notes: editCustomer.notes,
                      is_active: editCustomer.is_active
                    })
                    .eq('id', editCustomer.id);
                  if (!error) {
                    setShowEditCustomer(false);
                    setEditCustomer(null);
                    // Recarga clientes
                    const { data: customersData } = await supabase
                      .from('customers')
                      .select('*')
                      .order('name');
                    if (customersData) setCustomers(customersData);
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre Completo *</Label>
                    <Input
                      id="edit-name"
                      value={editCustomer.name || ''}
                      onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                      placeholder="Nombre del cliente"
                      required
                    />
                  </div>
                  <div className="space-y-2 ">
                    <Label htmlFor="edit-document">Documento *</Label>
                    <div className="grid grid-cols-2 gap-2 items-center ">
                      <select
                        className="col-span-1 border border-gray-300 rounded-md px-2 py-1"
                        value={editCustomer.document_type}
                        onChange={(e) => setEditCustomer({ 
                          ...editCustomer, 
                          document_type: e.target.value as 'CC' | 'NIT' | 'CE' | 'PASSPORT' 
                        })}
                      >
                        <option value="CC">CC</option>
                        <option value="NIT">NIT</option>
                        <option value="CE">CE</option>
                        <option value="PASSPORT">PASS</option>
                      </select>
                      <Input
                        className="col-span-2 w-full"
                        id="edit-document"
                        value={editCustomer.document ?? ''} // Mostrar '' si es null
                        onChange={(e) => {
                          const value = e.target.value;
                          const numericValue = value === '' ? null : Number(value.replace(/\D/g, ''));
                          // Asegurarse de que editCustomer no sea null antes de actualizar
                          if (editCustomer) {
                            setEditCustomer({ ...editCustomer, document: numericValue });
                          }
                        }}
                        placeholder="Número de documento"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Teléfono</Label>
                    <Input
                      id="edit-phone"
                      value={editCustomer.phone ?? ''}
                      onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                      placeholder="300-123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editCustomer.email ?? ''}
                      onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                      placeholder="cliente@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Dirección</Label>
                    <Input
                      id="edit-address"
                      value={editCustomer.address ?? ''}
                      onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                      placeholder="Dirección de residencia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">Ciudad</Label>
                    <Input
                      id="edit-city"
                      value={editCustomer.city ?? ''}
                      onChange={(e) => setEditCustomer({ ...editCustomer, city: e.target.value })}
                      placeholder="Ciudad"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-department">Departamento</Label>
                    <Input
                      id="edit-department"
                      value={editCustomer.department ?? ''}
                      onChange={(e) => setEditCustomer({ ...editCustomer, department: e.target.value })}
                      placeholder="Departamento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Notas</Label>
                    <Input
                      id="edit-notes"
                      value={editCustomer.notes ?? ''}
                      onChange={(e) => setEditCustomer({ ...editCustomer, notes: e.target.value })}
                      placeholder="Notas adicionales"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditCustomer(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Clientes</CardTitle>
          <CardDescription>
            Administra los clientes y visualiza su historial de compras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead>Total Gastado</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Cliente desde {new Date(customer.registration_date).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.document}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {customer.email ?? 'No registrado'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{stats.totalPurchases} facturas</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${stats.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {stats.lastPurchase ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(stats.lastPurchase).toLocaleDateString('es-ES')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin compras</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground mb-1">Acciones</span>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCustomer(customer)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Perfil del Cliente</DialogTitle>
                                <DialogDescription>
                                  Información detallada y historial de compras
                                </DialogDescription>
                              </DialogHeader>
                              {selectedCustomer && (
                                <Tabs defaultValue="info" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">Información</TabsTrigger>
                                    <TabsTrigger value="history">Historial de Compras</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="info" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-sm font-medium">Nombre Completo</Label>
                                          <p className="text-lg">{selectedCustomer.name}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Documento</Label>
                                          <p>{selectedCustomer.document}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Fecha de Registro</Label>
                                          <p>{new Date(selectedCustomer.registration_date).toLocaleDateString('es-ES')}</p>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-sm font-medium">Teléfono</Label>
                                          <p>{selectedCustomer.phone || 'No registrado'}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Email</Label>
                                          <p>{selectedCustomer.email || 'No registrado'}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Dirección</Label>
                                          <p className="text-sm">{selectedCustomer.address || 'No registrada'}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">
                                          {getCustomerStats(selectedCustomer.id).totalPurchases}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Compras Realizadas</p>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">
                                          ${getCustomerStats(selectedCustomer.id).totalSpent.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Total Gastado</p>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">
                                          ${Math.round(getCustomerStats(selectedCustomer.id).totalSpent / Math.max(getCustomerStats(selectedCustomer.id).totalPurchases, 1)).toLocaleString()}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Promedio por Compra</p>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="history" className="space-y-4">
                                    <div className="space-y-4">
                                      {getCustomerInvoices(selectedCustomer.id).length === 0 ? (
                                        <div className="text-center py-8">
                                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                          <p className="text-muted-foreground">Este cliente no tiene compras registradas</p>
                                        </div>
                                      ) : (
                                        getCustomerInvoices(selectedCustomer.id)
                                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                          .map((invoice) => (
                                            <Card key={invoice.id}>
                                              <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                  <div>
                                                    <CardTitle className="text-base">{invoice.invoiceNumber}</CardTitle>
                                                    <CardDescription>
                                                      {new Date(invoice.date).toLocaleDateString('es-ES', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                      })}
                                                    </CardDescription>
                                                  </div>
                                                  <div className="text-right">
                                                    <div className="text-lg font-bold">${invoice.total.toLocaleString()}</div>
                                                    {getStatusBadge(invoice.status)}
                                                  </div>
                                                </div>
                                              </CardHeader>
                                              <CardContent>
                                                <div className="space-y-2">
                                                  {invoice.items.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between text-sm">
                                                      <div>
                                                        <span className="font-medium">{item.productName}</span>
                                                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                                                      </div>
                                                      <span>${item.total.toLocaleString()}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </CardContent>
                                            </Card>
                                          ))
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditCustomer(customer);
                              setShowEditCustomer(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}