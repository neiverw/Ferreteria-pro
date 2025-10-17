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

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  // Verificar que sea admin leyendo SU perfil
  const { data: me, error: meErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (meErr) return NextResponse.json({ error: 'No se pudo verificar el rol' }, { status: 500 });
  if (me?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  // Listar todos los perfiles con SERVICE_ROLE (bypassa RLS)
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users, error } = await adminClient
    .from('profiles')
    .select('user_id,username,name,email,role');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users }, { status: 200 });
}
