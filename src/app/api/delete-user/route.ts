import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
  const { userIdToDelete } = await request.json();
  if (!userIdToDelete) {
    return NextResponse.json({ error: 'ID de usuario no proporcionado.' }, { status: 400 });
  }

  const cookieStore = await cookies(); // <-- await
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(n: string) {
          return cookieStore.get(n)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', adminUser.id)
    .single();

  if (adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  if (adminUser.id === userIdToDelete) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);
  if (deleteError) {
    return NextResponse.json({ error: `Error al eliminar: ${deleteError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: 'Usuario eliminado.' }, { status: 200 });
}