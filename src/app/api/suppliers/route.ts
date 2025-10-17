import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase (solo en servidor)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Service Role Key SOLO en el servidor
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// GET: listar proveedores
export async function GET() {
  const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

// POST: crear proveedor
export async function POST(req: Request) {
  const body = await req.json();
  const { name, contact_name, phone, email, address } = body;

  if (!name) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert([{ name, contact_name, phone, email, address }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PUT: actualizar proveedor
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID del proveedor' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

// DELETE: eliminar proveedor
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID del proveedor' }, { status: 400 });
  }

  const { error } = await supabase.from('suppliers').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}