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
import { Wallet, TrendingUp, TrendingDown, Filter, Upload, Copy, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface CashMovement {
  id: string;
  type: 'entrada' | 'saida';
  value: number;
  category: string;
  reason: string;
  description?: string;
  proof?: string;
  date: string;
  created_date: string;
}

export default function CashManagement() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    value: 0,
    category: 'Outros',
    reason: '',
    description: '',
    proof: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Carregar movimentações do localStorage
  const { data: movements = [] } = useQuery({
    queryKey: ['cash_movements'],
    queryFn: () => {
      const stored = localStorage.getItem('cash_movements');
      const data = stored ? JSON.parse(stored) : [];
      return data.sort((a: CashMovement, b: CashMovement) => 
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
    },
  });

  const createMovement = useMutation({
    mutationFn: async (data: Omit<CashMovement, 'id' | 'created_date'>) => {
      const stored = localStorage.getItem('cash_movements');
      const existingMovements = stored ? JSON.parse(stored) : [];
      
      if (isEditing && editingId) {
        const updated = existingMovements.map((m: CashMovement) => 
          m.id === editingId ? { ...m, ...data } : m
        );
        localStorage.setItem('cash_movements', JSON.stringify(updated));
        return data;
      } else {
        const newMovement: CashMovement = {
          ...data,
          id: Date.now().toString(),
          created_date: new Date().toISOString(),
        };
        const updated = [...existingMovements, newMovement];
        localStorage.setItem('cash_movements', JSON.stringify(updated));
        return newMovement;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash_movements'] });
      toast.success(isEditing ? "Movimentação atualizada!" : "Movimentação registrada!");
      setShowForm(false);
      resetForm();
    },
  });

  const deleteMovement = useMutation({
    mutationFn: async (ids: string[]) => {
      const stored = localStorage.getItem('cash_movements');
      const existingMovements = stored ? JSON.parse(stored) : [];
      const updated = existingMovements.filter((m: CashMovement) => !ids.includes(m.id));
      localStorage.setItem('cash_movements', JSON.stringify(updated));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash_movements'] });
      setSelectedItems([]);
      toast.success("Movimentações excluídas!");
    },
  });

  const resetForm = () => {
    setFormData({
      value: 0,
      category: 'Outros',
      reason: '',
      description: '',
      proof: '',
      date: new Date().toISOString().split('T')[0],
    });
    setMovementType('entrada');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (movement: CashMovement) => {
    setFormData({
      value: movement.value,
      category: movement.category,
      reason: movement.reason,
      description: movement.description || '',
      proof: movement.proof || '',
      date: movement.date,
    });
    setMovementType(movement.type);
    setIsEditing(true);
    setEditingId(movement.id);
    setShowForm(true);
  };

  const handleClone = (movement: CashMovement) => {
    createMovement.mutate({
      type: movement.type,
      value: movement.value,
      category: movement.category,
      reason: movement.reason + " (Cópia)",
      description: movement.description,
      proof: movement.proof,
      date: new Date().toISOString().split('T')[0],
    });
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

  // Calcular totais
  const totalEntradas = movements
    .filter((m: CashMovement) => m.type === 'entrada')
    .reduce((sum: number, m: CashMovement) => sum + m.value, 0);
  
  const totalSaidas = movements
    .filter((m: CashMovement) => m.type === 'saida')
    .reduce((sum: number, m: CashMovement) => sum + m.value, 0);
  
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
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Caixa</h1>
          </div>
          <p className="text-slate-600">Controle completo de entradas e saídas</p>
        </div>

        {/* Cards de Resumo */}
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

        {/* Filtros e Botões de Ação */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-sm text-slate-600">Filtros</span>
            <Select defaultValue="Todos">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" className="w-48" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                size="sm"
              >
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

        {/* Formulário de Nova/Editar Movimentação */}
        {showForm && (
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {isEditing ? 'Editar Movimentação' : 'Registrar Movimentação'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo: Entrada ou Saída */}
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
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
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
                  <Label>Motivo *</Label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Ex: Venda de produto, Pagamento de aluguel..."
                    required
                  />
                </div>

                <div>
                  <Label>Descrição (Opcional)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes adicionais..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Comprovante (Opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      className="flex-1"
                      accept="image/*,.pdf"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Procurar... Nenhum arquivo selecionado.</p>
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

        {/* Histórico de Movimentações */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Histórico de Movimentações ({movements.length})</h3>
            {movements.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhuma movimentação encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedItems.length === movements.length && movements.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
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
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span>{format(new Date(movement.date), "dd/MM/yyyy")}</span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full w-fit">
                              {format(new Date(movement.created_date), "HH:mm")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {movement.type === 'entrada' ? (
                            <span className="flex items-center gap-1 text-blue-600">
                              <TrendingUp className="w-4 h-4" /> Entrada
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <TrendingDown className="w-4 h-4" /> Saída
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            movement.type === 'entrada' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {movement.category}
                          </span>
                        </TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${
                            movement.type === 'entrada' ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {movement.type === 'entrada' ? '+' : '-'} R$ {movement.value.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(movement)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleClone(movement)}
                              title="Clonar"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Deseja realmente excluir esta movimentação?')) {
                                  deleteMovement.mutate([movement.id]);
                                }
                              }}
                              title="Excluir"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
