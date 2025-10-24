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
import { Trash2, Edit, Wrench, Copy } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Services() {
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const data = await base44.entities.Service.list();
      // Ordenar localmente por data de criação (mais recente primeiro)
      return data.sort((a: any, b: any) => {
        const dateA = new Date(a.created_date || a.service_date).getTime();
        const dateB = new Date(b.created_date || b.service_date).getTime();
        return dateB - dateA;
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('Criando serviço:', data);
      return base44.entities.Service.create(data);
    },
    onSuccess: (response) => {
      console.log('Serviço criado com sucesso:', response);
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Serviço cadastrado com sucesso!");
      setShowForm(false);
      setEditingService(null);
    },
    onError: (error: any) => {
      console.error('Erro ao criar serviço:', error);
      toast.error(error?.message || "Erro ao cadastrar serviço");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      console.log('Atualizando serviço:', id, data);
      return base44.entities.Service.update(id, data);
    },
    onSuccess: (response) => {
      console.log('Serviço atualizado:', response);
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Serviço atualizado com sucesso!");
      setEditingService(null);
      setShowForm(false);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar serviço:', error);
      toast.error(error?.message || "Erro ao atualizar serviço");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success("Serviço excluído com sucesso!");
    },
  });

  const handleClone = async (service: any) => {
    const { id, created_date, updated_date, ...clonedData } = service;
    await createMutation.mutateAsync(clonedData);
  };

  const totalRevenue = services.reduce((sum: number, s: any) => sum + (s.total_value || 0), 0);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Serviços</h1>
          <p className="text-slate-600">Gerencie serviços prestados</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total de Serviços</p>
                  <p className="text-2xl font-bold">{services.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Wrench className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Receita Total</p>
                  <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => { setShowForm(!showForm); setEditingService(null); }}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Wrench className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {showForm && (
          <ServiceForm
            initialData={editingService}
            onSubmit={(data) => {
              if (editingService) {
                updateMutation.mutate({ id: editingService.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => { setShowForm(false); setEditingService(null); }}
          />
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Data</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service: any) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{service.service_date ? format(new Date(service.service_date), "dd/MM/yyyy") : "-"}</span>
                        {service.created_date && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full w-fit">
                            📅 {format(new Date(service.created_date), "dd/MM/yy HH:mm")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{service.service_name}</TableCell>
                    <TableCell>{service.client_name || "-"}</TableCell>
                    <TableCell>{service.service_type}</TableCell>
                    <TableCell>
                      <Badge variant={service.status === 'concluido' ? 'default' : service.status === 'em_andamento' ? 'secondary' : 'outline'}>
                        {service.status === 'em_andamento' ? 'Em Andamento' : service.status === 'concluido' ? 'Concluído' : service.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.hours_worked}h</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      R$ {service.total_value?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClone(service)}
                          title="Clonar"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingService(service); setShowForm(true); }}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm("Deseja excluir este serviço?")) {
                              deleteMutation.mutate(service.id);
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

function ServiceForm({ initialData, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    service_name: initialData?.service_name || "",
    service_type: initialData?.service_type || "hora_maquina",
    machine_name: initialData?.machine_name || "",
    hourly_rate: initialData?.hourly_rate || 0,
    hours_worked: initialData?.hours_worked || 0,
    client_name: initialData?.client_name || "",
    service_date: initialData?.service_date || new Date().toISOString().split('T')[0],
    status: initialData?.status || "em_andamento",
    notes: initialData?.notes || ""
  });

  const totalValue = (parseFloat(String(formData.hourly_rate)) || 0) * (parseFloat(String(formData.hours_worked)) || 0);

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardTitle>{initialData ? 'Editar' : 'Novo'} Serviço</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          onSubmit({ ...formData, total_value: totalValue }); 
        }} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Serviço *</Label>
              <Input
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Tipo de Serviço</Label>
              <Select value={formData.service_type} onValueChange={(v) => setFormData({ ...formData, service_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hora_maquina">Hora Máquina</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Máquina/Equipamento</Label>
              <Input
                value={formData.machine_name}
                onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Cliente</Label>
              <Input
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Valor por Hora (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Horas Trabalhadas</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.hours_worked}
                onChange={(e) => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Data do Serviço</Label>
              <Input
                type="date"
                value={formData.service_date}
                onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">Valor Total:</span>
              <span className="text-2xl font-bold text-green-600">R$ {totalValue.toFixed(2)}</span>
            </div>
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
