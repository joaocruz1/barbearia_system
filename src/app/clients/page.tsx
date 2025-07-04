"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, User, Phone, Edit, Trash2, Star, Crown, Calendar, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useApi, useMutation } from "@/hooks/use-api"
import { clientsApi, plansApi, type Client, type Plan, type CreateClientData } from "@/lib/api"
import { toast } from "sonner"

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("all")
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    planId: "",
  })

  const [editClient, setEditClient] = useState({
    name: "",
    phone: "",
    email: "",
    planId: "",
  })

  // API calls
  const {
    data: clients,
    loading: clientsLoading,
    refetch: refetchClients,
  } = useApi<Client[]>(
    () =>
      clientsApi.getAll({
        search: searchTerm,
        planId: selectedPlan === "all" ? undefined : selectedPlan,
      }),
    [searchTerm, selectedPlan],
  )

  const { data: plans, loading: plansLoading } = useApi<Plan[]>(() => plansApi.getAll(), [])

  // Mutations
  const { mutate: createClient, loading: creatingClient } = useMutation((data: CreateClientData) =>
    clientsApi.create(data),
  )

  const { mutate: updateClient, loading: updatingClient } = useMutation(({ id, data }: { id: string; data: any }) =>
    fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to update client")
      return res.json()
    }),
  )

  const { mutate: deleteClient, loading: deletingClient } = useMutation((id: string) =>
    fetch(`/api/clients/${id}`, {
      method: "DELETE",
    }).then((res) => {
      if (!res.ok) throw new Error("Failed to delete client")
      return res.json()
    }),
  )

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.phone) {
      toast.error("Erro", {
        description: "Nome e telefone são obrigatórios",
      })
      return
    }

    const clientData: CreateClientData = {
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email || undefined,
      planId: newClient.planId || undefined,
      planStartDate: newClient.planId ? new Date().toISOString().split("T")[0] : undefined,
      planEndDate: newClient.planId
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : undefined,
    }

    try {
      await createClient(clientData)
      toast.success("Sucesso", {
        description: "Cliente cadastrado com sucesso!",
      })
      setNewClient({
        name: "",
        phone: "",
        email: "",
        planId: "",
      })
      setIsCreateDialogOpen(false)
      refetchClients()
    } catch (error) {
      toast.error("Erro", {
        description: "Falha ao cadastrar cliente. Verifique se o telefone já não está em uso.",
      })
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setEditClient({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      planId: client.planId || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateClient = async () => {
    if (!editingClient) return

    if (!editClient.name || !editClient.phone) {
      toast.error("Erro", {
        description: "Nome e telefone são obrigatórios",
      })
      return
    }

    const updateData = {
      name: editClient.name,
      phone: editClient.phone,
      email: editClient.email || null,
      planId: editClient.planId || null,
      planStartDate:
        editClient.planId && !editingClient.planId
          ? new Date().toISOString().split("T")[0]
          : editingClient.planStartDate,
      planEndDate:
        editClient.planId && !editingClient.planId
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : editingClient.planEndDate,
      isActive: true,
    }

    try {
      await updateClient({ id: editingClient.id, data: updateData })
      toast.success("Sucesso", {
        description: "Cliente atualizado com sucesso!",
      })
      setIsEditDialogOpen(false)
      setEditingClient(null)
      refetchClients()
    } catch (error) {
      toast.error("Erro", {
        description: "Falha ao atualizar cliente. Verifique se o telefone já não está em uso.",
      })
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteClient(clientId)
      toast.success("Sucesso", {
        description: "Cliente removido com sucesso!",
      })
      setClientToDelete(null)
      refetchClients()
    } catch (error) {
      toast.error("Erro", {
        description: "Falha ao remover cliente.",
      })
    }
  }

  const getPlanInfo = (planId?: string) => {
    return plans?.find((p) => p.id === planId) || { name: "Avulso", price: 0, id: "avulso" }
  }

  const getClientStats = () => {
    if (!clients) return { total: 0, withPlans: 0, premium: 0, revenue: 0 }
    const total = clients.length
    const withPlans = clients.filter((c) => c.plan && c.plan.name !== "Avulso").length
    const premium = clients.filter((c) => c.plan?.name === "Barbearia Premium").length
    const revenue = clients.reduce((sum, client) => {
      return sum + (client.plan ? Number(client.plan.price) : 0)
    }, 0)
    return { total, withPlans, premium, revenue }
  }

  const stats = getClientStats()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold text-black">Gerenciar Clientes</h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {/* Estatísticas */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Clientes</CardTitle>
                <User className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{clientsLoading ? "..." : stats.total}</div>
                <p className="text-xs text-gray-500">Clientes cadastrados</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Com Planos</CardTitle>
                <Star className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{clientsLoading ? "..." : stats.withPlans}</div>
                <p className="text-xs text-gray-500">Assinantes ativos</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Premium</CardTitle>
                <Crown className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{clientsLoading ? "..." : stats.premium}</div>
                <p className="text-xs text-gray-500">Clientes premium</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Receita Mensal</CardTitle>
                <Calendar className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  R$ {clientsLoading ? "..." : stats.revenue.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">Planos ativos</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-4 bg-white border border-gray-200">
                <TabsTrigger value="all" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="premium" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Premium
                </TabsTrigger>
                <TabsTrigger value="vip" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  VIP
                </TabsTrigger>
                <TabsTrigger value="avulso" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Avulso
                </TabsTrigger>
              </TabsList>

              {/* Dialog para Criar Cliente */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white border border-gray-200">
                  <DialogHeader>
                    <DialogTitle className="text-black">Cadastrar Novo Cliente</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Preencha os dados para cadastrar um novo cliente
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName" className="text-black">
                        Nome Completo
                      </Label>
                      <Input
                        id="clientName"
                        placeholder="Digite o nome do cliente"
                        value={newClient.name}
                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                        className="border-gray-300 focus:border-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone" className="text-black">
                        Telefone
                      </Label>
                      <Input
                        id="clientPhone"
                        placeholder="(35) 99999-9999"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        className="border-gray-300 focus:border-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail" className="text-black">
                        Email
                      </Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="cliente@email.com"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        className="border-gray-300 focus:border-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plan" className="text-black">
                        Plano
                      </Label>
                      <Select onValueChange={(value) => setNewClient({ ...newClient, planId: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-black">
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                          {plansLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          ) : (
                            plans?.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{plan.name}</span>
                                  {Number(plan.price) > 0 && (
                                    <span className="text-sm text-gray-500 ml-2">
                                      R$ {Number(plan.price).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateClient}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={creatingClient}
                  >
                    {creatingClient ? "Cadastrando..." : "Cadastrar Cliente"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            {/* Dialog para Editar Cliente */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-md bg-white border border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-black">Editar Cliente</DialogTitle>
                  <DialogDescription className="text-gray-600">Atualize os dados do cliente</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editClientName" className="text-black">
                      Nome Completo
                    </Label>
                    <Input
                      id="editClientName"
                      placeholder="Digite o nome do cliente"
                      value={editClient.name}
                      onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                      className="border-gray-300 focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editClientPhone" className="text-black">
                      Telefone
                    </Label>
                    <Input
                      id="editClientPhone"
                      placeholder="(35) 99999-9999"
                      value={editClient.phone}
                      onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                      className="border-gray-300 focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editClientEmail" className="text-black">
                      Email
                    </Label>
                    <Input
                      id="editClientEmail"
                      type="email"
                      placeholder="cliente@email.com"
                      value={editClient.email}
                      onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                      className="border-gray-300 focus:border-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editPlan" className="text-black">
                      Plano
                    </Label>
                    <Select
                      value={editClient.planId}
                      onValueChange={(value) => setEditClient({ ...editClient, planId: value })}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-black">
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem plano (Avulso)</SelectItem>
                        {plansLoading ? (
                          <SelectItem value="loading" disabled>
                            Carregando...
                          </SelectItem>
                        ) : (
                          plans?.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{plan.name}</span>
                                {Number(plan.price) > 0 && (
                                  <span className="text-sm text-gray-500 ml-2">R$ {Number(plan.price).toFixed(2)}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleUpdateClient}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                  disabled={updatingClient}
                >
                  {updatingClient ? "Atualizando..." : "Atualizar Cliente"}
                </Button>
              </DialogContent>
            </Dialog>

            {/* Alert Dialog para Confirmar Exclusão */}
            <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
              <AlertDialogContent className="bg-white border border-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-black">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Confirmar Exclusão
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita. O cliente será
                    desativado no sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-300">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deletingClient}
                  >
                    {deletingClient ? "Removendo..." : "Remover Cliente"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <TabsContent value="all" className="space-y-6">
              {/* Filtros */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 flex-1">
                      <Search className="h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Buscar por nome, telefone ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm border-gray-300 focus:border-black"
                      />
                    </div>
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger className="w-40 border-gray-300 focus:border-black">
                        <SelectValue placeholder="Filtrar por plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os planos</SelectItem>
                        {plans?.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de clientes */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">Clientes Cadastrados</CardTitle>
                  <CardDescription className="text-gray-600">
                    {clientsLoading ? "Carregando..." : `${clients?.length || 0} cliente(s) encontrado(s)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clientsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center space-x-4 p-6 border border-gray-200 rounded-xl">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !clients || clients.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum cliente encontrado</p>
                      </div>
                    ) : (
                      clients.map((client) => {
                        const planInfo = getPlanInfo(client.planId)
                        const getColorClass = (planName: string) => {
                          if (planName.includes("Premium")) return "bg-black"
                          if (planName.includes("Cabelo")) return "bg-gray-800"
                          if (planName.includes("Barba")) return "bg-gray-600"
                          return "bg-gray-400"
                        }

                        return (
                          <div
                            key={client.id}
                            className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 ${getColorClass(planInfo.name)} rounded-full flex items-center justify-center`}
                              >
                                {client.plan && client.plan.name !== "Avulso" ? (
                                  <Star className="h-5 w-5 text-white" />
                                ) : (
                                  <User className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-black">{client.name}</p>
                                  {client.plan?.name === "Barbearia Premium" && (
                                    <Crown className="h-4 w-4 text-black" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{client.phone}</span>
                                  </div>
                                  {client.email && <span>{client.email}</span>}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span>Agendamentos: {client._count?.appointments || 0}</span>
                                  {client.planEndDate && (
                                    <span>
                                      Plano válido até: {new Date(client.planEndDate).toLocaleDateString("pt-BR")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <Badge className={`${getColorClass(planInfo.name)} text-white mb-2 border-0`}>
                                  {planInfo.name}
                                </Badge>
                                {client.plan && client.plan.name !== "Avulso" && (
                                  <div className="text-xs text-gray-500">
                                    <p>R$ {Number(client.plan.price).toFixed(2)}/mês</p>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-black"
                                onClick={() => handleEditClient(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setClientToDelete(client.id)}
                                className="text-gray-600 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Outras tabs podem ser implementadas de forma similar */}
            <TabsContent value="premium">
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">Clientes Premium</CardTitle>
                  <CardDescription className="text-gray-600">Clientes com plano Barbearia Premium</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">Filtro específico em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vip">
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">Clientes VIP</CardTitle>
                  <CardDescription className="text-gray-600">
                    Clientes com planos Cabelo VIP ou Barba VIP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">Filtro específico em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="avulso">
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">Clientes Avulsos</CardTitle>
                  <CardDescription className="text-gray-600">Clientes que pagam por serviço</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">Filtro específico em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
