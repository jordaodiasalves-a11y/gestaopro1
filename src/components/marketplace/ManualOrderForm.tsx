import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { addMarketplaceOrder } from '@/utils/marketplaceSync';

interface OrderItem {
  product: string;
  quantity: number;
  location: string;
}

interface ManualOrderFormProps {
  onOrderCreated: () => void;
}

export function ManualOrderForm({ onOrderCreated }: ManualOrderFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ product: '', quantity: 0, location: '' }]);

  const addItem = () => {
    setItems([...items, { product: '', quantity: 0, location: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber || !customerName) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (items.some(item => !item.product || item.quantity <= 0)) {
      toast.error('Todos os itens devem ter produto e quantidade válida');
      return;
    }

    // Usar o sistema de sincronização
    addMarketplaceOrder({
      order_number: orderNumber,
      customer_name: customerName,
      items,
      status: 'pendente',
      created_date: new Date().toISOString(),
      source: 'manual'
    });

    toast.success('Pedido registrado com sucesso!');
    setIsOpen(false);
    setOrderNumber('');
    setCustomerName('');
    setItems([{ product: '', quantity: 0, location: '' }]);
    onOrderCreated();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <FileText className="w-5 h-5" />
          Registrar Pedido Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Registrar Pedido Manualmente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Número do Pedido *</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex: MP-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome do Cliente *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Itens do Pedido</Label>
              <Button type="button" onClick={addItem} size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-accent/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Produto *</Label>
                    <Input
                      value={item.product}
                      onChange={(e) => updateItem(index, 'product', e.target.value)}
                      placeholder="Nome do produto"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Localização no Estoque</Label>
                    <Input
                      value={item.location}
                      onChange={(e) => updateItem(index, 'location', e.target.value)}
                      placeholder="Ex: Estoque A - Prateleira 3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Registrar Pedido
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
