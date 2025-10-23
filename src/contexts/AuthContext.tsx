import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  username: string;
  role: 'admin' | 'user';
  permissions?: Permission[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  changePassword: (username: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários padrão armazenados no localStorage
const DEFAULT_USERS = [
  { 
    username: 'admin', 
    password: 'suporte@1', 
    role: 'admin' as const,
    permissions: [] as Permission[] // Admin tem acesso a tudo
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Inicializar usuários padrão se não existirem
    const storedUsers = localStorage.getItem('app_users');
    if (!storedUsers) {
      localStorage.setItem('app_users', JSON.stringify(DEFAULT_USERS));
    }

    // Verificar se há usuário logado
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const foundUser = users.find(
      (u: any) => u.username === username && u.password === password
    );

    if (foundUser) {
      const userData = { 
        username: foundUser.username, 
        role: foundUser.role,
        permissions: foundUser.permissions || []
      };
      setUser(userData);
      localStorage.setItem('current_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const changePassword = (username: string, newPassword: string): boolean => {
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.username === username);
    
    if (userIndex === -1) return false;
    
    users[userIndex].password = newPassword;
    localStorage.setItem('app_users', JSON.stringify(users));
    
    // Se for o usuário atual, atualizar a sessão
    if (user?.username === username) {
      const userData = { ...user };
      localStorage.setItem('current_user', JSON.stringify(userData));
    }
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasPermission, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
