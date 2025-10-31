import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Permission =
  | 'dashboard'
  | 'products'
  | 'sales'
  | 'reports'
  | 'customers'
  | 'materials'
  | 'services'
  | 'expenses'
  | 'production'
  | 'marketplace-orders'
  | 'suppliers'
  | 'employees'
  | 'invoices'
  | 'assets';

interface User {
  id: string;
  email: string | null;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  changePassword: (newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Carrega sessão atual e escuta mudanças de autenticação do backend (Lovable Cloud)
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? null });
      } else {
        setUser(null);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser ? { id: authUser.id, email: authUser.email ?? null } : null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return false;
    setUser({ id: data.user.id, email: data.user.email ?? null });
    return true;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return false;
    // Se auto-confirm estiver ativo, já haverá sessão; caso contrário o usuário precisará confirmar por e-mail
    if (data.user) setUser({ id: data.user.id, email: data.user.email ?? null });
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Por agora, qualquer usuário autenticado possui acesso às rotas protegidas.
  // Admins continuam com acesso total (se implementarmos leitura de user_roles no futuro).
  const hasPermission = (_permission: Permission) => !!user;

  const changePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return !error;
  };

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    login,
    signUp,
    logout,
    hasPermission,
    changePassword,
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
