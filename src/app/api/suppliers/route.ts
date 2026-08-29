import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// GET: listar proveedores por ferretería
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id')
    .eq('user_id', user.id)
    .single();

  let query = supabase.from('suppliers').select('*').order('created_at', { ascending: false });

  if (profile?.store_id) {
    query = query.eq('store_id', profile.store_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || [], { status: 200 });
}

// POST: crear proveedor
export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('store_id')
    .eq('user_id', user.id)
    .single();

  const body = await req.json();
  const { name, contact_name, phone, email, address } = body;

  if (!name) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const payload: Record<string, unknown> = { name, contact_name, phone, email, address };
  if (profile?.store_id) {
    payload.store_id = profile.store_id;
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert([payload])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PUT: actualizar proveedor
export async function PUT(req: Request) {
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
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