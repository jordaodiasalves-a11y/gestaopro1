import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, FileText, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Invoices() {
  const queryClient = useQueryClient();
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list(),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => base44.entities.Invoice.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Nota fiscal cadastrada com sucesso!");
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => base44.entities.Invoice.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Nota fiscal atualizada com sucesso!");
      setEditingInvoice(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Invoice.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success("Nota fiscal excluída com sucesso!");
    },
  });

  const handleClone = async (invoice: any) => {
    const { id, created_date, updated_date, ...clonedData } = invoice;
    await createMutation.mutateAsync(clonedData);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Notas Fiscais de Entrada</h1>
          <p className="text-slate-600">Gerencie as notas fiscais de seus fornecedores</p>
        </div>

        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => { setShowForm(!showForm); setEditingInvoice(null); }}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Nova NF
          </Button>
        </div>

        {showForm && (
          <InvoiceForm
            suppliers={suppliers}
            initialData={editingInvoice}
            onSubmit={(data) => {
              if (editingInvoice) {
                updateMutation.mutate({ id: editingInvoice.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowForm(false); setEditingInvoice(null); }}
          />
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Número</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Emissão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.supplier_name || "-"}</TableCell>
                    <TableCell className="font-semibold">R$ {invoice.total_value?.toFixed(2)}</TableCell>
                    <TableCell>
                      {invoice.issue_date ? format(new Date(invoice.issue_date), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleClone(invoice)} title="Clonar">
                          <Copy className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingInvoice(invoice); setShowForm(true); }} title="Editar">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (window.confirm("Deseja excluir esta nota fiscal?")) { deleteMutation.mutate(invoice.id); }}} title="Excluir">
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

function InvoiceForm({ suppliers, initialData, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState(initialData || {
    invoice_number: "",
    supplier_id: "",
    supplier_name: "",
    total_value: 0,
    issue_date: new Date().toISOString().split('T')[0],
    document_url: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardTitle>{initialData ? 'Editar' : 'Nova'} Nota Fiscal</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nº da Nota *</Label>
              <Input
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Fornecedor</Label>
              <Select 
                value={formData.supplier_id} 
                onValueChange={(v) => {
                  const supplier = suppliers.find((s: any) => s.id === v);
                  setFormData({ 
                    ...formData, 
                    supplier_id: v,
                    supplier_name: supplier?.name || ""
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                {suppliers.map((supplier: any) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Valor Total (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.total_value}
                onChange={(e) => setFormData({ ...formData, total_value: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Data de Emissão</Label>
              <Input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Anexar Documento</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="cursor-pointer"
              />
              {selectedFile && (
                <span className="text-sm text-slate-600">{selectedFile.name}</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Nenhum arquivo escolhido</p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-green-600">
              Salvar Nota Fiscal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
