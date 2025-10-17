import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { email, password, role, username, name } = await request.json();

  if (!email || !password || !role || !username || !name) {
    return NextResponse.json({ error: 'Faltan campos requeridos (email, password, role, username, name).' }, { status: 400 });
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

  const { data: adminProfile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', adminUser.id)
    .single();

  if (profileFetchError) {
    return NextResponse.json({ error: 'No se pudo verificar el rol.' }, { status: 500 });
  }

  if (adminProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username, name, role }
  });

  if (createError) {
    return NextResponse.json({ error: `Error al crear el usuario: ${createError.message}` }, { status: 400 });
  }

  if (!newUser?.user) {
    return NextResponse.json({ error: 'No se pudo crear el usuario.' }, { status: 500 });
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      user_id: newUser.user.id,
      email,
      username,
      name,
      role
    });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json({ error: `Error al crear el perfil: ${profileError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: 'Usuario creado.', user_id: newUser.user.id }, { status: 201 });
}
