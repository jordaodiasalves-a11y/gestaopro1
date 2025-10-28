import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Users, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

interface User {
  id?: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  email?: string;
  full_name?: string;
}

export default function UserManagement2() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [newUser, setNewUser] = useState<User>({ username: '', password: '', role: 'user', email: '', full_name: '' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users = [] } = useQuery({
    queryKey: ['users_base44'],
    queryFn: async () => {
      const data = await base44.entities.Employee.list('created_date');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: User) => base44.entities.Employee.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_base44'] });
      setNewUser({ username: '', password: '', role: 'user', email: '', full_name: '' });
      toast({
        title: "Usuário criado!",
        description: `Usuário ${newUser.username} foi criado com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      base44.entities.Employee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_base44'] });
      setEditingUser(null);
      toast({
        title: "Usuário atualizado!",
        description: "Dados do usuário foram atualizados.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao atualizar usuário",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Employee.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_base44'] });
      toast({
        title: "Usuário removido",
        description: "Usuário foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao remover usuário",
        variant: "destructive",
      });
    },
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(newUser);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;

    updateMutation.mutate({
      id: editingUser.id,
      data: {
        username: editingUser.username,
        full_name: editingUser.full_name,
        email: editingUser.email,
        role: editingUser.role,
      }
    });
  };

  const handleDeleteUser = (id: string, username: string) => {
    if (username === 'admin') {
      toast({
        title: "Erro",
        description: "Não é possível excluir o usuário admin.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Deseja realmente excluir o usuário ${username}?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários 2 (Persistente)</h1>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Dados salvos no banco Base44</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingUser ? handleEditUser : handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário *</Label>
                <Input
                  id="username"
                  value={editingUser ? editingUser.username : newUser.username}
                  onChange={(e) => editingUser 
                    ? setEditingUser({ ...editingUser, username: e.target.value })
                    : setNewUser({ ...newUser, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={editingUser ? editingUser.full_name : newUser.full_name}
                  onChange={(e) => editingUser 
                    ? setEditingUser({ ...editingUser, full_name: e.target.value })
                    : setNewUser({ ...newUser, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser ? editingUser.email : newUser.email}
                  onChange={(e) => editingUser 
                    ? setEditingUser({ ...editingUser, email: e.target.value })
                    : setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Tipo</Label>
                <select
                  id="role"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={editingUser ? editingUser.role : newUser.role}
                  onChange={(e) => {
                    const role = e.target.value as 'admin' | 'user';
                    editingUser 
                      ? setEditingUser({ ...editingUser, role })
                      : setNewUser({ ...newUser, role });
                  }}
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              {editingUser && (
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancelar
                </Button>
              )}
              <Button type="submit">
                <UserPlus className="w-4 h-4 mr-2" />
                {editingUser ? 'Atualizar Usuário' : 'Adicionar Usuário'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((u: any) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{u.username}</p>
                    <p className="text-sm text-muted-foreground">{u.full_name || u.email || '-'}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {u.username !== 'admin' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(u)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(u.id, u.username)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
