import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface CostItem {
  description: string;
  cost: number;
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
    minimum_stock: 0,
    image_url: "",
    notes: ""
  });

  const [costItems, setCostItems] = useState<CostItem[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Parse cost_items com segurança (pode vir string JSON, array ou vazio)
      if (initialData.cost_items) {
        try {
          const parsedItems = typeof initialData.cost_items === 'string'
            ? JSON.parse(initialData.cost_items)
            : initialData.cost_items;
          setCostItems(Array.isArray(parsedItems) ? parsedItems : []);
        } catch (e) {
          console.warn('Falha ao parsear cost_items, usando []', e);
          setCostItems([]);
        }
      } else {
        setCostItems([]);
      }
    }
  }, [initialData]);

  const addCostItem = () => {
    setCostItems([...costItems, { description: "", cost: 0 }]);
  };

  const removeCostItem = (index: number) => {
    setCostItems(costItems.filter((_, i) => i !== index));
  };

  const updateCostItem = (index: number, field: 'description' | 'cost', value: string | number) => {
    const updated = [...costItems];
    updated[index] = { ...updated[index], [field]: value };
    setCostItems(updated);
  };

  const total_cost_items = costItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const total_cost = (parseFloat(String(formData.material_cost)) || 0) + 
                     (parseFloat(String(formData.labor_cost)) || 0) + 
                     (parseFloat(String(formData.other_costs)) || 0) +
                     total_cost_items;
  const profit = (parseFloat(String(formData.sale_price)) || 0) - total_cost;
  const profit_margin = formData.sale_price > 0 ? (profit / formData.sale_price) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeCostItems = Array.isArray(costItems) ? costItems : [];
    const submitData = {
      ...formData,
      components: [], // API espera array
      // Gravamos em ambos formatos para máxima compatibilidade
      cost_items: JSON.stringify(safeCostItems),
      cost_items_array: safeCostItems,
      total_cost,
      profit_margin,
      material_cost: parseFloat(String(formData.material_cost)) || 0,
      labor_cost: parseFloat(String(formData.labor_cost)) || 0,
      other_costs: parseFloat(String(formData.other_costs)) || 0,
      sale_price: parseFloat(String(formData.sale_price)) || 0,
      stock_quantity: parseInt(String(formData.stock_quantity)) || 0,
      minimum_stock: parseInt(String(formData.minimum_stock)) || 0,
    };
    console.log('Submetendo produto com cost_items:', submitData.cost_items);
    onSubmit(submitData);
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
        <Label>URL da Imagem</Label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://exemplo.com/imagem.jpg"
        />
        {formData.image_url && (
          <img src={formData.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />
        )}
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

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <Label className="text-base font-semibold">Itens de Custo Detalhados</Label>
          <Button type="button" onClick={addCostItem} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Adicionar Item
          </Button>
        </div>
        
        {costItems.map((item, index) => (
          <Card key={index} className="p-3 mb-3 bg-slate-50">
            <div className="grid md:grid-cols-[2fr,1fr,auto] gap-3 items-end">
              <div>
                <Label className="text-xs">Descrição do Item</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateCostItem(index, 'description', e.target.value)}
                  placeholder="Ex: MDF 15mm, Tinta acrílica..."
                />
              </div>
              <div>
                <Label className="text-xs">Custo (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.cost}
                  onChange={(e) => updateCostItem(index, 'cost', parseFloat(e.target.value) || 0)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCostItem(index)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </Card>
        ))}
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

      <div className="grid md:grid-cols-3 gap-4">
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
        <div>
          <Label>Estoque Mínimo</Label>
          <Input
            type="number"
            value={formData.minimum_stock}
            onChange={(e) => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          placeholder="Informações adicionais sobre o produto..."
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
        {costItems.length > 0 && (
          <div className="flex justify-between pb-2 border-b border-blue-200">
            <span className="font-medium text-slate-700">Custo Itens Detalhados:</span>
            <span className="font-bold text-slate-900">R$ {total_cost_items.toFixed(2)}</span>
          </div>
        )}
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