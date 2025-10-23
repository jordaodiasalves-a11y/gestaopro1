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
import { Trash2, Edit, Package, AlertTriangle, Copy } from "lucide-react";
import { toast } from "sonner";

export default function Materials() {
  const queryClient = useQueryClient();
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: materials = [] } = useQuery({
    queryKey: ['materials'],
    queryFn: () => base44.entities.Material.list(),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => base44.entities.Material.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success("Material cadastrado com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => base44.entities.Material.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success("Material atualizado com sucesso!");
      setEditingMaterial(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Material.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success("Material excluído com sucesso!");
    },
  });

  const handleClone = async (material: any) => {
    const { id, created_date, updated_date, ...clonedData } = material;
    const clonedMaterial = {
      ...clonedData,
      material_name: `${clonedData.material_name} (Cópia)`,
    };
    await createMutation.mutateAsync(clonedMaterial);
  };

  const lowStockMaterials = materials.filter((m: any) => m.quantity <= m.minimum_quantity);
  const totalValue = materials.reduce((sum: number, m: any) => sum + (m.quantity * m.unit_cost), 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Controle de Estoque</h1>
          <p className="text-slate-600">Gerencie materiais e insumos</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total de Materiais</p>
                  <p className="text-2xl font-bold">{materials.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Valor em Estoque</p>
                  <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Estoque Baixo</p>
                  <p className="text-2xl font-bold">{lowStockMaterials.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {lowStockMaterials.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockMaterials.map((m: any) => (
                <div key={m.id} className="flex justify-between items-center py-2 border-b border-orange-200 last:border-0">
                  <span className="font-medium">{m.material_name}</span>
                  <span className="text-sm">Estoque atual: {m.quantity} {m.unit} | Mínimo: {m.minimum_quantity} {m.unit}</span>
                  <Badge className="bg-orange-500">Repor</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => { setShowForm(!showForm); setEditingMaterial(null); }}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Package className="w-4 h-4 mr-2" />
            Novo Material
          </Button>
        </div>

        {showForm && (
          <MaterialForm
            suppliers={suppliers}
            initialData={editingMaterial}
            onSubmit={(data) => {
              if (editingMaterial) {
                updateMutation.mutate({ id: editingMaterial.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowForm(false); setEditingMaterial(null); }}
          />
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Material</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Custo Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material: any) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.material_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{material.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {material.quantity <= material.minimum_quantity ? (
                        <span className="text-orange-600 font-semibold">{material.quantity} {material.unit}</span>
                      ) : (
                        <span>{material.quantity} {material.unit}</span>
                      )}
                    </TableCell>
                    <TableCell>R$ {material.unit_cost?.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">
                      R$ {(material.quantity * material.unit_cost).toFixed(2)}
                    </TableCell>
                    <TableCell>{material.supplier || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClone(material)}
                          title="Clonar"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingMaterial(material); setShowForm(true); }}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("Deseja excluir este material?")) {
                              deleteMutation.mutate(material.id);
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

function MaterialForm({ suppliers, initialData, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState(initialData || {
    material_name: "",
    category: "materia_prima",
    unit: "unidade",
    quantity: 0,
    minimum_quantity: 0,
    unit_cost: 0,
    supplier: "",
    location: "",
    notes: ""
  });

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardTitle>{initialData ? 'Editar' : 'Novo'} Material</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Material *</Label>
              <Input
                value={formData.material_name}
                onChange={(e) => setFormData({ ...formData, material_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materia_prima">Matéria Prima</SelectItem>
                  <SelectItem value="componente">Componente</SelectItem>
                  <SelectItem value="consumivel">Consumível</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Unidade</Label>
              <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidade">Unidade</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="litro">Litro</SelectItem>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Estoque Mínimo</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.minimum_quantity}
                onChange={(e) => setFormData({ ...formData, minimum_quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Custo Unitário (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div>
              <Label>Localização</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Galpão A - Prateleira 3"
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
