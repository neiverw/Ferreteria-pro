import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ solo en el servidor
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supplierId = params.id;

  const { data, error } = await supabase
    .from('products')
    .select('id, code, name, description, brand, stock, price, cost, created_at')
    .eq('supplier_id', supplierId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}