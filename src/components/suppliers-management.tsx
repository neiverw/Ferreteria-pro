import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { TableSkeleton } from './ui/table-skeleton';
import { Pencil, Trash2, Plus, Search, Package } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string | null;
}

interface Product {
  id: string;
  code: string | null;
  name: string;
  brand: string | null;
  stock: number;
  cost: number | null;
  price: number | null;
  created_at: string;
}

export function SuppliersManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  // Caché de productos por proveedor
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>({});
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      toast("No se pudieron cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = currentSupplier 
        ? `/api/suppliers/${currentSupplier.id}`
        : '/api/suppliers';
      const method = currentSupplier ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast(currentSupplier ? "Proveedor actualizado correctamente" : "Proveedor creado correctamente");
        setIsDialogOpen(false);
        fetchSuppliers();
        resetForm();
      }
    } catch (error) {
      toast("No se pudo guardar el proveedor");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
      try {
        const response = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast("Proveedor eliminado correctamente");
          fetchSuppliers();
        }
      } catch (error) {
        toast("No se pudo eliminar el proveedor");
      }
    }
  };

  const handleViewProducts = async (supplier: Supplier) => {
    try {
      setCurrentSupplier(supplier);
      
      // Verificar si ya tenemos los productos en caché
      if (productsCache[supplier.id]) {
        setProducts(productsCache[supplier.id]);
        setIsProductsDialogOpen(true);
        return;
      }
      
      // Si no están en caché, cargarlos
      setLoadingProducts(true);
      setIsProductsDialogOpen(true);
      
      const res = await fetch(`/api/suppliers/${supplier.id}/products`);
      const data = await res.json();
      
      // Guardar en caché
      setProductsCache(prev => ({ ...prev, [supplier.id]: data }));
      setProducts(data);
    } catch {
      toast("No se pudieron cargar los productos de este proveedor");
    } finally {
      setLoadingProducts(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', contact_name: '', phone: '', email: '', address: '' });
    setCurrentSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_name: supplier.contact_name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setIsDialogOpen(true);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currency = (n: number | null) =>
    n !== null ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(n) : '-';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <CardTitle className="text-xl font-bold">Gestión de Proveedores</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nombre de Contacto</Label>
                  <Input id="contact_name" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{currentSupplier ? 'Actualizar' : 'Crear'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {/* Buscador */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabla */}
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_name}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
                                                <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewProducts(supplier)}
                        aria-label="Ver productos"
                      >
                        <Package className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No se encontraron proveedores
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de productos del proveedor */}
      <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Productos de {currentSupplier?.name}</DialogTitle>
          </DialogHeader>

          {loadingProducts ? (
            <TableSkeleton rows={3} columns={6} />
          ) : products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.code}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>{currency(p.cost)}</TableCell>
                    <TableCell>{currency(p.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No hay productos registrados para este proveedor.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}