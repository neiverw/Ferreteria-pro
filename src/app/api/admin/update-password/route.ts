import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { userId, newPassword } = await req.json();
  if (!userId || !newPassword) {
    return NextResponse.json({ error: 'Faltan userId o newPassword' }, { status: 400 });
  }

  // Verifica que quien llama es admin
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(n: string) { return cookieStore.get(n)?.value; },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
      },
    }
  );

  const { data: { user: me } } = await supabase.auth.getUser();
  if (!me) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: myProfile, error: profErr } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', me.id)
    .single();

  if (profErr) return NextResponse.json({ error: 'No se pudo verificar rol' }, { status: 500 });
  if (myProfile?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  // Admin client con Service Role
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ solo en el servidor
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Tip: invalidar refresh tokens del usuario (si tu versión lo soporta)
  // await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' }); // o usa endpoints de revocación si están disponibles

  return NextResponse.json({ ok: true, user: data.user });
}
