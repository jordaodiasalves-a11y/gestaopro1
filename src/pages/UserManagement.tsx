import { useState, useEffect } from 'react';
import { useAuth, Permission } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Users, Edit, Key } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface StoredUser {
  username: string;
  password: string;
  role: 'admin' | 'user';
  permissions: Permission[];
}

const AVAILABLE_PERMISSIONS: { value: Permission; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'products', label: 'Produtos' },
  { value: 'sales', label: 'Vendas' },
  { value: 'reports', label: 'Relatórios' },
  { value: 'customers', label: 'Clientes' },
  { value: 'materials', label: 'Materiais' },
  { value: 'services', label: 'Serviços' },
  { value: 'expenses', label: 'Despesas' },
  { value: 'production', label: 'Produção' },
  { value: 'marketplace-orders', label: 'Pedidos Marketplace' },
  { value: 'suppliers', label: 'Fornecedores' },
  { value: 'employees', label: 'Funcionários' },
  { value: 'invoices', label: 'Faturas' },
  { value: 'assets', label: 'Ativos' },
];

export default function UserManagement() {
  const { user, changePassword } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [newUser, setNewUser] = useState<StoredUser>({ username: '', password: '', role: 'user', permissions: [] });
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadUsers();
    // Garantir que o localStorage existe
    if (!localStorage.getItem('app_users')) {
      localStorage.setItem('app_users', '[]');
    }
  }, []);

  const loadUsers = () => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      setUsers(storedUsers);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
      localStorage.setItem('app_users', '[]');
      setUsers([]);
    }
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
    setNewUser({ username: '', password: '', role: 'user', permissions: [] });
    
    toast({
      title: "Usuário criado!",
      description: `Usuário ${newUser.username} foi criado com sucesso.`,
    });
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUsers = users.map(u => 
      u.username === editingUser.username ? editingUser : u
    );
    localStorage.setItem('app_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
    setEditingUser(null);
    
    toast({
      title: "Usuário atualizado!",
      description: `Permissões de ${editingUser.username} foram atualizadas.`,
    });
  };

  const togglePermission = (permission: Permission, isNew: boolean = false) => {
    const target = isNew ? newUser : editingUser;
    if (!target) return;

    const currentPermissions = target.permissions || [];
    const hasPermission = currentPermissions.includes(permission);
    
    const updatedPermissions = hasPermission
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];

    if (isNew) {
      setNewUser({ ...newUser, permissions: updatedPermissions });
    } else {
      setEditingUser({ ...editingUser!, permissions: updatedPermissions });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 4 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (changePassword('admin', newPassword)) {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      });
      setIsPasswordDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        </div>
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Key className="w-4 h-4 mr-2" />
              Alterar Minha Senha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Senha do Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Alterar Senha
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
            
            {newUser.role === 'user' && (
              <div className="space-y-2">
                <Label>Permissões de Acesso</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <div key={perm.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-${perm.value}`}
                        checked={newUser.permissions?.includes(perm.value)}
                        onCheckedChange={() => togglePermission(perm.value, true)}
                      />
                      <label
                        htmlFor={`new-${perm.value}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {perm.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    <div className="flex gap-2 mt-1">
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {u.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                      {u.role === 'user' && u.permissions && (
                        <Badge variant="outline">
                          {u.permissions.length} permissões
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {u.username !== 'admin' && (
                  <div className="flex gap-2">
                    {u.role === 'user' && (
                      <Dialog open={isEditDialogOpen && editingUser?.username === u.username} onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) setEditingUser(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser({ ...u })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Editar Permissões - {u.username}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleEditUser} className="space-y-4">
                            <div className="space-y-2">
                              <Label>Permissões de Acesso</Label>
                              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg max-h-96 overflow-y-auto">
                                {AVAILABLE_PERMISSIONS.map((perm) => (
                                  <div key={perm.value} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`edit-${perm.value}`}
                                      checked={editingUser?.permissions?.includes(perm.value)}
                                      onCheckedChange={() => togglePermission(perm.value, false)}
                                    />
                                    <label
                                      htmlFor={`edit-${perm.value}`}
                                      className="text-sm font-medium leading-none cursor-pointer"
                                    >
                                      {perm.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button type="submit" className="w-full">
                              Salvar Alterações
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(u.username)}
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
