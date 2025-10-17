import React, { useState, useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Product } from './inventory-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Plus, Minus, Trash2, FileText, Calculator, CheckCircle, ChevronsUpDown, Eye, Download, Edit, Search, RefreshCw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from './ui/command';
import { Customer, CustomerInvoice } from './customer-management';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';

// Actualizar las interfaces
interface InvoiceItem {
  product: Product;
  quantity: number;
  unit_price: number;
  total: number; // Este total es solo para la UI
  discount: number;
}

interface CurrentInvoice {
  customer_id: string | null;
  customerName: string;
  customerDocument: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  notes?: string;
}

// Funciones de traducción
const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagada',
    'cancelled': 'Cancelada',
    'overdue': 'Vencida'
  };
  return translations[status] || status;
};

const translatePaymentMethod = (method: string): string => {
  const translations: Record<string, string> = {
    'cash': 'Efectivo',
    'card': 'Tarjeta',
    'transfer': 'Transferencia',
    'credit': 'Crédito'
  };
  return translations[method] || method;
};

// Add an extended interface for invoices with customer data
interface ExtendedCustomerInvoice extends CustomerInvoice {
  customerName: string;
  customerDocument: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
}

export function BillingSystem() {
  const { settings: systemSettings, loading: settingsLoading } = useSystemSettings();
  // --- CORRECCIÓN: Envolver la creación del cliente en useMemo ---
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<ExtendedCustomerInvoice[]>([]);
  const [allInvoices, setAllInvoices] = useState<ExtendedCustomerInvoice[]>([]); // Update type here
  const [loading, setLoading] = useState(true);
  const [defaultTaxRate, setDefaultTaxRate] = useState(16.0); // Estado para el IVA

  // Nuevo estado para el buscador de facturas
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Modificar el estado inicial para usar la configuración del sistema
  const [currentInvoice, setCurrentInvoice] = useState<CurrentInvoice>({
    customer_id: null,
    customerName: '',
    customerDocument: '',
    items: [],
    subtotal: 0,
    tax_rate: 16.00, // Se actualizará desde la BD
    tax_amount: 0,
    discount: 0,
    total: 0,
    status: 'pending',
    payment_method: 'cash'
  });

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isCustomerComboboxOpen, setIsCustomerComboboxOpen] = useState(false);
  const [isProductComboboxOpen, setIsProductComboboxOpen] = useState(false);

  // 1. Primero, agregar el hook para obtener el usuario
  const [user, setUser] = useState<any>(null);

  // Agregar estos estados
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showEditStatusDialog, setShowEditStatusDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  // Función para cargar facturas - CORREGIDA PARA BÚSQUEDA EN ESPAÑOL
  const loadInvoices = async (searchTerm: string = '') => {
    setInvoicesLoading(true);
    try {
      // Sin búsqueda, cargar normalmente
      if (!searchTerm.trim()) {
        const { data: invoicesData, error } = await supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            customer_id,
            invoice_date,
            subtotal,
            tax_amount,
            total,
            status,
            payment_method,
            customers(name, document)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        const formattedInvoices = invoicesData?.map((inv: any) => ({
          ...inv,
          customerName: inv.customers?.name || 'N/A',
          customerDocument: inv.customers?.document || 'N/A',
          invoiceNumber: inv.invoice_number,
          customerId: inv.customer_id,
          date: inv.invoice_date
        })) || [];

        setRecentInvoices(formattedInvoices.slice(0, 5));
        setAllInvoices(formattedInvoices);
        return;
      }

      // Con búsqueda, hacer consultas separadas
      const escapedTerm = searchTerm.trim().toLowerCase();
      const searchPromises = [];

      // Función para traducir términos de español a inglés
      const translateSearchTerm = (term: string): string[] => {
        const translations: Record<string, string> = {
          'pagada': 'paid',
          'pagado': 'paid',
          'pendiente': 'pending',
          'cancelada': 'cancelled',
          'cancelado': 'cancelled',
          'vencida': 'overdue',
          'vencido': 'overdue'
        };
        
        // Buscar traducciones exactas y también incluir el término original
        const results = [term];
        
        Object.keys(translations).forEach(spanishTerm => {
          if (term.includes(spanishTerm)) {
            results.push(translations[spanishTerm]);
          }
        });
        
        return results;
      };

      const searchTerms = translateSearchTerm(escapedTerm);

      // Buscar por número de factura
      searchPromises.push(
        supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            customer_id,
            invoice_date,
            subtotal,
            tax_amount,
            total,
            status,
            payment_method,
            customers(name, document)
          `)
          .ilike('invoice_number', `%${escapedTerm}%`)
          .order('created_at', { ascending: false })
          .limit(20)
      );

      // Buscar por estado - usando términos traducidos
      for (const term of searchTerms) {
        searchPromises.push(
          supabase
            .from('invoices')
            .select(`
              id,
              invoice_number,
              customer_id,
              invoice_date,
              subtotal,
              tax_amount,
              total,
              status,
              payment_method,
              customers(name, document)
            `)
            .ilike('status', `%${term}%`)
            .order('created_at', { ascending: false })
            .limit(20)
        );
      }

      // Buscar por fecha (formato texto)
      searchPromises.push(
        supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            customer_id,
            invoice_date,
            subtotal,
            tax_amount,
            total,
            status,
            payment_method,
            customers(name, document)
          `)
          .ilike('invoice_date', `%${escapedTerm}%`)
          .order('created_at', { ascending: false })
          .limit(20)
      );

      // Buscar por nombre de cliente
      searchPromises.push(
        supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            customer_id,
            invoice_date,
            subtotal,
            tax_amount,
            total,
            status,
            payment_method,
            customers!inner(name, document)
          `)
          .ilike('customers.name', `%${escapedTerm}%`)
          .order('created_at', { ascending: false })
          .limit(20)
      );

      // Buscar por documento de cliente
      searchPromises.push(
        supabase
          .from('invoices')
          .select(`
            id,
            invoice_number,
            customer_id,
            invoice_date,
            subtotal,
            tax_amount,
            total,
            status,
            payment_method,
            customers!inner(name, document)
          `)
          .ilike('customers.document', `%${escapedTerm}%`)
          .order('created_at', { ascending: false })
          .limit(20)
      );

      // Ejecutar todas las búsquedas
      const results = await Promise.all(searchPromises);
      const allResults: any[] = [];

      // Combinar todos los resultados
      results.forEach(({ data }) => {
        if (data) {
          allResults.push(...data);
        }
      });

      // Eliminar duplicados por ID
      const uniqueResults = allResults.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      // Formatear los resultados
      const formattedInvoices = uniqueResults.map((inv: any) => ({
        ...inv,
        customerName: inv.customers?.name || 'N/A',
        customerDocument: inv.customers?.document || 'N/A',
        invoiceNumber: inv.invoice_number,
        customerId: inv.customer_id,
        date: inv.invoice_date
      }));

      // Ordenar por fecha de creación más reciente
      formattedInvoices.sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());

      setAllInvoices(formattedInvoices);

    } catch (error) {
      console.error('Error cargando facturas:', error);
      toast.error('Error al cargar facturas');
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Cargar todos los datos necesarios desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [productsRes, customersRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('customers').select('*').order('name')
      ]);

      if (productsRes.data) setProducts(productsRes.data.map(p => ({ ...p, minStock: p.min_stock })));
      if (customersRes.data) setCustomers(customersRes.data.map(c => ({ ...c, registrationDate: c.registration_date, totalPurchases: c.total_purchases, totalSpent: c.total_spent, lastPurchase: c.last_purchase })));

      // Cargar facturas iniciales
      await loadInvoices();

      setLoading(false);
    };
    fetchData();
  }, [supabase]); // Añadir supabase a las dependencias

  // 2. Agregar useEffect para obtener el usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  // Efecto para buscar facturas cuando cambie el término de búsqueda
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadInvoices(invoiceSearchTerm);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayedSearch);
  }, [invoiceSearchTerm]);

  // Filtrar facturas basado en el término de búsqueda
  const filteredInvoices = useMemo(() => {
    if (!invoiceSearchTerm.trim()) {
      return recentInvoices; // Mostrar solo las recientes si no hay búsqueda
    }
    return allInvoices; // Mostrar todas las que coinciden con la búsqueda
  }, [invoiceSearchTerm, recentInvoices, allInvoices]);

  // Calcular totales cuando cambien los items
  useEffect(() => {
    const subtotal = currentInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const tax_amount = subtotal * (currentInvoice.tax_rate / 100); // Usar el IVA del estado
    const total = subtotal + tax_amount;

    setCurrentInvoice(inv => ({
      ...inv,
      subtotal,
      tax_amount,
      total
    }));
  }, [currentInvoice.items, currentInvoice.tax_rate]); // Añadir tax_rate a las dependencias

  // --- CORRECCIÓN 2: Actualizar la función para manejar la selección de productos ---
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setIsProductComboboxOpen(false);
  };

  const addProductToInvoice = () => {
    const product = products.find(p => p.id.toString() === selectedProductId);
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Stock insuficiente. Disponible: ${product.stock}`);
      return;
    }

    const existingItemIndex = currentInvoice.items.findIndex(
      item => item.product.id.toString() === product.id.toString()
    );

    if (existingItemIndex >= 0) {
      // Actualizar item existente
      const updatedItems = [...currentInvoice.items];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;

      if (newQuantity > product.stock) {
        toast.error(`Stock insuficiente. Disponible: ${product.stock}`);
        return;
      }

      updatedItems[existingItemIndex].quantity = newQuantity;
      updatedItems[existingItemIndex].total =
        newQuantity * updatedItems[existingItemIndex].unit_price;

      setCurrentInvoice({ ...currentInvoice, items: updatedItems });
    } else {
      // Agregar nuevo item
      const newItem: InvoiceItem = {
        product,
        quantity,
        unit_price: product.price,
        total: product.price * quantity,
        discount: 0
      };

      setCurrentInvoice({
        ...currentInvoice,
        items: [...currentInvoice.items, newItem]
      });
    }

    // Limpiar la selección
    setSelectedProductId('');
    setQuantity(1);
    toast.success(`${product.name} agregado a la factura`);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedItems = [...(currentInvoice.items || [])];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = updatedItems[index].unit_price * newQuantity;

    setCurrentInvoice({ ...currentInvoice, items: updatedItems });
  };

  const removeItem = (index: number) => {
    const updatedItems = currentInvoice.items?.filter((_, i) => i !== index) || [];
    setCurrentInvoice({ ...currentInvoice, items: updatedItems });
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCurrentInvoice({
        ...currentInvoice,
        customer_id: customer.id,
        customerName: customer.name,
        customerDocument: customer.document
      });
    }
  };

  // 1. Función para generar número de factura
  const generateInvoiceNumber = async () => {
    // Obtener la última factura ordenada por número
    const { data: lastInvoice, error } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('invoice_number', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 es el código cuando no hay resultados
      console.error('Error al obtener último número de factura:', error);
      throw error;
    }

    let nextNumber = 1;

    if (lastInvoice?.invoice_number) {
      // Extraer el número de la última factura (asumiendo formato FAC-XXXXXX)
      const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[1], 10);
      nextNumber = lastNumber + 1;
    }

    return `FAC-${String(nextNumber).padStart(6, '0')}`;
  };

  // 2. Actualizar la función generateInvoice
  const generateInvoice = async () => {
    if (!currentInvoice.customer_id || currentInvoice.items.length === 0) {
      toast.error('Por favor, selecciona un cliente y agrega al menos un producto.');
      return;
    }

    if (!user) {
      toast.error('Error de autenticación');
      return;
    }

    try {
      // Generar número de factura
      const invoice_number = await generateInvoiceNumber();

      const invoiceData = {
        invoice_number,
        customer_id: currentInvoice.customer_id,
        user_id: user.id,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        subtotal: currentInvoice.subtotal,
        tax_rate: currentInvoice.tax_rate,
        tax_amount: currentInvoice.tax_amount,
        discount: currentInvoice.discount || 0,
        total: currentInvoice.total,
        status: currentInvoice.status,
        payment_method: currentInvoice.payment_method,
        notes: currentInvoice.notes || ''
      };

      console.log('📝 Datos de factura a insertar:', invoiceData);

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invoiceError) {
        console.error('Error al insertar factura:', invoiceError);
        throw invoiceError;
      }

      console.log('✅ Factura creada:', invoice);

      // SOLUCIÓN: Usar función RPC para insertar items
      for (let i = 0; i < currentInvoice.items.length; i++) {
        const item = currentInvoice.items[i];
        
        console.log(`📝 Insertando item ${i + 1} usando RPC:`, {
          p_invoice_id: invoice.id,
          p_product_id: item.product.id,
          p_product_name: item.product.name,
          p_product_code: item.product.code || null,
          p_quantity: Number(item.quantity),
          p_unit_price: Number(item.unit_price),
          p_discount: Number(item.discount || 0)
        });

        const { data: itemId, error: itemError } = await supabase
          .rpc('insert_invoice_item_safe', {
            p_invoice_id: invoice.id,
            p_product_id: item.product.id,
            p_product_name: item.product.name,
            p_product_code: item.product.code || null,
            p_quantity: Number(item.quantity),
            p_unit_price: Number(item.unit_price),
            p_discount: Number(item.discount || 0)
          });

        if (itemError) {
          console.error(`Error al insertar item ${i + 1} con RPC:`, itemError);
          throw itemError;
        }

        console.log(`✅ Item ${i + 1} insertado con ID:`, itemId);
      }

      console.log('✅ Todos los items insertados correctamente con RPC');

      // 3. Actualizar stock de productos
      for (const item of currentInvoice.items) {
        const newStock = Number(item.product.stock) - Number(item.quantity);
        
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product.id);

        if (stockError) {
          console.error(`Error actualizando stock del producto ${item.product.id}:`, stockError);
          throw stockError;
        }
      }

      console.log('✅ Stock actualizado');

      // 4. Registrar movimientos de stock (opcional y simplificado)
      try {
        for (const item of currentInvoice.items) {
          const movementData = {
            product_id: item.product.id,
            movement_type: 'exit',
            quantity: Number(item.quantity),
            previous_stock: Number(item.product.stock),
            new_stock: Number(item.product.stock) - Number(item.quantity),
            reference_type: 'invoice',
            reference_id: invoice.id,
            user_id: user.id,
            notes: `Venta en factura ${invoice_number}`
          };

          await supabase
            .from('stock_movements')
            .insert(movementData);
        }
      } catch (stockMovementError) {
        console.warn('No se pudieron registrar algunos movimientos de stock:', stockMovementError);
      }

      // 5. Recargar facturas
      await loadInvoices();

      toast.success(`Factura ${invoice_number} generada exitosamente!`);
      
      // 6. Limpiar formulario
      setCurrentInvoice({
        customer_id: null,
        customerName: '',
        customerDocument: '',
        items: [],
        subtotal: 0,
        tax_rate: systemSettings?.defaultTaxRate || 16.0,
        tax_amount: 0,
        discount: 0,
        total: 0,
        status: 'pending',
        payment_method: 'cash'
      });

      // Limpiar selecciones
      setSelectedProductId('');
      setQuantity(1);

      // Recargar productos para actualizar el stock en la UI
      const { data: updatedProducts } = await supabase
        .from('products')
        .select('*')
        .order('name');
    
      if (updatedProducts) {
        setProducts(updatedProducts.map(p => ({ ...p, minStock: p.min_stock })));
      }

    } catch (error: any) {
      console.error('💥 Error completo al generar la factura:', error);
      toast.error(`Error al generar la factura: ${error.message || 'Error desconocido'}`);
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
      case 'overdue':
        return <Badge variant="destructive">Vencida</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Actualizar la tasa de IVA cuando se carguen las configuraciones
  useEffect(() => {
    if (!settingsLoading && systemSettings) {
      setCurrentInvoice(prev => ({
        ...prev,
        tax_rate: systemSettings.defaultTaxRate
      }));
    }
  }, [systemSettings, settingsLoading]);

  // Función para generar PDF de la factura - ACTUALIZADA CON TRADUCCIONES
  const generatePDF = async (invoice: any) => {
    try {
      const fullInvoice = await getInvoiceDetails(invoice.id);
      if (!fullInvoice) return;

      const doc = new jsPDF();

      // Configuración de colores y fuentes
      const primaryColor: [number, number, number] = [41, 128, 185]; // Azul
      const textColor: [number, number, number] = [44, 62, 80]; // Gris oscuro

      // Encabezado con información de la empresa
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(systemSettings?.companyName || 'Mi Empresa', 20, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (systemSettings?.companyNit) {
        doc.text(`NIT: ${systemSettings.companyNit}`, 20, 32);
      }

      // Información de contacto en el encabezado
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      const contactInfo = [];
      if (systemSettings?.companyPhone) contactInfo.push(`Tel: ${systemSettings.companyPhone}`);
      if (systemSettings?.companyEmail) contactInfo.push(`Email: ${systemSettings.companyEmail}`);
      if (contactInfo.length > 0) {
        doc.text(contactInfo.join(' | '), 20, 37);
      }

      // Información de la factura (lado derecho)
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURA DE VENTA', 140, 55);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`No. ${fullInvoice.invoice_number}`, 140, 65);
      doc.text(`Fecha: ${new Date(fullInvoice.invoice_date).toLocaleDateString('es-ES')}`, 140, 72);
      doc.text(`Estado: ${translateStatus(fullInvoice.status)}`, 140, 79);

      // Información del cliente
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL CLIENTE', 20, 55);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Nombre: ${fullInvoice.customer?.name || 'N/A'}`, 20, 65);
      doc.text(`Documento: ${fullInvoice.customer?.document || 'N/A'}`, 20, 72);
      if (fullInvoice.customer?.phone) {
        doc.text(`Teléfono: ${fullInvoice.customer.phone}`, 20, 79);
      }

      // Línea separadora
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.5);
      doc.line(20, 90, 190, 90);

      // Tabla de productos - Encabezados
      let y = 105;
      doc.setFillColor(240, 240, 240);
      doc.rect(20, y - 5, 170, 8, 'F');

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPCIÓN', 22, y);
      doc.text('CANT.', 120, y);
      doc.text('PRECIO UNIT.', 140, y);
      doc.text('TOTAL', 170, y);

      // Productos
      y += 12;
      doc.setFont('helvetica', 'normal');

      fullInvoice.invoice_items?.forEach((item: any) => {
        // Nombre del producto
        doc.text(item.product_name.substring(0, 40), 22, y);
        if (item.product_code) {
          doc.setFontSize(8);
          doc.setTextColor(128, 128, 128);
          doc.text(`Cód: ${item.product_code}`, 22, y + 4);
          doc.setFontSize(10);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        }

        // Cantidad, precio y total
        doc.text(item.quantity.toString(), 125, y);
        doc.text(`$${item.unit_price.toLocaleString('es-ES')}`, 145, y);
        doc.text(`$${(item.quantity * item.unit_price).toLocaleString('es-ES')}`, 175, y);

        y += item.product_code ? 12 : 8;
      });

      // Línea antes de totales
      y += 5;
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.line(120, y, 190, y);

      // Totales
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 140, y);
      doc.text(`$${fullInvoice.subtotal.toLocaleString('es-ES')}`, 175, y);

      y += 7;
      doc.text(`IVA (${fullInvoice.tax_rate}%):`, 140, y);
      doc.text(`$${fullInvoice.tax_amount.toLocaleString('es-ES')}`, 175, y);

      if (fullInvoice.discount > 0) {
        y += 7;
        doc.text('Descuento:', 140, y);
        doc.text(`-$${fullInvoice.discount.toLocaleString('es-ES')}`, 175, y);
      }

      // Total final
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL:', 140, y);
      doc.text(`$${fullInvoice.total.toLocaleString('es-ES')}`, 175, y);

      // Método de pago - TRADUCIDO
      y += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Método de pago: ${translatePaymentMethod(fullInvoice.payment_method)}`, 20, y);

      // Notas si existen
      if (fullInvoice.notes) {
        y += 10;
        doc.text('Notas:', 20, y);
        doc.text(fullInvoice.notes, 20, y + 7);
      }

      // Pie de página
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Gracias por su compra', 20, pageHeight - 20);
      if (systemSettings?.companyAddress) {
        doc.text(systemSettings.companyAddress, 20, pageHeight - 15);
      }

      // Descargar PDF
      doc.save(`factura-${fullInvoice.invoice_number}.pdf`);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  // Función para obtener detalles completos de una factura
  const getInvoiceDetails = async (invoiceId: string) => {
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, document, phone, email),
          invoice_items(
            id,
            product_id,
            product_name,
            product_code,
            quantity,
            unit_price,
            discount
          )
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;
      return invoice;
    } catch (error) {
      console.error('Error al obtener detalles de factura:', error);
      toast.error('Error al cargar la factura');
      return null;
    }
  };

  // Función para actualizar status de factura
  const updateInvoiceStatus = async (invoiceId: string, newStatus: string, paymentMethod?: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (paymentMethod) updateData.payment_method = paymentMethod;

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;

      // Recargar facturas
      await loadInvoices(invoiceSearchTerm);

      toast.success('Factura actualizada correctamente');
      setShowEditStatusDialog(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      toast.error('Error al actualizar la factura');
    }
  };

  if (loading) {
    return <div>Cargando sistema de facturación...</div>;
  }

  if (!user) {
    return <div>Por favor inicia sesión para acceder al sistema de facturación</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nueva Factura */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nueva Factura
              </CardTitle>
              <CardDescription>
                Crea una nueva factura para un cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos del cliente */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Cliente</Label>
                  <Popover open={isCustomerComboboxOpen} onOpenChange={setIsCustomerComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isCustomerComboboxOpen}
                        className="w-full justify-between"
                      >
                        {currentInvoice.customer_id
                          ? customers.find((customer) => customer.id === currentInvoice.customer_id)?.name
                          : "Seleccionar un cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente por nombre o documento..." />
                        <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                        <CommandGroup>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={`${customer.name} ${customer.document}`}
                              onSelect={() => {
                                handleCustomerSelect(customer.id);
                                setIsCustomerComboboxOpen(false);
                              }}
                              // Añade estas clases para el efecto hover y el cursor
                              className=" hover:bg-accent hover:text-accent-foreground"
                            >
                              <CheckCircle
                                className={`mr-2 h-4 w-4 ${currentInvoice.customer_id === customer.id ? "opacity-100" : "opacity-0"
                                  }`}
                              />
                              {customer.name} - {customer.document}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Agregar productos */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Agregar Productos</h3>
                <div className="flex gap-2">
                  {/* Cambiar el Select por un Combobox con buscador */}
                  <Popover open={isProductComboboxOpen} onOpenChange={setIsProductComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isProductComboboxOpen}
                        className="flex-1 justify-between"
                      >
                        {selectedProductId
                          ? (() => {
                            const product = products.find((p) => p.id.toString() === selectedProductId);
                            return product ? `${product.name} - $${product.price.toLocaleString()}` : "Seleccionar producto...";
                          })()
                          : "Seleccionar producto..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar producto por nombre, código o marca..." />
                        <CommandEmpty>No se encontró el producto.</CommandEmpty>
                        <CommandGroup>
                          {products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={`${product.name} ${product.code || ''} ${product.brand || ''}`}
                              onSelect={() => handleProductSelect(product.id.toString())}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <CheckCircle
                                className={`mr-2 h-4 w-4 ${selectedProductId === product.id.toString() ? "opacity-100" : "opacity-0"
                                  }`}
                              />
                              <div className="flex flex-col">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground flex gap-2">
                                  {product.code && <span>Cód: {product.code}</span>}
                                  {product.brand && <span>• {product.brand}</span>}
                                  <span>• ${product.price.toLocaleString()}</span>
                                  <span>• Stock: {product.stock}</span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-20"
                    placeholder="Cant."
                  />
                  <Button onClick={addProductToInvoice} disabled={!selectedProductId}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mostrar información del producto seleccionado */}
                {selectedProductId && (() => {
                  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);
                  return selectedProduct ? (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{selectedProduct.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedProduct.code && `Código: ${selectedProduct.code} • `}
                            {selectedProduct.brand && `${selectedProduct.brand} • `}
                            {/* Categoría: {selectedProduct.category} */}
                            Marca: {selectedProduct.brand || 'Sin marca'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-lg">${selectedProduct.price.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            Stock disponible: {selectedProduct.stock}
                          </div>
                          {selectedProduct.stock < 10 && (
                            <Badge variant="destructive" className="mt-1">
                              Stock bajo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Lista de productos */}
              {currentInvoice.items && currentInvoice.items.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Productos en la Factura</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-sm text-muted-foreground">{item.product.brand}</div>
                            </div>
                          </TableCell>
                          <TableCell>${item.unit_price.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-2 min-w-[2rem] text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>${item.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Totales */}
              {currentInvoice.items && currentInvoice.items.length > 0 && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${currentInvoice.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA ({currentInvoice.tax_rate}%):</span>
                      <span>${currentInvoice.tax_amount?.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${currentInvoice.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Método de pago y notas */}
              {currentInvoice.items && currentInvoice.items.length > 0 && (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Método de Pago</Label>
                        <Select
                          value={currentInvoice.payment_method}
                          onValueChange={(value: any) =>
                            setCurrentInvoice({ ...currentInvoice, payment_method: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Efectivo</SelectItem>
                            <SelectItem value="card">Tarjeta</SelectItem>
                            <SelectItem value="transfer">Transferencia</SelectItem>
                            <SelectItem value="credit">Crédito</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select
                          value={currentInvoice.status}
                          onValueChange={(value: any) =>
                            setCurrentInvoice({ ...currentInvoice, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="paid">Pagada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas (Opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Agregar notas adicionales..."
                        value={currentInvoice.notes || ''}
                        onChange={(e) =>
                          setCurrentInvoice({ ...currentInvoice, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    {/* Agregar este botón */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={generateInvoice}
                      disabled={!currentInvoice.customer_id || currentInvoice.items.length === 0}
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Generar Factura
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Facturas Recientes - ACTUALIZADA CON BUSCADOR */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Facturas</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadInvoices(invoiceSearchTerm)}
                  disabled={invoicesLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${invoicesLoading ? 'animate-spin' : ''}`} />
                </Button>
              </CardTitle>
              <CardDescription>
                {invoiceSearchTerm ? 'Resultados de búsqueda' : 'Últimas facturas generadas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Buscador de facturas */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por número, cliente o documento..."
                    value={invoiceSearchTerm}
                    onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Lista de facturas */}
                {invoicesLoading ? (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Buscando facturas...</span>
                    </div>
                  </div>
                ) : filteredInvoices.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredInvoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          {getStatusBadge(invoice.status)}
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">
                          <div className="font-medium">{invoice.customerName}</div>
                          <div className="text-xs">
                            {invoice.customerDocument} • {new Date(invoice.date).toLocaleDateString('es-ES')}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="font-medium">${invoice.total.toLocaleString()}</div>

                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const fullInvoice = await getInvoiceDetails(invoice.id);
                                if (fullInvoice) {
                                  setSelectedInvoice(fullInvoice);
                                  setShowInvoiceDialog(true);
                                }
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generatePDF(invoice)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingInvoice(invoice);
                                setShowEditStatusDialog(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {invoiceSearchTerm 
                        ? 'No se encontraron facturas que coincidan con tu búsqueda'
                        : 'No hay facturas recientes'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para ver factura completa - ACTUALIZADO CON TRADUCCIONES */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Factura {selectedInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>
              Detalles completos de la factura
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Información de la empresa */}
              <div className="bg-primary text-primary-foreground p-4 rounded-lg">
                <h3 className="text-lg font-bold">{systemSettings?.companyName || 'Mi Empresa'}</h3>
                {systemSettings?.companyNit && <p>NIT: {systemSettings.companyNit}</p>}
                {systemSettings?.companyAddress && <p>Dirección: {systemSettings.companyAddress}</p>}
                {systemSettings?.companyPhone && <p>Tel: {systemSettings.companyPhone}</p>}
              </div>

              {/* Información de factura y cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Información de la Factura</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Número:</strong> {selectedInvoice.invoice_number}</p>
                    <p><strong>Fecha:</strong> {new Date(selectedInvoice.invoice_date).toLocaleDateString('es-ES')}</p>
                    <p><strong>Estado:</strong> {getStatusBadge(selectedInvoice.status)}</p>
                    <p><strong>Método de pago:</strong> {translatePaymentMethod(selectedInvoice.payment_method)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {selectedInvoice.customer?.name}</p>
                    <p><strong>Documento:</strong> {selectedInvoice.customer?.document}</p>
                    {selectedInvoice.customer?.phone && (
                      <p><strong>Teléfono:</strong> {selectedInvoice.customer.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div>
                <h4 className="font-semibold mb-2">Productos</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.invoice_items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            {item.product_code && (
                              <div className="text-sm text-muted-foreground">
                                Cód: {item.product_code}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toLocaleString()}</TableCell>
                        <TableCell>${(item.quantity * item.unit_price).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totales */}
              <div className="border-t pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA ({selectedInvoice.tax_rate}%):</span>
                    <span>${selectedInvoice.tax_amount?.toLocaleString()}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Descuento:</span>
                      <span>-${selectedInvoice.discount?.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${selectedInvoice.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => generatePDF(selectedInvoice)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button onClick={() => setShowInvoiceDialog(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar status */}
      <Dialog open={showEditStatusDialog} onOpenChange={setShowEditStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Factura</DialogTitle>
            <DialogDescription>
              Actualizar el estado y método de pago de la factura
            </DialogDescription>
          </DialogHeader>

          {editingInvoice && (
            <EditInvoiceForm
              invoice={editingInvoice}
              onSave={(status, paymentMethod) =>
                updateInvoiceStatus(editingInvoice.id, status, paymentMethod)
              }
              onCancel={() => setShowEditStatusDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para editar factura
function EditInvoiceForm({ invoice, onSave, onCancel }: {
  invoice: any;
  onSave: (status: string, paymentMethod: string) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState(invoice.status);
  const [paymentMethod, setPaymentMethod] = useState(invoice.payment_method || 'cash');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Estado</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="overdue">Vencida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Método de Pago</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="card">Tarjeta</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="credit">Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(status, paymentMethod)}>
          Guardar
        </Button>
      </div>
    </div>
  );
}