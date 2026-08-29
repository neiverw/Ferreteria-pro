import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  // 1. Verificar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // 2. Verificar rol y obtener store_id del usuario conectado
  const { data: me, error: meErr } = await supabase
    .from('profiles')
    .select('role, store_id')
    .eq('user_id', user.id)
    .single();

  if (meErr) return NextResponse.json({ error: 'No se pudo verificar el rol' }, { status: 500 });
  if (me?.role !== 'admin' && me?.role !== 'owner') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Filtrar usuarios estrictamente por la ferretería actual
  let query = adminClient
    .from('profiles')
    .select('user_id,username,name,email,role,store_id');

  if (me.store_id) {
    query = query.eq('store_id', me.store_id);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data: users, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: users || [] }, { status: 200 });
}
