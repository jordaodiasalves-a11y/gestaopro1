import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StoredUser {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [newUser, setNewUser] = useState<StoredUser>({ username: '', password: '', role: 'user' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    setUsers(storedUsers);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (users.some(u => u.username === newUser.username)) {
      toast({
        title: "Erro",
        description: "Usuário já existe.",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = [...users, newUser];
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setNewUser({ username: '', password: '', role: 'user' });
    
    toast({
      title: "Usuário criado!",
      description: `Usuário ${newUser.username} foi criado com sucesso.`,
    });
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'admin') {
      toast({
        title: "Erro",
        description: "Não é possível excluir o usuário admin.",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.filter(u => u.username !== username);
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    toast({
      title: "Usuário removido",
      description: `Usuário ${username} foi removido.`,
    });
  };

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Adicionar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Tipo</Label>
                <select
                  id="role"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newUser.role}
                  onChange={(e) => {
                    const role = e.target.value as 'admin' | 'user';
                    setNewUser({ ...newUser, role });
                  }}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <Button type="submit">
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.username}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{u.username}</p>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                  </div>
                </div>
                {u.username !== 'admin' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(u.username)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
