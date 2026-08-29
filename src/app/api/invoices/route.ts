import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server';
import { getColombiaTodayISO } from '@/lib/date-utils';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado. Por favor inicia sesión.' }, { status: 401 });
    }

    // 1. Obtener store_id del perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('store_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'No se pudo obtener el perfil del usuario.' }, { status: 500 });
    }

    const storeId = profile.store_id || null;
    const body = await request.json();
    const {
      customerId,
      items,
      subtotal,
      taxRate = 19.0,
      taxAmount = 0,
      discount = 0,
      total,
      paymentMethod = 'cash',
      status = 'paid',
      notes = '',
    } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Debes seleccionar un cliente y al menos un producto.' }, { status: 400 });
    }

    const serviceClient = createSupabaseServiceClient();

    // 2. Generar número correlativo de factura
    let invNumQuery = serviceClient
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);

    if (storeId) {
      invNumQuery = invNumQuery.eq('store_id', storeId);
    }

    const { data: lastInv } = await invNumQuery.maybeSingle();

    let nextNumber = 1;
    if (lastInv?.invoice_number) {
      const parts = lastInv.invoice_number.split('-');
      const parsed = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(parsed)) {
        nextNumber = parsed + 1;
      }
    }

    let invoiceNumber = `FAC-${String(nextNumber).padStart(6, '0')}`;

    // Auto-resolución en caso de que persista la restricción global en base de datos
    const { data: duplicateCheck } = await serviceClient
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoiceNumber)
      .maybeSingle();

    if (duplicateCheck) {
      // Buscar el consecutivo más alto globalmente para no colisionar
      const { data: globalLast } = await serviceClient
        .from('invoices')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let globalNext = 1;
      if (globalLast?.invoice_number) {
        const p = globalLast.invoice_number.split('-');
        const num = parseInt(p[p.length - 1], 10);
        if (!isNaN(num)) {
          globalNext = num + 1;
        }
      }
      invoiceNumber = `FAC-${String(globalNext).padStart(6, '0')}`;
    }

    // 3. Insertar factura
    const invoicePayload: Record<string, unknown> = {
      invoice_number: invoiceNumber,
      customer_id: customerId,
      user_id: user.id,
      invoice_date: getColombiaTodayISO(),
      due_date: getColombiaTodayISO(),
      subtotal: Number(subtotal),
      tax_rate: Number(taxRate),
      tax_amount: Number(taxAmount),
      discount: Number(discount),
      total: Number(total),
      status,
      payment_method: paymentMethod,
      notes: notes || '',
    };

    if (storeId) {
      invoicePayload.store_id = storeId;
    }

    const { data: newInvoice, error: invError } = await serviceClient
      .from('invoices')
      .insert([invoicePayload])
      .select()
      .single();

    if (invError || !newInvoice) {
      console.error('Error insertando factura en BD:', invError);
      return NextResponse.json({ error: `Error al crear factura: ${invError?.message || 'Error desconocido'}` }, { status: 500 });
    }

    // 4. Insertar los items de la factura
    const itemsToInsert = items.map((item: any) => ({
      invoice_id: newInvoice.id,
      product_id: item.product?.id || item.product_id,
      product_name: item.product?.name || item.product_name || 'Producto',
      product_code: item.product?.code || item.product_code || null,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      discount: Number(item.discount || 0),
    }));

    const { error: itemsError } = await serviceClient
      .from('invoice_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error insertando items:', itemsError);
    }

    // 5. Actualizar stock y registrar movimientos
    for (const item of items) {
      try {
        const prodId = item.product.id;
        const qty = Number(item.quantity);
        const currentStock = Number(item.product.stock || 0);
        const newStock = currentStock - qty;

        await serviceClient
          .from('products')
          .update({ stock: newStock })
          .eq('id', prodId);

        const movementPayload: Record<string, unknown> = {
          product_id: prodId,
          movement_type: 'exit',
          quantity: qty,
          previous_stock: currentStock,
          new_stock: newStock,
          reference_type: 'invoice',
          reference_id: newInvoice.id,
          user_id: user.id,
          notes: `Venta en factura ${invoiceNumber}`,
        };

        if (storeId) {
          movementPayload.store_id = storeId;
        }

        await serviceClient.from('stock_movements').insert([movementPayload]);
      } catch (stockErr) {
        console.warn('Error actualizando stock de item:', stockErr);
      }
    }

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      invoice_number: invoiceNumber,
    }, { status: 201 });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error interno al generar la factura.';
    console.error('Error en POST /api/invoices:', err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
