import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Iniciando carga de configuraciones del sistema...');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables de entorno faltantes');
      return NextResponse.json(
        { error: 'Variables de entorno no configuradas' },
        { status: 500 }
      );
    }

    // Importar dinámicamente para evitar problemas de build
    const { createServerClient } = await import('@supabase/ssr');
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        cookies: {
          get() { return undefined },
          set() {},
          remove() {},
        },
      }
    );

    console.log('🔗 Cliente Supabase creado correctamente');

    // Obtener configuraciones desde system_settings
    const { data: settingsData, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log('📊 Datos obtenidos:', settingsData);

    // Convertir array de configuraciones a objeto
    const settings = settingsData?.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, string>) || {};

    console.log('✅ Configuraciones procesadas:', settings);

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('💥 Error completo:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Error al cargar configuración',
        details: error.message,
        code: error.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando actualización de configuraciones...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Variables de entorno no configuradas' },
        { status: 500 }
      );
    }

    const { createServerClient } = await import('@supabase/ssr');
    
    const supabase = createServerClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        cookies: {
          get() { return undefined },
          set() {},
          remove() {},
        },
      }
    );

    const { settings } = await request.json();
    console.log('📝 Configuraciones a actualizar:', settings);

    // Actualizar cada configuración usando upsert
    const updates = Object.entries(settings).map(async ([key, value]) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert(
          {
            setting_key: key,
            setting_value: value as string,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'setting_key' }
        );

      if (error) {
        console.error(`❌ Error updating ${key}:`, error);
        throw error;
      }

      return { key, success: true };
    });

    await Promise.all(updates);
    console.log('✅ Configuraciones actualizadas exitosamente');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('💥 Error actualizando configuraciones:', error);
    return NextResponse.json(
      { error: 'Error al guardar configuración', details: error.message },
      { status: 500 }
    );
  }
}