import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      storeName,
      nit,
      address,
      city,
      phone,
      businessType = 'ferreteria_general',
      name,
      ownerRole,
      username,
      email,
      password,
      preloadDemoData = false,
    } = body;

    if (!storeName || !name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios para el registro.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (cleanPhone && (!cleanPhone.startsWith('3') || cleanPhone.length !== 10)) {
      return NextResponse.json(
        { error: 'El número de teléfono móvil debe comenzar con 3 y tener exactamente 10 dígitos.' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Validar si el nombre de usuario ya existe en profiles
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', normalizedUsername)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: `El nombre de usuario "${normalizedUsername}" ya está en uso. Por favor elige otro.` },
        { status: 409 }
      );
    }

    // 2. Validar si el correo ya existe
    const { data: existingEmail } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: `El correo "${normalizedEmail}" ya está registrado. Por favor inicia sesión.` },
        { status: 409 }
      );
    }

    // 3. Crear la Ferretería en la tabla 'stores'
    const { data: newStore, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: storeName,
        nit: nit || null,
        address: address ? `${address}${city ? `, ${city}` : ''}` : city || null,
        city: city || null,
        phone: cleanPhone || null,
        email: normalizedEmail,
        business_type: businessType,
        plan: 'pro',
      })
      .select('id')
      .single();

    if (storeError || !newStore) {
      console.error('Error al insertar en la tabla stores:', storeError);
      return NextResponse.json(
        {
          error: `Error en la base de datos: ${storeError?.message || 'No se pudo crear la tienda'}. Asegúrate de ejecutar el script multitenant-migration.sql en Supabase.`,
        },
        { status: 500 }
      );
    }

    const storeId = newStore.id;

    // 4. Crear usuario en Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username: normalizedUsername,
        name,
        role: 'admin',
        storeName,
        storeId,
        businessType,
        ownerRole,
      },
    });

    if (createError) {
      await supabaseAdmin.from('stores').delete().eq('id', storeId);
      return NextResponse.json(
        { error: `Error al registrar usuario: ${createError.message}` },
        { status: 400 }
      );
    }

    if (!newUser?.user) {
      await supabaseAdmin.from('stores').delete().eq('id', storeId);
      return NextResponse.json(
        { error: 'No se pudo generar el usuario en la base de datos.' },
        { status: 500 }
      );
    }

    // 5. Insertar perfil en 'profiles' vinculado al store_id
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        email: normalizedEmail,
        username: normalizedUsername,
        name,
        role: 'admin',
        store_id: storeId,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      await supabaseAdmin.from('stores').delete().eq('id', storeId);
      return NextResponse.json(
        { error: `Error al vincular el perfil: ${profileError.message}` },
        { status: 500 }
      );
    }

    // 6. Guardar configuraciones del establecimiento en 'system_settings'
    const settingsEntries = [
      { setting_key: 'company_name', setting_value: storeName, store_id: storeId },
      { setting_key: 'company_nit', setting_value: nit || '', store_id: storeId },
      { setting_key: 'company_address', setting_value: address ? `${address}${city ? `, ${city}` : ''}` : city || '', store_id: storeId },
      { setting_key: 'company_phone', setting_value: cleanPhone, store_id: storeId },
      { setting_key: 'company_email', setting_value: normalizedEmail, store_id: storeId },
      { setting_key: 'business_type', setting_value: businessType, store_id: storeId },
      { setting_key: 'default_tax_rate', setting_value: '19.0', store_id: storeId },
    ];

    for (const item of settingsEntries) {
      try {
        await supabaseAdmin.from('system_settings').insert(item);
      } catch {
        // Configuraciones secundarias
      }
    }

    // 7. Precarga de catálogo demo (si el usuario lo solicitó explícitamente)
    if (preloadDemoData && storeId) {
      try {
        const { data: catData } = await supabaseAdmin
          .from('categories')
          .insert({
            store_id: storeId,
            name: 'Herramientas y Construcción',
            description: 'Materiales y herramientas de uso general',
          })
          .select('id')
          .single();

        const catId = catData?.id || null;

        await supabaseAdmin.from('products').insert([
          {
            store_id: storeId,
            code: 'TAL-BOS-650',
            name: 'Taladro Percutor Bosch 650W',
            description: 'Taladro percutor profesional con mandril 1/2 pulgada',
            category_id: catId,
            brand: 'Bosch',
            stock: 12,
            min_stock: 3,
            price: 245000,
            cost: 185000,
            barcode: '7701234567890',
            is_active: true,
          },
          {
            store_id: storeId,
            code: 'CEM-ARG-50',
            name: 'Cemento Gris Argos 50kg',
            description: 'Cemento para uso estructural y albañilería',
            category_id: catId,
            brand: 'Argos',
            stock: 45,
            min_stock: 10,
            price: 32000,
            cost: 25500,
            barcode: '7709876543210',
            is_active: true,
          },
          {
            store_id: storeId,
            code: 'TUB-PVC-3X6',
            name: 'Tubo PVC Sanitario 3 pulg x 6m',
            description: 'Tubería liviana para desagües sanitarios',
            category_id: catId,
            brand: 'Pavco',
            stock: 20,
            min_stock: 5,
            price: 48000,
            cost: 36000,
            barcode: '7705556667778',
            is_active: true,
          },
        ]);
      } catch {
        // Continuar si falla la semilla
      }
    }

    return NextResponse.json(
      {
        message: 'Ferretería registrada exitosamente.',
        user_id: newUser.user.id,
        store_id: storeId,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error interno del servidor.';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
