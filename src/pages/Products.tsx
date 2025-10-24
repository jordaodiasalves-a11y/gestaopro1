import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Printer, Copy } from "lucide-react";
import { format } from "date-fns";
import { saveProductMeta, parseCostItems } from "@/utils/productMeta";
import ProductForm from "../components/products/ProductForm";
import { toast } from "sonner";

export default function Products() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selected, setSelected] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await base44.entities.Product.list();
      // Ordenar localmente por data de criação (mais recente primeiro)
      return data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_date).getTime();
        const dateB = new Date(b.created_date).getTime();
        return dateB - dateA;
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: (created: any, variables: any) => {
      // Salva meta local (componentes e itens detalhados)
      const newId = created?.id;
      if (newId) {
        saveProductMeta(newId, {
          components_text: variables?.components_text || '',
          cost_items: parseCostItems(variables?.cost_items),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditingProduct(null);
      toast.success("Produto cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao cadastrar produto");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => base44.entities.Product.update(id, data),
    onSuccess: (_resp: any, variables: { id: string; data: any }) => {
      // Atualiza meta local
      if (variables?.id) {
        saveProductMeta(variables.id, {
          components_text: variables.data?.components_text || '',
          cost_items: parseCostItems(variables.data?.cost_items),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditingProduct(null);
      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao atualizar produto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produto excluído!");
    },
  });

  const deleteSelectedMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => base44.entities.Product.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelected([]);
      toast.success("Produtos excluídos com sucesso!");
    },
  });

  const handleSubmit = (productData: any) => {
    console.log('Enviando produto:', productData);
    console.log('cost_items recebido:', productData.cost_items);
    if (editingProduct?.id) {
      updateMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleClone = async (product: any) => {
    const { id, created_date, updated_date, ...clonedData } = product;
    const clonedProduct = {
      ...clonedData,
      product_name: `${clonedData.product_name} (Cópia)`,
    };
    await createMutation.mutateAsync(clonedProduct);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteSelected = () => {
    if (selected.length === 0) {
      toast.error("Selecione pelo menos um produto para excluir");
      return;
    }
    if (window.confirm(`Deseja excluir ${selected.length} produto(s) selecionado(s)?`)) {
      deleteSelectedMutation.mutate(selected);
    }
  };
  
  const handleSelect = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? products.map((p: any) => p.id) : []);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 no-print">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 printable-page-title">Produtos e Custos</h1>
              <p className="text-slate-600">Gerencie seus produtos e variações</p>
            </div>
            <div className="flex gap-2">
              {selected.length > 0 && (
                <Button 
                  onClick={handleDeleteSelected}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Selecionados ({selected.length})
                </Button>
              )}
              <Button variant="outline" onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingProduct(null)} className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <Plus className="w-5 h-5 mr-2" /> Novo Produto
                </Button>
              </DialogTrigger>
            </div>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 no-print">
                      <Checkbox 
                        checked={selected.length === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll} 
                      />
                    </TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Variação</TableHead>
                    <TableHead>Custo Total</TableHead>
                    <TableHead>Preço Venda</TableHead>
                    <TableHead>Margem</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-right no-print">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="no-print">
                        <Checkbox 
                          checked={selected.includes(product.id)} 
                          onCheckedChange={() => handleSelect(product.id)} 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>{product.product_name}</span>
                          {product.created_date && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full w-fit">
                              📅 {format(new Date(product.created_date), "dd/MM/yy HH:mm")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.variation_name}</TableCell>
                      <TableCell>R$ {product.total_cost?.toFixed(2)}</TableCell>
                      <TableCell>R$ {product.sale_price?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={(product.profit_margin || 0) > 0 ? "default" : "destructive"}>
                          {product.profit_margin?.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.stock_quantity || 0}
                        {product.minimum_stock && (product.stock_quantity || 0) <= product.minimum_stock && (
                          <Badge className="ml-2 bg-orange-500 text-white">Baixo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right no-print">
                        <Button variant="ghost" size="icon" onClick={() => handleClone(product)}><Copy className="w-4 h-4 text-gray-500" /></Button>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Edit className="w-4 h-4 text-blue-600" /></Button>
                        </DialogTrigger>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <DialogContent className="max-w-4xl no-print">
        <DialogHeader>
          <DialogTitle>{editingProduct?.id ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <ProductForm
          initialData={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
