import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    product_name: "",
    variation_name: "",
    components: "",
    material_cost: 0,
    labor_cost: 0,
    other_costs: 0,
    sale_price: 0,
    stock_quantity: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const total_cost = (parseFloat(String(formData.material_cost)) || 0) + 
                     (parseFloat(String(formData.labor_cost)) || 0) + 
                     (parseFloat(String(formData.other_costs)) || 0);
  const profit = (parseFloat(String(formData.sale_price)) || 0) - total_cost;
  const profit_margin = formData.sale_price > 0 ? (profit / formData.sale_price) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      components: [], // API expects an array
      total_cost,
      profit_margin,
      material_cost: parseFloat(String(formData.material_cost)) || 0,
      labor_cost: parseFloat(String(formData.labor_cost)) || 0,
      other_costs: parseFloat(String(formData.other_costs)) || 0,
      sale_price: parseFloat(String(formData.sale_price)) || 0,
      stock_quantity: parseInt(String(formData.stock_quantity)) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Nome do Produto/Grupo *</Label>
          <Input
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            placeholder="Ex: Fliperama MDF"
            required
          />
        </div>
        <div>
          <Label>Variação *</Label>
          <Input
            value={formData.variation_name}
            onChange={(e) => setFormData({ ...formData, variation_name: e.target.value })}
            placeholder="Ex: Padrão com Ficheiro"
            required
          />
        </div>
      </div>

      <div>
        <Label>Componentes/Descrição</Label>
        <Textarea
          value={formData.components}
          onChange={(e) => setFormData({ ...formData, components: e.target.value })}
          rows={3}
          placeholder="Descreva os componentes ou características..."
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Custo Material (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.material_cost}
            onChange={(e) => setFormData({ ...formData, material_cost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Custo Mão de Obra (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.labor_cost}
            onChange={(e) => setFormData({ ...formData, labor_cost: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <Label>Outros Custos (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.other_costs}
            onChange={(e) => setFormData({ ...formData, other_costs: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Preço de Venda (R$) *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label>Estoque Inicial</Label>
          <Input
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span className="font-medium text-slate-700">Custo Total:</span>
          <span className="font-bold text-slate-900">R$ {total_cost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium text-slate-700">Lucro por Unidade:</span>
          <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {profit.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between border-t border-blue-200 pt-2">
          <span className="font-semibold text-slate-900">Margem de Lucro:</span>
          <span className={`font-bold text-lg ${profit_margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profit_margin.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
          {initialData?.id ? "Atualizar" : "Cadastrar"} Produto
        </Button>
      </div>
    </form>
  );
}
