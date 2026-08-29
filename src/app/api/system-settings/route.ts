import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Validar que la petición provenga de un usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Se requiere inicio de sesión para acceder a la configuración del sistema.' },
        { status: 401 }
      );
    }

    // 2. Obtener el store_id del perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('store_id')
      .eq('user_id', user.id)
      .single();

    const storeId = profile?.store_id;

    // 3. Obtener configuraciones del sistema filtradas por store_id
    const serviceClient = createSupabaseServiceClient();
    let query = serviceClient.from('system_settings').select('setting_key, setting_value');

    if (storeId) {
      query = query.eq('store_id', storeId);
    } else {
      return NextResponse.json({ settings: {} }, { status: 200 });
    }

    const { data: settingsData, error } = await query;

    if (error) {
      console.error('Error al obtener system_settings de Supabase:', error.message);
      return NextResponse.json(
        { error: 'Error al cargar configuración', details: error.message },
        { status: 500 }
      );
    }

    // 4. Convertir array de configuraciones a objeto clave-valor
    const settings = (settingsData || []).reduce<Record<string, string>>((acc, setting) => {
      if (setting.setting_key) {
        acc[setting.setting_key] = setting.setting_value ?? '';
      }
      return acc;
    }, {});

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en GET /api/system-settings:', errorMessage);

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Validar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Se requiere inicio de sesión.' },
        { status: 401 }
      );
    }

    // 2. Validar rol y obtener store_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, store_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
      return NextResponse.json(
        { error: 'No autorizado. Solo los administradores pueden modificar la configuración.' },
        { status: 403 }
      );
    }

    const storeId = profile.store_id || null;

    // 3. Validar payload recibido
    const body = await request.json();
    const settings = body?.settings;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Payload de configuración inválido' },
        { status: 400 }
      );
    }

    // 4. Actualizar configuraciones vinculadas al store_id
    const serviceClient = createSupabaseServiceClient();
    const entries = Object.entries(settings as Record<string, unknown>);

    const updates = entries.map(async ([key, value]) => {
      const payload: Record<string, unknown> = {
        setting_key: key,
        setting_value: String(value ?? ''),
        updated_at: new Date().toISOString(),
      };
      if (storeId) {
        payload.store_id = storeId;
      }

      const { error } = await serviceClient
        .from('system_settings')
        .upsert(payload);

      if (error) {
        throw error;
      }
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Configuración actualizada exitosamente' }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en POST /api/system-settings:', errorMessage);

    return NextResponse.json(
      { error: 'Error al guardar configuración', details: errorMessage },
      { status: 500 }
    );
  }
}