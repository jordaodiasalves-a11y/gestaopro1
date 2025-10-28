import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Wallet, TrendingUp, TrendingDown, Filter, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CashMovement {
  id: string;
  type: string;
  amount: number;
  category: string | null;
  description: string | null;
  payment_method: string | null;
  proof_url: string | null;
  created_at: string;
  user_id: string;
  created_by: string | null;
}

export default function CashManagement2() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    amount: 0,
    category: 'Outros',
    description: '',
    payment_method: 'dinheiro',
    proof_url: '',
  });

  const { data: movements = [] } = useQuery({
    queryKey: ['cash_movements_supabase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const createMovement = useMutation({
    mutationFn: async (data: { type: string; amount: number; category: string; description: string; payment_method: string; proof_url: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (isEditing && editingId) {
        const { error } = await supabase
          .from('cash_movements')
          .update({
            type: data.type,
            amount: data.amount,
            category: data.category,
            description: data.description,
            payment_method: data.payment_method,
            proof_url: data.proof_url,
          })
          .eq('id', editingId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cash_movements')
          .insert([{
            type: data.type,
            amount: data.amount,
            category: data.category,
            description: data.description,
            payment_method: data.payment_method,
            proof_url: data.proof_url,
            user_id: userData.user?.id,
            created_by: userData.user?.email || 'system',
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash_movements_supabase'] });
      toast.success(isEditing ? "Movimentação atualizada!" : "Movimentação registrada!");
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao salvar movimentação");
    },
  });

  const deleteMovement = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('cash_movements')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash_movements_supabase'] });
      setSelectedItems([]);
      toast.success("Movimentações excluídas!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao excluir");
    },
  });

  const resetForm = () => {
    setFormData({
      amount: 0,
      category: 'Outros',
      description: '',
      payment_method: 'dinheiro',
      proof_url: '',
    });
    setMovementType('entrada');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (movement: CashMovement) => {
    setFormData({
      amount: movement.amount,
      category: movement.category || 'Outros',
      description: movement.description || '',
      payment_method: movement.payment_method || 'dinheiro',
      proof_url: movement.proof_url || '',
    });
    setMovementType(movement.type as 'entrada' | 'saida');
    setIsEditing(true);
    setEditingId(movement.id);
    setShowForm(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(movements.map((m: CashMovement) => m.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(i => i !== id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("Selecione pelo menos uma movimentação");
      return;
    }
    if (confirm(`Deseja realmente excluir ${selectedItems.length} movimentação(ões)?`)) {
      deleteMovement.mutate(selectedItems);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMovement.mutate({
      ...formData,
      type: movementType,
    });
  };

  const totalEntradas = movements
    .filter((m: CashMovement) => m.type === 'entrada')
    .reduce((sum: number, m: CashMovement) => sum + Number(m.amount), 0);
  
  const totalSaidas = movements
    .filter((m: CashMovement) => m.type === 'saida')
    .reduce((sum: number, m: CashMovement) => sum + Number(m.amount), 0);
  
  const saldoEmCaixa = totalEntradas - totalSaidas;

  const categoryOptions = [
    { type: 'entrada', categories: ['Venda', 'Depósito', 'Retirada', 'Aluguel', 'Salário', 'Outros'] },
    { type: 'saida', categories: ['Despesa', 'Retirada', 'Pagamento Fornecedor', 'Salário', 'Aluguel', 'Outros'] }
  ];

  const currentCategories = categoryOptions.find(opt => opt.type === movementType)?.categories || [];

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Caixa 2 (Persistente)</h1>
          </div>
          <p className="text-slate-600">Controle completo de entradas e saídas - Dados salvos no banco Supabase</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Saldo em Caixa</p>
                  <p className="text-3xl font-bold">R$ {saldoEmCaixa.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Entradas</p>
                  <p className="text-3xl font-bold">R$ {totalEntradas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <TrendingDown className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Saídas</p>
                  <p className="text-3xl font-bold">R$ {totalSaidas.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-sm text-slate-600">Filtros</span>
          </div>
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <Button onClick={handleDeleteSelected} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir ({selectedItems.length})
              </Button>
            )}
            <Button
              onClick={() => { setShowForm(!showForm); resetForm(); }}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              + Nova Movimentação
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {isEditing ? 'Editar Movimentação' : 'Registrar Movimentação'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setMovementType('entrada')}
                    className={movementType === 'entrada' 
                      ? 'flex-1 bg-blue-600 text-white' 
                      : 'flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Entrada
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setMovementType('saida')}
                    className={movementType === 'saida' 
                      ? 'flex-1 bg-red-600 text-white' 
                      : 'flex-1 bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Saída
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Valor *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <Label>Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {currentCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes da movimentação..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Método de Pagamento</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className={movementType === 'entrada' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-red-600 hover:bg-red-700'
                    }
                  >
                    {isEditing ? 'Atualizar' : 'Registrar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedItems.length === movements.length && movements.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement: CashMovement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(movement.id)}
                        onCheckedChange={(checked) => handleSelectItem(movement.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        movement.type === 'entrada' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </TableCell>
                    <TableCell>{movement.category}</TableCell>
                    <TableCell>{movement.description || '-'}</TableCell>
                    <TableCell className={movement.type === 'entrada' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      R$ {Number(movement.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>{movement.payment_method || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(movement)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
