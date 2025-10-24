import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import SaleForm from "../components/sales/SaleForm";

export default function Sales() {
  const queryClient = useQueryClient();
  const [editingSale, setEditingSale] = useState(null);
  const [selectedSales, setSelectedSales] = useState<string[]>([]);

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const data = await base44.entities.Sale.list();
      // Ordenar localmente por data de criação (mais recente primeiro)
      return data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_date || a.sale_date).getTime();
        const dateB = new Date(b.created_date || b.sale_date).getTime();
        return dateB - dateA;
      });
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Dar baixa no estoque do produto
      const product = products.find((p: any) => p.id === data.product_id);
      if (product) {
        const newStock = (product.stock_quantity || 0) - data.quantity;
        await base44.entities.Product.update(product.id, {
          ...product,
          stock_quantity: newStock
        });
      }
      return base44.entities.Sale.create(data);
    },
    onSuccess: (response) => {
      console.log('Venda criada com sucesso:', response);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Venda registrada e estoque atualizado!");
    },
    onError: (error: any) => {
      console.error('Erro ao criar venda:', error);
      toast.error(error?.message || "Erro ao registrar venda");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => base44.entities.Sale.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setEditingSale(null);
      toast.success("Venda atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao atualizar venda");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Sale.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success("Venda excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao excluir venda");
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => base44.entities.Sale.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setSelectedSales([]);
      toast.success("Vendas excluídas com sucesso!");
    },
  });

  const handleSubmit = (saleData: any) => {
    if (editingSale) {
      updateMutation.mutate({ id: (editingSale as any).id, data: saleData });
    } else {
      createMutation.mutate(saleData);
    }
  };

  const handleEdit = (sale: any) => {
    setEditingSale(sale);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta venda?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedSales.length === 0) {
      toast.error("Selecione pelo menos uma venda para excluir");
      return;
    }
    if (window.confirm(`Deseja excluir ${selectedSales.length} venda(s) selecionada(s)?`)) {
      deleteSelectedMutation.mutate(selectedSales);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedSales(checked ? sales.map((s: any) => s.id) : []);
  };

  const handleSelectSale = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSales([...selectedSales, id]);
    } else {
      setSelectedSales(selectedSales.filter(sId => sId !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
  };

  const handleClone = async (sale: any) => {
    const { id, created_date, updated_date, ...clonedData } = sale;
    await createMutation.mutateAsync(clonedData);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Vendas</h1>
            <p className="text-slate-600">Registre e acompanhe todas as vendas</p>
          </div>
          {selectedSales.length > 0 && (
            <Button 
              onClick={handleDeleteSelected}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Selecionados ({selectedSales.length})
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <SaleForm 
              products={products} 
              onSubmit={handleSubmit} 
              initialData={editingSale} 
              onCancel={handleCancelEdit} 
            />
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedSales.length === sales.length && sales.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Produto</TableHead>
                        <TableHead className="font-semibold">Cliente</TableHead>
                        <TableHead className="font-semibold">Qtd</TableHead>
                        <TableHead className="font-semibold">Receita</TableHead>
                        <TableHead className="font-semibold">Lucro</TableHead>
                        <TableHead className="font-semibold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale: any) => (
                        <TableRow key={sale.id} className="hover:bg-slate-50">
                          <TableCell>
                            <Checkbox 
                              checked={selectedSales.includes(sale.id)}
                              onCheckedChange={(checked) => handleSelectSale(sale.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span>{sale.sale_date ? format(new Date(sale.sale_date), "dd/MM/yyyy") : "-"}</span>
                              {sale.created_date && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit">
                                  📅 {format(new Date(sale.created_date), "dd/MM/yy HH:mm")}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{sale.product_name}</TableCell>
                          <TableCell>{sale.customer_name || "-"}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            R$ {sale.total_revenue?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={(sale.total_profit || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              R$ {sale.total_profit?.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleClone(sale)}
                                title="Clonar"
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(sale)}
                                className="mr-1"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(sale.id)}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
