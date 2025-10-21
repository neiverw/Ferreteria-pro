import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET - Obtener preferencias del usuario actual
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener preferencias del usuario
    const { data, error } = await supabase
      .from('profiles')
      .select('user_preferences')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error al obtener preferencias:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si no hay preferencias, devolver valores por defecto
    const preferences = data?.user_preferences || {
      theme: 'light',
      fontSize: 'medium'
    };

    return NextResponse.json({ preferences }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/user-preferences:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Actualizar preferencias del usuario actual
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener las preferencias del body
    const { preferences } = await request.json();

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json({ error: 'Preferencias inválidas' }, { status: 400 });
    }

    // Validar campos permitidos
    const allowedFields = ['theme', 'fontSize'];
    const validatedPreferences: Record<string, string> = {};
    
    for (const field of allowedFields) {
      if (preferences[field]) {
        validatedPreferences[field] = preferences[field];
      }
    }

    // Actualizar preferencias
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        user_preferences: validatedPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error al actualizar preferencias:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Preferencias actualizadas exitosamente',
      preferences: validatedPreferences
    }, { status: 200 });
  } catch (error) {
    console.error('Error en POST /api/user-preferences:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
