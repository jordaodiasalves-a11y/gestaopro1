import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Users } from "lucide-react";

interface SaleFormProps {
  products: any[];
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function SaleForm({ products, onSubmit, initialData, onCancel }: SaleFormProps) {
  const [useRegisteredCustomer, setUseRegisteredCustomer] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    quantity: 1,
    sale_date: new Date().toISOString().split('T')[0],
    customer_name: "",
    customer_id: "",
    notes: ""
  });

  // Carregar clientes
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list(),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        product_id: initialData.product_id || "",
        quantity: initialData.quantity || 1,
        sale_date: initialData.sale_date || new Date().toISOString().split('T')[0],
        customer_name: initialData.customer_name || "",
        customer_id: initialData.customer_id || "",
        notes: initialData.notes || ""
      });
    } else {
      setFormData({
        product_id: "",
        quantity: 1,
        sale_date: new Date().toISOString().split('T')[0],
        customer_name: "",
        customer_id: "",
        notes: ""
      });
    }
  }, [initialData]);

  const selectedProduct = products.find(p => p.id === formData.product_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      console.error('Nenhum produto selecionado');
      return;
    }

    const quantity = parseInt(String(formData.quantity)) || 1;
    
    // Verificar se há estoque suficiente
    const currentStock = selectedProduct.stock_quantity || 0;
    if (currentStock < quantity) {
      alert(`Estoque insuficiente! Disponível: ${currentStock}, Solicitado: ${quantity}`);
      return;
    }

    const saleData = {
      product_id: formData.product_id,
      product_name: `${selectedProduct.product_name} - ${selectedProduct.variation_name}`,
      quantity: quantity,
      unit_price: parseFloat(String(selectedProduct.sale_price)) || 0,
      unit_cost: parseFloat(String(selectedProduct.total_cost)) || 0,
      total_revenue: (parseFloat(String(selectedProduct.sale_price)) || 0) * quantity,
      total_cost: (parseFloat(String(selectedProduct.total_cost)) || 0) * quantity,
      total_profit: ((parseFloat(String(selectedProduct.sale_price)) || 0) - (parseFloat(String(selectedProduct.total_cost)) || 0)) * quantity,
      sale_date: formData.sale_date,
      customer_name: formData.customer_name || "",
      notes: formData.notes || ""
    };

    console.log('Enviando venda:', saleData);
    onSubmit(saleData);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          {initialData ? 'Editar Venda' : 'Nova Venda'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product_id">Produto *</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.product_name} - {product.variation_name} (R$ {product.sale_price?.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="sale_date">Data da Venda</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="customer_name">Cliente (Opcional)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUseRegisteredCustomer(!useRegisteredCustomer);
                  setFormData({ ...formData, customer_name: "", customer_id: "" });
                }}
                className="text-xs"
              >
                <Users className="w-3 h-3 mr-1" />
                {useRegisteredCustomer ? 'Digitar Livre' : 'Clientes Cadastrados'}
              </Button>
            </div>
            
            {useRegisteredCustomer ? (
              <Select
                value={formData.customer_id}
                onValueChange={(value) => {
                  const customer = customers.find((c: any) => c.id === value);
                  setFormData({ 
                    ...formData, 
                    customer_id: value,
                    customer_name: customer ? customer.company_name || customer.name : ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.company_name || customer.name} - {customer.cnpj || customer.cpf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Ex: João Silva"
              />
            )}
          </div>

          <div>
            <Label htmlFor="notes">Observações (Opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais sobre a venda"
              rows={3}
            />
          </div>

          {selectedProduct && (
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Receita Total:</span>
                <span className="font-bold text-green-600">
                  R$ {(selectedProduct.sale_price * parseInt(String(formData.quantity) || "1")).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Custo Total:</span>
                <span className="font-bold text-slate-700">
                  R$ {(selectedProduct.total_cost * parseInt(String(formData.quantity) || "1")).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-green-200 pt-2">
                <span className="font-semibold text-slate-900">Lucro:</span>
                <span className="font-bold text-lg text-green-600">
                  R$ {((selectedProduct.sale_price - selectedProduct.total_cost) * parseInt(String(formData.quantity) || "1")).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={!formData.product_id}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {initialData ? 'Salvar Alterações' : 'Registrar Venda'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
