import React, { useState, useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Search, Plus, Edit, Eye, AlertTriangle, Lock, Trash2, ListTree } from 'lucide-react';
import { usePermissions } from './auth-context';
import { Label } from "./ui/label";

// --- CORRECCIÓN: Exportar la interfaz y añadir todas las propiedades que faltan ---
export interface Product {
  id: string;  // uuid en la DB
  code: string | null;
  name: string;
  description: string | null;
  category_id: string | null;
  supplier_id: string | null;
  brand: string | null;
  stock: number;
  min_stock: number;  // snake_case como en la DB
  price: number;
  cost: number | null;
  location: string | null;
  barcode: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
}

export function InventoryDashboard() {
  // --- CORRECCIÓN: Envolver la creación del cliente en useMemo ---
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [products, setProducts] = useState<Product[]>([]); // Estado para productos de la DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // --- FIX: Separar estados de diálogos y usar solo uno a la vez ---
  const [activeDialog, setActiveDialog] = useState<'add' | 'detail' | 'edit' | 'manageCategories' | 'addCategory' | 'editCategory' | 'confirmDeleteCategory' | null>(null);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: '',
    name: '',
    description: '',
    brand: '',
    stock: 0,
    min_stock: 0,
    price: 0,
    cost: 0,
    location: '',
    is_active: true
  });
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');
  
  // Estados para gestión de categorías
  const [newCategory, setNewCategory] = useState<{ name: string; description: string; color: string }>({ name: '', description: '', color: '#000000' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryColorError, setCategoryColorError] = useState<string | null>(null);

  const { userRole } = usePermissions();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(id, name),
            suppliers(id, name)
          `);

        if (error) throw error;
        if (data) setProducts(data);
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (data) setCategories(data);
    };
    loadProducts();
    loadCategories();
  }, [supabase]);

  const refreshCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    if (data) setCategories(data);
  };
  
  const isReadOnly = userRole === 'cajero';
  const canEdit = userRole === 'admin' || userRole === 'bodega';

  // --- Filtrar productos por categoría seleccionada ---
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategoryId === 'all' || product.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(product => product.stock <= product.min_stock);
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { variant: 'destructive' as const, text: 'Agotado' };
    if (stock <= minStock) return { variant: 'secondary' as const, text: 'Stock Bajo' };
    return { variant: 'default' as const, text: 'Disponible' };
  };

  // --- FIX: Cerrar todos los diálogos antes de abrir uno nuevo ---
  const openDialog = (dialogType: 'add' | 'detail' | 'edit' | 'manageCategories' | 'addCategory' | 'editCategory' | 'confirmDeleteCategory', data?: Product | Category) => {
    // Cerrar cualquier diálogo activo primero
    setActiveDialog(null);
    
    // Pequeño delay para asegurar que el estado se actualice
    setTimeout(() => {
      if (dialogType === 'detail' && data) {
        setSelectedProduct(data as Product);
      } else if (dialogType === 'edit' && data) {
        setEditProduct(data as Product);
      } else if (dialogType === 'addCategory') {
        setNewCategory({ name: '', description: '', color: '#000000' });
        setCategoryColorError(null); // Limpiar error
      } else if (dialogType === 'editCategory' && data) {
        setEditingCategory(data as Category);
        setCategoryColorError(null); // Limpiar error
      } else if (dialogType === 'confirmDeleteCategory' && data) {
        setCategoryToDelete(data as Category);
      }
      setActiveDialog(dialogType);
    }, 50);
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedProduct(null);
    setEditProduct(null);
    setEditingCategory(null);
    setCategoryToDelete(null);
  };

  // --- Al agregar producto ---
  const handleAddProduct = async () => {
    try {
      const { error: productError } = await supabase
        .from('products')
        .insert({
          ...newProduct,
          category_id: newProduct.category_id || null,
          supplier_id: null,
          brand: newProduct.brand || null,
          stock: Number(newProduct.stock) || 0,
          min_stock: Number(newProduct.min_stock) || 0,
          price: Number(newProduct.price) || 0,
          cost: newProduct.cost ? Number(newProduct.cost) : null,
          location: newProduct.location || null,
          is_active: true
        });

      if (productError) throw productError;

      closeDialog();
      // Recargar productos
      const { data: updatedProducts } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name),
          suppliers(id, name)
        `);
      
      if (updatedProducts) setProducts(updatedProducts);

      // Limpiar el formulario
      setNewProduct({ name: '', code: '', description: '', brand: '', stock: 0, min_stock: 0, price: 0, cost: 0, location: '', is_active: true, category_id: '' });

    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  // --- Funciones para gestionar categorías ---
  const handleAddCategory = async () => {
    setCategoryColorError(null);
    if (!newCategory.name.trim()) return;

    const colorExists = categories.some(cat => cat.color?.toLowerCase() === newCategory.color.toLowerCase());
    if (colorExists) {
      setCategoryColorError('Este color ya está en uso. Por favor, elige otro.');
      return;
    }

    const { error } = await supabase
      .from('categories')
      .insert({ name: newCategory.name, description: newCategory.description, color: newCategory.color });
    if (!error) {
      await refreshCategories();
      setActiveDialog('manageCategories');
    } else {
      console.error("Error al crear categoría:", error);
    }
  };

  const handleUpdateCategory = async () => {
    setCategoryColorError(null);
    if (!editingCategory) return;

    const colorExists = categories.some(
      cat => cat.id !== editingCategory.id && cat.color?.toLowerCase() === editingCategory.color?.toLowerCase()
    );
    if (colorExists) {
      setCategoryColorError('Este color ya está en uso. Por favor, elige otro.');
      return;
    }

    const { error } = await supabase
      .from('categories')
      .update({ name: editingCategory.name, description: editingCategory.description, color: editingCategory.color })
      .eq('id', editingCategory.id);
    if (!error) {
      await refreshCategories();
      setActiveDialog('manageCategories');
    } else {
      console.error("Error al actualizar categoría:", error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryToDelete.id);
    if (!error) {
      await refreshCategories();
      closeDialog(); // Cierra el diálogo de confirmación
    } else {
      console.error("Error al eliminar categoría:", error);
      alert("Error al eliminar la categoría. Es posible que esté siendo utilizada por uno o más productos.");
    }
  };


  if (loading) {
    return <div>Cargando inventario...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtro por categoría */}
      <div className="flex gap-2 items-center mb-2">
        <Label>Categoría:</Label>
        <select
          value={selectedCategoryId}
          onChange={e => setSelectedCategoryId(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">Todas</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <Button variant="outline" onClick={() => setSelectedCategoryId('all')}>Quitar filtro</Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">diferentes artículos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">valor total del stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">productos requieren reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent> 
            <div className="text-2xl font-bold">{new Set(categories.map(p => p.id)).size}</div>
            <p className="text-xs text-muted-foreground">categorías activas</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {userRole === 'admin' && (
            <Button variant="secondary" onClick={() => openDialog('manageCategories')}>
              <ListTree className="h-4 w-4 mr-2" />
              Gestionar Categorías
            </Button>
          )}
          {canEdit && (
            <Button onClick={() => openDialog('add')}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
          <CardDescription>
            {isReadOnly 
              ? 'Consulta las unidades disponibles de productos para ventas'
              : 'Gestiona el inventario de tu ferretería y controla las unidades disponibles'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>{isReadOnly ? 'Consultar' : 'Acciones'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.min_stock);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.brand}</div>
                      </div>
                    </TableCell>
                    <TableCell>{(product as any).categories?.name || 'Sin categoría'}</TableCell>
                    <TableCell>
                      <div className="font-medium">{product.stock} unidades</div>
                      <div className="text-sm text-muted-foreground">Mín: {product.min_stock}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.text}</Badge>
                    </TableCell>
                    <TableCell>${product.price.toLocaleString()}</TableCell>
                    <TableCell>{product.location}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog('detail', product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog('edit', product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- FIX: Diálogos separados con estados únicos --- */}
      
      {/* Diálogo Agregar Producto */}
      <Dialog open={activeDialog === 'add'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
            <DialogDescription>
              Complete los campos para agregar un nuevo producto al inventario
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={e => {
              e.preventDefault();
              handleAddProduct();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto*</Label>
              <Input 
                id="name"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input 
                id="code"
                value={newProduct.code || ''}
                onChange={e => setNewProduct({ ...newProduct, code: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial*</Label>
                <Input 
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Stock Mínimo*</Label>
                <Input 
                  id="min_stock"
                  type="number"
                  value={newProduct.min_stock}
                  onChange={e => setNewProduct({ ...newProduct, min_stock: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio de Venta*</Label>
                <Input 
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Costo</Label>
                <Input 
                  id="cost"
                  type="number"
                  value={newProduct.cost || ''}
                  onChange={e => setNewProduct({ ...newProduct, cost: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input 
                id="description"
                value={newProduct.description || ''}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input 
                id="brand"
                value={newProduct.brand || ''}
                onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input 
                id="location"
                value={newProduct.location || ''}
                onChange={e => setNewProduct({ ...newProduct, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select
                value={newProduct.category_id || ''}
                onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit">Guardar Producto</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo Detalles del Producto */}
      <Dialog open={activeDialog === 'detail'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
            <DialogDescription>
              Información detallada del producto y su inventario
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-lg">{selectedProduct.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Código</label>
                  <p>{selectedProduct.code}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Marca</label>
                  <p>{selectedProduct.brand}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Stock Actual</label>
                  <p className="text-2xl font-bold text-green-600">{selectedProduct.stock}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Stock Mínimo</label>
                  <p className="text-lg text-amber-600">{selectedProduct.min_stock}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Precio</label>
                  <p className="text-xl font-semibold">${selectedProduct.price.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Ubicación</label>
                  <p>{selectedProduct.location}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Producto */}
      <Dialog open={activeDialog === 'edit'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica los datos del producto y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
          {editProduct && (
            <form
              className="grid gap-4"
              onSubmit={async e => {
                e.preventDefault();
                if (!editProduct) return;

                const productToUpdate = {
                  name: editProduct.name,
                  code: editProduct.code,
                  description: editProduct.description,
                  brand: editProduct.brand,
                  location: editProduct.location,
                  stock: Number(editProduct.stock),
                  min_stock: Number(editProduct.min_stock),
                  price: Number(editProduct.price),
                  cost: Number(editProduct.cost),
                  category_id: editProduct.category_id,
                };

                const { error } = await supabase
                  .from('products')
                  .update(productToUpdate)
                  .eq('id', editProduct.id);

                if (!error) {
                  closeDialog();
                  const { data: updatedProducts } = await supabase
                    .from('products')
                    .select(`
                      *,
                      categories(id, name),
                      suppliers(id, name)
                    `);
                  if (updatedProducts) setProducts(updatedProducts);
                } else {
                  console.error("Error al actualizar:", error);
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="edit_name">Nombre del Producto*</Label>
                <Input
                  id="edit_name"
                  value={editProduct.name || ''}
                  onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_code">Código</Label>
                <Input
                  id="edit_code"
                  value={editProduct.code || ''}
                  onChange={e => setEditProduct({ ...editProduct, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_stock">Stock Inicial*</Label>
                  <Input 
                    id="edit_stock"
                    type="number"
                    value={editProduct.stock}
                    onChange={e => setEditProduct({ ...editProduct, stock: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_min_stock">Stock Mínimo*</Label>
                  <Input 
                    id="edit_min_stock"
                    type="number"
                    value={editProduct.min_stock}
                    onChange={e => setEditProduct({ ...editProduct, min_stock: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_price">Precio de Venta*</Label>
                  <Input 
                    id="edit_price"
                    type="number"
                    value={editProduct.price}
                    onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_cost">Costo</Label>
                  <Input 
                    id="edit_cost"
                    type="number"
                    value={editProduct.cost || ''}
                    onChange={e => setEditProduct({ ...editProduct, cost: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Descripción</Label>
                <Input 
                  id="edit_description"
                  value={editProduct.description || ''}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_brand">Marca</Label>
                <Input 
                  id="edit_brand"
                  value={editProduct.brand || ''}
                  onChange={e => setEditProduct({ ...editProduct, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_location">Ubicación</Label>
                <Input 
                  id="edit_location"
                  value={editProduct.location || ''}
                  onChange={e => setEditProduct({ ...editProduct, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <select
                  value={editProduct.category_id || ''}
                  onChange={e => setEditProduct({ ...editProduct, category_id: e.target.value })}
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit">Guardar Cambios</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo Gestionar Categorías */}
      <Dialog open={activeDialog === 'manageCategories'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Categorías</DialogTitle>
            <DialogDescription>Agrega, edita o elimina las categorías de productos.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => openDialog('addCategory')} className="mb-4">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }}></span>
                      {cat.name}
                    </div>
                  </TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog('editCategory', cat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDialog('confirmDeleteCategory', cat)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Diálogo Agregar Categoría */}
      <Dialog open={activeDialog === 'addCategory'} onOpenChange={(open) => !open && setActiveDialog('manageCategories')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nueva Categoría</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={e => { e.preventDefault(); handleAddCategory(); }}>
            <div className="space-y-2">
              <Label htmlFor="cat_name">Nombre*</Label>
              <Input id="cat_name" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat_desc">Descripción</Label>
              <Input id="cat_desc" value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat_color">Color</Label>
              <Input id="cat_color" type="color" value={newCategory.color} onChange={e => setNewCategory({ ...newCategory, color: e.target.value })} className="w-full h-10 p-1" />
              {categoryColorError && <p className="text-sm text-destructive">{categoryColorError}</p>}
            </div>
            <Button type="submit">Guardar Categoría</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Categoría */}
      <Dialog open={activeDialog === 'editCategory'} onOpenChange={(open) => !open && setActiveDialog('manageCategories')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <form className="grid gap-4" onSubmit={e => { e.preventDefault(); handleUpdateCategory(); }}>
              <div className="space-y-2">
                <Label htmlFor="edit_cat_name">Nombre*</Label>
                <Input id="edit_cat_name" value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_cat_desc">Descripción</Label>
                <Input id="edit_cat_desc" value={editingCategory.description || ''} onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_cat_color">Color</Label>
                <Input id="edit_cat_color" type="color" value={editingCategory.color || '#000000'} onChange={e => setEditingCategory({ ...editingCategory, color: e.target.value })} className="w-full h-10 p-1" />
                {categoryColorError && <p className="text-sm text-destructive">{categoryColorError}</p>}
              </div>
              <Button type="submit">Guardar Cambios</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo Confirmar Eliminación de Categoría */}
      <Dialog open={activeDialog === 'confirmDeleteCategory'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación Permanente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la categoría <strong>"{categoryToDelete?.name}"</strong>?
              Esta acción es irreversible y la categoría se borrará permanentemente. Si algún producto está usando esta categoría, podría causar un error.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}