"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'; // <-- Añadir useMemo
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js';

// Interfaz de usuario de la aplicación, combinando datos de Supabase Auth y la tabla 'profiles'
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cajero' | 'bodega';
  permissions: string[];
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para obtener los permisos según el rol
const getPermissionsForRole = (role: User['role']): string[] => {
  switch (role) {
    case 'admin': return ['dashboard', 'inventory', 'billing', 'customers', 'suppliers', 'reports', 'settings'];
    case 'cajero': return ['inventory', 'reports','billing', 'customers'];
    case 'bodega': return ['inventory', 'reports'];
    default: return [];
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // --- CORRECCIÓN: Envolver la creación del cliente en useMemo ---
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- CORRECCIÓN: Lógica de carga inicial ---
    const initializeSession = async () => {
      // 1. Obtener la sesión inicial
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // 2. Si hay sesión, obtener el perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, name, role')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          // 3. Si hay perfil, construir y establecer el usuario
          const appUser: User = {
            id: session.user.id,
            email: session.user.email!,
            username: profile.username,
            name: profile.name,
            role: profile.role,
            permissions: getPermissionsForRole(profile.role),
          };
          setUser(appUser);
        } else {
          // Perfil no encontrado, la sesión es inválida
          setUser(null);
        }
      } else {
        // No hay sesión
        setUser(null);
      }

      // 4. Terminar la carga inicial, independientemente del resultado
      setLoading(false);
    };

    initializeSession();

    // --- CORRECCIÓN: El listener ahora solo actualiza el estado, no vuelve a llamar a la lógica inicial ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Si el evento es un cierre de sesión, limpiamos el usuario.
        if (_event === 'SIGNED_OUT') {
          setUser(null);
        }
        // Si hay una nueva sesión (después de login o refresh), volvemos a cargar todo.
        // Esto es más simple y evita bucles.
        else if (session) {
          initializeSession();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // El array vacío es correcto, se ejecuta solo al montar.

  // Función de login con Supabase usando nombre de usuario
  const login = async (username: string, password: string): Promise<void> => {
    // 1. Llamar a la función RPC para obtener el email
    const { data: email, error: rpcError } = await supabase.rpc('get_email_for_username', { p_username: username });
    if (rpcError || !email) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    // 2. Usar el email obtenido para iniciar sesión
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    // El listener onAuthStateChange se encargará de actualizar el estado.
  };

  // Función de logout con Supabase
  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const value = { user, login, logout, isAuthenticated: !!user, loading };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const usePermissions = () => {
  const { user } = useAuth();
  return {
    userRole: user?.role,
    // --- ESTA ES LA CORRECCIÓN ---
    // Cambiar 'hasPermission' por 'canAccess' para que coincida con App.tsx
    canAccess: (permission: string) => user?.permissions.includes(permission) ?? false,
  };
};