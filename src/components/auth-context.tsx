"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export interface User {
  id: string;
  storeId?: string | null;
  username: string;
  name: string;
  role: 'owner' | 'admin' | 'cajero' | 'bodega';
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

const getPermissionsForRole = (role: User['role']): string[] => {
  switch (role) {
    case 'owner':
    case 'admin':
      return ['dashboard', 'inventory', 'billing', 'customers', 'suppliers', 'reports', 'settings'];
    case 'cajero':
      return ['inventory', 'reports', 'billing', 'customers'];
    case 'bodega':
      return ['inventory', 'reports'];
    default:
      return [];
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, name, role, store_id')
          .eq('user_id', session.user.id)
          .single();

        if (profile) {
          const appUser: User = {
            id: session.user.id,
            storeId: profile.store_id || null,
            email: session.user.email!,
            username: profile.username,
            name: profile.name,
            role: profile.role,
            permissions: getPermissionsForRole(profile.role),
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (_event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session) {
          initializeSession();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (username: string, password: string): Promise<void> => {
    const { data: email, error: rpcError } = await supabase.rpc('get_email_for_username', { p_username: username });
    if (rpcError || !email) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
  };

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
    canAccess: (permission: string) => user?.permissions.includes(permission) ?? false,
  };
};