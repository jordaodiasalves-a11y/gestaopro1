import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { externalServer } from "@/api/externalServer";

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

  // Inicializar armazenamento local se necessário
  useEffect(() => {
    if (!localStorage.getItem('cash_movements')) {
      localStorage.setItem('cash_movements', '[]');
    }
  }, []);

  // Buscar movimentos do localStorage
  const { data: movements = [] } = useQuery({
    queryKey: ['cash_movements'],
    queryFn: () => {
      try {
        const stored = localStorage.getItem('cash_movements');
        const data = stored ? JSON.parse(stored) : [];
        return data.sort((a: CashMovement, b: CashMovement) => 
          new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
        );
      } catch (e) {
        console.error('Erro ao carregar movimentos:', e);
        return [];
      }
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
        // Tentar atualizar no servidor externo
        try {
          await externalServer.updateInExternalDatabase('cash_movements', editingId, data);
        } catch (e) {
          // Fallback já tratado no cliente
        }
        return data;
      } else {
        const newMovement: CashMovement = {
          ...data,
          id: Date.now().toString(),
          created_date: new Date().toISOString(),
        };
        const updated = [...existingMovements, newMovement];
        localStorage.setItem('cash_movements', JSON.stringify(updated));
        // Tentar salvar no servidor externo
        try {
          await externalServer.saveToExternalDatabase('cash_movements', newMovement);
        } catch (e) {
          // Fallback já tratado no cliente
        }
        return newMovement;
      }
    },
    onSuccess: () => {
      try {
        const stored = localStorage.getItem('cash_movements');
        const data = stored ? JSON.parse(stored) : [];
        const sorted = data.sort((a: CashMovement, b: CashMovement) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        queryClient.setQueryData(['cash_movements'], sorted);
      } catch (e) {
        console.error('Erro ao ler movimentos do caixa:', e);
      }
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
      // Tentar deletar no servidor externo
      for (const id of ids) {
        try {
          await externalServer.deleteFromExternalDatabase('cash_movements', id);
        } catch (e) {
          // Fallback já tratado no cliente
        }
      }
    },
    onSuccess: () => {
      try {
        const stored = localStorage.getItem('cash_movements');
        const data = stored ? JSON.parse(stored) : [];
        const sorted = data.sort((a: CashMovement, b: CashMovement) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        queryClient.setQueryData(['cash_movements'], sorted);
      } catch (e) {
        console.error('Erro ao atualizar lista após exclusão:', e);
      }
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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { saveFileLocally } = await import('@/utils/localFileStorage');
                          const storedFile = await saveFileLocally(file);
                          setFormData({ ...formData, proof: storedFile.data });
                          toast.success('Comprovante salvo localmente!');
                        } catch (error: any) {
                          toast.error(error.message || 'Erro ao salvar comprovante');
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.proof && (
                    <p className="text-xs text-green-600 mt-1">✓ Comprovante anexado</p>
                  )}
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
                <p>Nenhuma movimentação encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedItems.length === movements.length}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                          aria-label="Selecionar todos"
                        />
                      </TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((m: CashMovement) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(m.id)}
                            onCheckedChange={(checked) => handleSelectItem(m.id, !!checked)}
                            aria-label="Selecionar"
                          />
                        </TableCell>
                        <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={m.type === 'entrada' ? 'text-blue-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {m.type === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </TableCell>
                        <TableCell>{m.category}</TableCell>
                        <TableCell className="max-w-[240px] truncate" title={m.reason}>{m.reason}</TableCell>
                        <TableCell className="max-w-[300px] truncate" title={m.description}>{m.description}</TableCell>
                        <TableCell className={m.type === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          R$ {m.value.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleClone(m)}
                              title="Clonar"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(m)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMovement.mutate([m.id])}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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