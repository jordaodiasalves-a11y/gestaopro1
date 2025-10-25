import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getProductMeta, saveProductMeta } from "@/utils/productMeta";
import { saveFileLocally, getLocalFile, deleteLocalFile } from "@/utils/localFileStorage";
import { toast } from "sonner";

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
    components_text: "",
    material_cost: 0,
    labor_cost: 0,
    other_costs: 0,
    sale_price: 0,
    stock_quantity: 0,
    minimum_stock: 0,
    image_url: "",
    image_url_2: "",
    notes: ""
  });

  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Se vier array em "components", preservamos como texto de apoio
        components_text: (initialData.components_text ?? (typeof initialData.components === 'string' ? initialData.components : '')) || prev.components_text,
      }));

      // Prioriza cost_items do registro; se ausente, tenta meta local
      try {
        let items: any = undefined;
        if (initialData.cost_items) {
          items = typeof initialData.cost_items === 'string' ? JSON.parse(initialData.cost_items) : initialData.cost_items;
        }
        if (!items || !Array.isArray(items)) {
          const meta = getProductMeta(initialData.id);
          if (meta?.cost_items) items = meta.cost_items;
          if (meta?.components_text && !initialData.components_text) {
            setFormData(prev => ({ ...prev, components_text: meta.components_text! }));
          }
        }
        setCostItems(Array.isArray(items) ? items : []);
      } catch (e) {
        console.warn('Falha ao parsear cost_items, usando []', e);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageField: 'image_url' | 'image_url_2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    setUploadingImage(true);
    try {
      const storedFile = await saveFileLocally(file);
      setFormData({ ...formData, [imageField]: storedFile.data });
      toast.success('Imagem salva localmente!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (imageField: 'image_url' | 'image_url_2') => {
    setFormData({ ...formData, [imageField]: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeCostItems = Array.isArray(costItems) ? costItems : [];
    const submitData = {
      ...formData,
      // Enviar components como array (linhas) e também em texto
      components: formData.components_text
        ? formData.components_text.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
      components_text: formData.components_text,
      // Gravamos os itens detalhados em ambos formatos para máxima compatibilidade
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

    // Salvar metadados localmente para backup
    if (initialData?.id || submitData.product_name) {
      const productId = initialData?.id || `${Date.now()}`;
      saveProductMeta(productId, {
        components_text: submitData.components_text,
        cost_items: safeCostItems,
      });
    }

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

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Imagem Principal</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'image_url')}
                disabled={uploadingImage}
                className="flex-1"
              />
              {formData.image_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage('image_url')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.image_url && (
              <img src={formData.image_url} alt="Preview 1" className="h-32 w-full object-cover rounded" />
            )}
          </div>
        </div>

        <div>
          <Label>Imagem Secundária</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'image_url_2')}
                disabled={uploadingImage}
                className="flex-1"
              />
              {formData.image_url_2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage('image_url_2')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.image_url_2 && (
              <img src={formData.image_url_2} alt="Preview 2" className="h-32 w-full object-cover rounded" />
            )}
          </div>
        </div>
      </div>

      <div>
        <Label>Componentes/Descrição</Label>
        <Textarea
          value={formData.components_text}
          onChange={(e) => setFormData({ ...formData, components_text: e.target.value })}
          rows={3}
          placeholder="Descreva os componentes ou características... (também será salvo em backup local)"
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

      {/* Caixa adicional de backup local */}
      <div className="bg-accent/30 border border-accent/60 p-4 rounded-md mb-2">
        <p className="text-sm text-muted-foreground">
          Para garantir persistência, os campos acima também são salvos em backup local e reaplicados ao editar o produto.
        </p>
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