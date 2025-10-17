import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // Evita errores con Edge Runtime

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const supplierId = segments[segments.indexOf('suppliers') + 1]; // Extrae el [id]

  if (!supplierId) {
    return NextResponse.json({ error: 'Missing supplier ID' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, code, name, description, brand, stock, price, cost, created_at')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}