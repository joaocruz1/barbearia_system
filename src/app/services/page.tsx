"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { servicesApi, type Service, type CreateServiceData } from "@/lib/api";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Search,
  Filter,
} from "lucide-react";

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [newService, setNewService] = useState({
    name: "",
    price: "",
    durationMinutes: "",
    isActive: true,
  });

  const [editService, setEditService] = useState({
    name: "",
    price: "",
    durationMinutes: "",
    isActive: true,
  });

  // API calls
  const {
    data: services,
    loading: servicesLoading,
    refetch: refetchServices,
  } = useApi<Service[]>(() => servicesApi.getAll(), []);

  // Filtered services
  const filteredServices =
    services?.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterActive === "all" ||
        (filterActive === "active" && service.isActive) ||
        (filterActive === "inactive" && !service.isActive);

      return matchesSearch && matchesFilter;
    }) || [];

  // Mutations
  const { mutate: createService, loading: creatingService } = useMutation(
    (data: CreateServiceData) => servicesApi.create(data)
  );

  const { mutate: updateService, loading: updatingService } = useMutation(
    ({ id, data }: { id: string; data: any }) =>
      fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update service");
        return res.json();
      })
  );

  const { mutate: deleteService, loading: deletingService } = useMutation(
    async (id: string) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || "Failed to delete service");
        (error as any).status = response.status;
        (error as any).message = errorData.error;
        throw error;
      }

      return response.json();
    }
  );

  const handleCreateService = async () => {
    if (!newService.name || !newService.price || !newService.durationMinutes) {
      toast.error("Erro", {
        description: "Nome, preço e duração são obrigatórios",
      });
      return;
    }

    const serviceData: CreateServiceData = {
      name: newService.name,
      price: parseFloat(newService.price),
      durationMinutes: parseInt(newService.durationMinutes),
      isActive: newService.isActive,
    };

    try {
      await createService(serviceData);
      toast.success("Sucesso", {
        description: "Serviço criado com sucesso!",
      });
      setNewService({
        name: "",
        price: "",
        durationMinutes: "",
        isActive: true,
      });
      setIsCreateDialogOpen(false);
      refetchServices();
    } catch (error) {
      toast.error("Erro", {
        description: "Falha ao criar serviço. Tente novamente.",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setEditService({
      name: service.name,
      price: service.price.toString(),
      durationMinutes: service.durationMinutes.toString(),
      isActive: service.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    if (
      !editService.name ||
      !editService.price ||
      !editService.durationMinutes
    ) {
      toast.error("Erro", {
        description: "Nome, preço e duração são obrigatórios",
      });
      return;
    }

    const serviceData = {
      name: editService.name,
      price: parseFloat(editService.price),
      durationMinutes: parseInt(editService.durationMinutes),
      isActive: editService.isActive,
    };

    try {
      await updateService({ id: editingService.id, data: serviceData });
      toast.success("Sucesso", {
        description: "Serviço atualizado com sucesso!",
      });
      setIsEditDialogOpen(false);
      setEditingService(null);
      refetchServices();
    } catch (error) {
      toast.error("Erro", {
        description: "Falha ao atualizar serviço. Tente novamente.",
      });
    }
  };

  const handleDeleteService = async () => {
    if (!editingService) return;

    try {
      const response = await deleteService(editingService.id);

      // Se chegou aqui, foi sucesso
      toast.success("Sucesso", {
        description: response.message || "Serviço excluído com sucesso!",
      });
      setIsDeleteDialogOpen(false);
      setEditingService(null);
      refetchServices();
    } catch (error: any) {
      // Verificar se é erro de validação (400) ou erro de servidor (500)
      if (error.status === 400) {
        // Erro de validação - mostrar mensagem específica
        toast.error("Não é possível excluir", {
          description: error.message || "Este serviço não pode ser excluído.",
          duration: 5000,
        });
      } else {
        // Erro genérico
        toast.error("Erro", {
          description: "Falha ao excluir serviço. Tente novamente.",
        });
      }
    }
  };

  const openDeleteDialog = (service: Service) => {
    setEditingService(service);
    setIsDeleteDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold text-black">
            Gerenciar Serviços
          </h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
              <p className="text-gray-600 mt-1">
                Gerencie todos os serviços oferecidos pela barbearia
              </p>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar por nome</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Digite o nome do serviço..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter">Status</Label>
                  <Select
                    value={filterActive}
                    onValueChange={(value: "all" | "active" | "inactive") =>
                      setFilterActive(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterActive("all");
                    }}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum serviço encontrado
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchTerm || filterActive !== "all"
                    ? "Tente ajustar os filtros ou criar um novo serviço"
                    : "Comece criando seu primeiro serviço"}
                </p>
                {!searchTerm && filterActive === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Serviço
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Criado em{" "}
                          {new Date(service.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                      >
                        {service.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Preço</span>
                      </div>
                      <span className="font-semibold text-lg">
                        R$ {Number(service.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Duração</span>
                      </div>
                      <span className="font-semibold">
                        {service.durationMinutes} min
                      </span>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditService(service)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(service)}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Create Service Dialog */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Serviço</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo serviço oferecido pela
                  barbearia.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Corte Masculino"
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={newService.durationMinutes}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        durationMinutes: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isActive">Status</Label>
                  <Select
                    value={newService.isActive ? "true" : "false"}
                    onValueChange={(value) =>
                      setNewService({
                        ...newService,
                        isActive: value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateService}
                  disabled={creatingService}
                >
                  {creatingService ? "Criando..." : "Criar Serviço"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Service Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Serviço</DialogTitle>
                <DialogDescription>
                  Altere as informações do serviço selecionado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Serviço *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Ex: Corte Masculino"
                    value={editService.name}
                    onChange={(e) =>
                      setEditService({ ...editService, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço (R$) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={editService.price}
                    onChange={(e) =>
                      setEditService({ ...editService, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duração (minutos) *</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={editService.durationMinutes}
                    onChange={(e) =>
                      setEditService({
                        ...editService,
                        durationMinutes: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-isActive">Status</Label>
                  <Select
                    value={editService.isActive ? "true" : "false"}
                    onValueChange={(value) =>
                      setEditService({
                        ...editService,
                        isActive: value === "true",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateService}
                  disabled={updatingService}
                >
                  {updatingService ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Service Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir o serviço "
                  {editingService?.name}"? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteService}
                  disabled={deletingService}
                >
                  {deletingService ? "Excluindo..." : "Excluir Serviço"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Hook para mutations
function useMutation<T>(mutationFn: (data: T) => Promise<any>) {
  const [loading, setLoading] = useState(false);

  const mutate = async (data: T) => {
    setLoading(true);
    try {
      const result = await mutationFn(data);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading };
}
