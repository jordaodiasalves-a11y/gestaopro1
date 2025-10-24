import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Factory, Plus, CheckCircle, Trash2, Edit, Monitor, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Production() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const highlightProductId = searchParams.get('product');

  const { data: orders = [] } = useQuery({
    queryKey: ['production-orders'],
    queryFn: async () => {
      const data = await base44.entities.ProductionOrder.list();
      return data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_date || a.start_date).getTime();
        const dateB = new Date(b.created_date || b.start_date).getTime();
        return dateB - dateA;
      });
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('Criando ordem de produção:', data);
      return base44.entities.ProductionOrder.create(data);
    },
    onSuccess: (response) => {
      console.log('Ordem criada com sucesso:', response);
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      toast.success("Ordem de produção criada!");
      setShowForm(false);
      setEditingOrder(null);
    },
    onError: (error: any) => {
      console.error("Erro ao criar ordem:", error);
      toast.error(error?.message || "Erro ao criar ordem de produção");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      base44.entities.ProductionOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      toast.success("Ordem atualizada!");
      setEditingOrder(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao atualizar ordem");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.ProductionOrder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      toast.success("Ordem excluída!");
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => base44.entities.ProductionOrder.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      setSelectedOrders([]);
      toast.success("Ordens excluídas com sucesso!");
    },
  });

  const completeOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      base44.entities.ProductionOrder.update(id, { ...data, status: "concluido", end_date: new Date().toISOString().split('T')[0] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      toast.success("Ordem concluída!");
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-800" },
      em_producao: { label: "Em Produção", className: "bg-blue-100 text-blue-800" },
      concluido: { label: "Concluído", className: "bg-green-100 text-green-800" },
    };
    const config = statusMap[status] || statusMap.pendente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const openProductionDisplay = () => {
    window.open('/production-display', 'ProductionDisplay', 'width=1920,height=1080');
    toast.success("Dashboard de produção aberto em nova janela!");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((order: any) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedOrders.length === 0) {
      toast.error("Selecione pelo menos uma ordem para excluir");
      return;
    }
    if (window.confirm(`Deseja excluir ${selectedOrders.length} ordem(ns) selecionada(s)?`)) {
      deleteSelectedMutation.mutate(selectedOrders);
    }
  };

  const handleClone = async (order: any) => {
    const { id, created_date, updated_date, ...clonedData } = order;
    const clonedOrder = {
      ...clonedData,
      order_name: `${clonedData.order_name} (Cópia)`,
    };
    await createMutation.mutateAsync(clonedOrder);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ordens de Produção</h1>
          <p className="text-slate-600">Planeje e controle a produção da sua fábrica</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3">
            {selectedOrders.length > 0 && (
              <Button 
                onClick={handleDeleteSelected}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Selecionados ({selectedOrders.length})
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                window.open('/products-to-restock', 'ProductsRestock', 'width=1920,height=1080');
                toast.success("Monitor de produtos aberto!");
              }}
              variant="outline"
              className="bg-yellow-600 text-white hover:bg-yellow-700"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Monitor Produtos
            </Button>
            <Button 
              onClick={() => {
                window.open('/monitor-display', 'MonitorDisplay', 'width=1920,height=1080');
                toast.success("Monitor de gestão aberto!");
              }}
              variant="outline"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Monitor Gestão
            </Button>
            <Button 
              onClick={openProductionDisplay}
              variant="outline"
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Monitor Produção
            </Button>
            <Button 
              onClick={() => { setShowForm(!showForm); setEditingOrder(null); }}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Ordem
            </Button>
          </div>
        </div>

        {showForm && (
          <ProductionOrderForm
            products={products}
            initialData={editingOrder}
            onSubmit={(data) => {
              if (editingOrder) {
                updateMutation.mutate({ id: editingOrder.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowForm(false); setEditingOrder(null); }}
          />
        )}

        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Qtd.</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Conclusão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                      <Factory className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma ordem de produção cadastrada</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: any) => {
                    const isHighlighted = highlightProductId && order.product_id === highlightProductId;
                    return (
                      <TableRow 
                        key={order.id}
                        className={isHighlighted ? "bg-yellow-100 animate-pulse" : ""}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{order.order_name}</span>
                          {order.created_date && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit">
                              📅 {format(new Date(order.created_date), "dd/MM/yy HH:mm")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell className="text-center font-semibold">{order.quantity_to_produce}</TableCell>
                      <TableCell>{order.start_date ? format(new Date(order.start_date), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>{order.end_date ? format(new Date(order.end_date), "dd/MM/yyyy") : "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleClone(order)}
                              title="Clonar"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                // Download ordem como PDF ou imprimir
                                window.print();
                                toast.success("Preparando para download/impressão");
                              }}
                              title="Baixar/Imprimir"
                            >
                              <Download className="w-4 h-4 text-purple-600" />
                            </Button>
                            {order.status !== "concluido" && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => completeOrderMutation.mutate({ id: order.id, data: order })}
                                title="Concluir"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => { setEditingOrder(order); setShowForm(true); }}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                if (window.confirm("Deseja excluir esta ordem?")) {
                                  deleteMutation.mutate(order.id);
                                }
                              }}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProductionOrderForm({ products, initialData, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    order_name: initialData?.order_name || "",
    product_id: initialData?.product_id || "",
    product_name: initialData?.product_name || "",
    quantity_to_produce: initialData?.quantity_to_produce || 1,
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || "",
    status: initialData?.status || "pendente",
    notes: initialData?.notes || ""
  });

  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find((p: any) => p.id === productId);
    if (selectedProduct) {
      setFormData({
        ...formData,
        product_id: productId,
        product_name: `${selectedProduct.product_name} - ${selectedProduct.variation_name}`
      });
    }
  };

  return (
    <Card className="mb-6 shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Factory className="w-5 h-5" />
          Nova Ordem de Produção
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nome da Ordem *</Label>
              <Input
                value={formData.order_name}
                onChange={(e) => setFormData({ ...formData, order_name: e.target.value })}
                placeholder="Ex: Produção Semana 10"
                required
              />
            </div>
            <div>
              <Label>Produto a Produzir *</Label>
              <Select 
                value={formData.product_id}
                onValueChange={handleProductChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: any) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.product_name} - {product.variation_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Quantidade a Produzir *</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity_to_produce}
                onChange={(e) => setFormData({ ...formData, quantity_to_produce: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <Label>Data de Início *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Adicione observações sobre esta ordem..."
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600">
              Criar Ordem
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
