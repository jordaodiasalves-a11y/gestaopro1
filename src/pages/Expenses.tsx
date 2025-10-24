import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, DollarSign, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Expenses() {
  const queryClient = useQueryClient();
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const data = await base44.entities.Expense.list();
      // Ordenar localmente por data de criação (mais recente primeiro)
      return data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_date || a.expense_date).getTime();
        const dateB = new Date(b.created_date || b.expense_date).getTime();
        return dateB - dateA;
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('Criando despesa:', data);
      return base44.entities.Expense.create(data);
    },
    onSuccess: (response) => {
      console.log('Despesa criada com sucesso:', response);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Despesa cadastrada com sucesso!");
      setShowForm(false);
      setEditingExpense(null);
    },
    onError: (error: any) => {
      console.error('Erro ao criar despesa:', error);
      toast.error(error?.message || "Erro ao cadastrar despesa");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Despesa atualizada com sucesso!");
      setEditingExpense(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao atualizar despesa");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Despesa excluída com sucesso!");
    },
  });

  const handleClone = async (expense: any) => {
    const { id, created_date, updated_date, ...clonedData } = expense;
    await createMutation.mutateAsync(clonedData);
  };

  // Categorias fixas cadastradas
  const [categories, setCategories] = useState<string[]>([
    "Fixo",
    "Variável",
    "Marketing",
    "Operacional",
    "Aluguel",
    "Energia",
    "Água",
    "Internet",
    "Telefone",
    "Manutenção"
  ]);

  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.value || 0), 0);
  const fixedExpenses = expenses.filter((e: any) => e.category?.toLowerCase() === 'fixo').reduce((sum: number, e: any) => sum + (e.value || 0), 0);
  const variableExpenses = totalExpenses - fixedExpenses;

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Despesas</h1>
          <p className="text-slate-600">Controle seus gastos e custos</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total de Despesas</p>
                  <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Despesas Fixas</p>
                  <p className="text-2xl font-bold">R$ {fixedExpenses.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Despesas Variáveis</p>
                  <p className="text-2xl font-bold">R$ {variableExpenses.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => { setShowForm(!showForm); setEditingExpense(null); }}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>

        {showForm && (
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={(data) => {
              if (editingExpense) {
                updateMutation.mutate({ id: editingExpense.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowForm(false); setEditingExpense(null); }}
          />
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense: any) => (
                  <TableRow key={expense.id}>
                  <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{expense.expense_date ? format(new Date(expense.expense_date), "dd/MM/yyyy") : "-"}</span>
                        {expense.created_date && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full w-fit">
                            📅 {format(new Date(expense.created_date), "dd/MM/yy HH:mm")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant={expense.category?.toLowerCase() === 'fixo' ? 'default' : 'secondary'}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-red-600">
                      R$ {expense.value?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClone(expense)}
                          title="Clonar"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingExpense(expense); setShowForm(true); }}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("Deseja excluir esta despesa?")) {
                              deleteMutation.mutate(expense.id);
                            }
                          }}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ExpenseForm({ initialData, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    description: initialData?.description || "",
    category: initialData?.category || "Fixo",
    value: initialData?.value || 0,
    expense_date: initialData?.expense_date || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || ""
  });
  
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "Fixo",
    "Variável",
    "Marketing",
    "Operacional",
    "Aluguel",
    "Energia",
    "Água",
    "Internet",
    "Telefone",
    "Manutenção"
  ]);
  
  const addNewCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updated = [...categories, newCategory.trim()];
      setCategories(updated);
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory("");
      toast.success("Categoria adicionada!");
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardTitle>{initialData ? 'Editar' : 'Nova'} Despesa</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Descrição *</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <div className="flex gap-2">
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Nova categoria..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewCategory())}
                />
                <Button type="button" onClick={addNewCategory} size="sm">+</Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label>Data da Despesa</Label>
              <Input
                type="date"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600">
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
