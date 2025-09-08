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
import { Plus, Search, User, Phone, Edit, Trash2, Star, Crown, Calendar, AlertTriangle, CreditCard, CheckCircle, Clock, RefreshCw } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("all")

  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    planId: "",
    planStartDate: "",
  })

  const [editClient, setEditClient] = useState({
    name: "",
    phone: "",
    email: "",
    planId: "",
    planStartDate: "",
  })

  // Função auxiliar para formatar datas
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === null || dateString === undefined) {
      return "Não definido"
    }
    
    try {
      // Usar uma abordagem mais robusta para evitar problemas de timezone
      // Dividir a string de data em partes e criar a data localmente
      const dateParts = dateString.split('T')[0].split('-') // Remove horário se existir e divide por '-'
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1 // Mês é 0-indexado
        const day = parseInt(dateParts[2])
        
        const localDate = new Date(year, month, day)
        const result = localDate.toLocaleDateString("pt-BR")
        return result
      }
      
      // Fallback para o método anterior
      const result = new Date(dateString + 'T00:00:00').toLocaleDateString("pt-BR")
      return result
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return "Data inválida"
    }
  }

  // Função para filtrar clientes baseado na aba ativa
  const getFilteredClients = (clients: Client[]): Client[] => {
    if (!clients) return []
    
    switch (activeTab) {
      case "premium":
        return clients.filter(client => 
          client.plan?.name === "Barbearia Premium"
        )
      case "vip":
        return clients.filter(client => 
          client.plan?.name.includes("VIP")
        )
      case "avulso":
        return clients.filter(client => 
          !client.plan || client.plan.name === "Avulso" || client.plan_status === "not_plan"
        )
      case "all":
      default:
        return clients
    }
  }

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

    // Determinar data de início (hoje se não preenchida)
    const startDate = newClient.planStartDate || new Date().toISOString().split("T")[0]
    
    // Calcular data de fim (sempre 30 dias depois)
    const startDateObj = new Date(startDate)
    const selectedPlan = plans?.find(p => p.id === newClient.planId)
    const isVipPlan = selectedPlan?.name.includes("VIP")
    
    const endDate = new Date(startDateObj)
    endDate.setDate(endDate.getDate() + 30) // Sempre 30 dias (1 mês)

    const clientData: CreateClientData = {
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email || undefined,
      planId: newClient.planId || undefined,
      planStartDate: newClient.planId ? startDate : undefined,
      planEndDate: newClient.planId ? endDate.toISOString().split("T")[0] : undefined,
    }

    try {
      const createdClient = await createClient(clientData)
      
      // Verificar se é plano VIP para mostrar opção de pagamento
      if (isVipPlan) {
        toast.success("Cliente VIP cadastrado!", {
          description: "Cliente cadastrado com sucesso. Deseja gerar link de pagamento?",
          action: {
            label: "Gerar Pagamento",
            onClick: () => {
              // Simular geração de link de pagamento para novo cliente VIP
              generatePaymentLinkForNewClient(createdClient, selectedPlan)
            },
          },
        })
      } else {
        toast.success("Sucesso", {
          description: "Cliente cadastrado com sucesso!",
        })
      }
      
      setNewClient({
        name: "",
        phone: "",
        email: "",
        planId: "",
        planStartDate: "",
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
      planStartDate: client.planStartDate ? new Date(client.planStartDate).toISOString().split("T")[0] : "",
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

    // Verificar se está mudando para um plano VIP
    const selectedPlan = plans?.find(p => p.id === editClient.planId)
    const isVipPlan = selectedPlan?.name.includes("VIP")
    const wasChangingToVip = !editingClient.planId && editClient.planId && isVipPlan

    // Determinar data de início
    let startDate = editClient.planStartDate
    if (!startDate && editClient.planId) {
      startDate = new Date().toISOString().split("T")[0] // Usar hoje se não preenchida
    }

    // Calcular data de fim se necessário (sempre 30 dias)
    let endDate = editingClient.planEndDate
    if (editClient.planId && startDate) {
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(startDateObj)
      endDateObj.setDate(endDateObj.getDate() + 30) // Sempre 30 dias (1 mês)
      endDate = endDateObj.toISOString().split("T")[0]
    }

    const updateData = {
      name: editClient.name,
      phone: editClient.phone,
      email: editClient.email || null,
      planId: editClient.planId || null,
      planStartDate: editClient.planId ? startDate : null,
      planEndDate: editClient.planId ? endDate : null,
      isActive: true,
    }

    try {
      const updatedClient = await updateClient({ id: editingClient.id, data: updateData })
      
      // Se mudou para VIP, mostrar opção de pagamento
      if (wasChangingToVip) {
        toast.success("Cliente atualizado para VIP!", {
          description: "Cliente atualizado com sucesso. Deseja gerar link de pagamento?",
          action: {
            label: "Gerar Pagamento",
            onClick: () => {
              generatePaymentLinkForNewClient(updatedClient, selectedPlan)
            },
          },
        })
      } else {
        toast.success("Sucesso", {
          description: "Cliente atualizado com sucesso!",
        })
      }
      
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

  // Função para verificar status de pagamento
  const getPaymentStatus = (client: Client) => {
    if (!client.plan || client.plan.name === "Avulso") return null
    
    // Verificar se a data de fim do plano já passou
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (client.planEndDate) {
      const endDate = new Date(client.planEndDate)
      endDate.setHours(0, 0, 0, 0)
      
      // Se a data de fim já passou, forçar status "pending"
      if (today > endDate) {
        return { status: "pending", label: "Pendente de pagamento", color: "red" }
      }
    }
    
    // Usar o campo plan_status do banco de dados
    switch (client.plan_status) {
      case "paid":
        return { status: "paid", label: "Pago em dia", color: "green" }
      case "pending":
        return { status: "pending", label: "Pendente de pagamento", color: "red" }
      case "not_plan":
        return { status: "not_plan", label: "Sem plano", color: "gray" }
      default:
        return { status: "unknown", label: "Status desconhecido", color: "gray" }
    }
  }

  // Função para gerar link de pagamento
  const generatePaymentLink = async (client: Client) => {
    try {
      const response = await fetch(`/api/clients/${client.id}/payment-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao gerar link de pagamento")
      }

      toast.success("Link de pagamento gerado", {
        description: `Link: ${data.data.paymentLink}`,
        action: {
          label: "Copiar",
          onClick: () => {
            navigator.clipboard.writeText(data.data.paymentLink)
            toast.success("Link copiado para a área de transferência")
          },
        },
      })
    } catch (error) {
      toast.error("Erro", {
        description: error instanceof Error ? error.message : "Falha ao gerar link de pagamento",
      })
    }
  }

  // Função para marcar plano como pago manualmente
  const markPlanAsPaid = async (client: Client) => {
    try {
      const response = await fetch(`/api/clients/${client.id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao marcar como pago")
      }

      toast.success("Plano marcado como pago!", {
        description: `O plano de ${client.name} foi marcado como pago com sucesso.`,
      })

      // Recarregar a lista de clientes
      refetchClients()
    } catch (error) {
      console.error("Error marking plan as paid:", error)
      toast.error("Erro", {
        description: error instanceof Error ? error.message : "Falha ao marcar plano como pago",
      })
    }
  }

  // Função para atualizar status baseado em datas
  const updateClientStatuses = async () => {
    try {
      const response = await fetch("/api/clients/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao atualizar status")
      }

      toast.success("Status atualizados", {
        description: `${data.updatedCount} cliente(s) tiveram o status atualizado`,
      })

      // Recarregar a lista de clientes
      refetchClients()
    } catch (error) {
      toast.error("Erro", {
        description: error instanceof Error ? error.message : "Falha ao atualizar status",
      })
    }
  }

  // Função para gerar link de pagamento para novo cliente VIP
  const generatePaymentLinkForNewClient = async (client: Client, plan: Plan | undefined) => {
    try {
      // Simular geração de link de pagamento para novo cliente
      const paymentLink = `https://pagamento.barbearia.com/pay/${client.id}?amount=${Number(plan?.price || 0)}&plan=${plan?.name}`
      
      toast.success("Link de pagamento gerado", {
        description: `Link: ${paymentLink}`,
        action: {
          label: "Copiar",
          onClick: () => {
            navigator.clipboard.writeText(paymentLink)
            toast.success("Link copiado para a área de transferência")
          },
        },
      })
    } catch (error) {
      toast.error("Erro", {
        description: "Falha ao gerar link de pagamento",
      })
    }
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

              <div className="flex items-center space-x-3">
                {/* Botão para atualizar status */}
                <Button 
                  variant="outline" 
                  onClick={updateClientStatuses}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Status
                </Button>

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
                    {/* Campo de data de início - só aparece se tiver plano selecionado */}
                    {newClient.planId && (
                      <div className="space-y-2">
                        <Label htmlFor="planStartDate" className="text-black">
                          Data de Início do Plano
                        </Label>
                        <Input
                          id="planStartDate"
                          type="date"
                          value={newClient.planStartDate}
                          onChange={(e) => setNewClient({ ...newClient, planStartDate: e.target.value })}
                          className="border-gray-300 focus:border-black"
                        />
                        <p className="text-xs text-gray-500">
                          Deixe em branco para usar a data de hoje
                        </p>
                      </div>
                    )}
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
                  {/* Campo de data de início - só aparece se tiver plano selecionado */}
                  {editClient.planId && editClient.planId !== "none" && (
                    <div className="space-y-2">
                      <Label htmlFor="editPlanStartDate" className="text-black">
                        Data de Início do Plano
                      </Label>
                      <Input
                        id="editPlanStartDate"
                        type="date"
                        value={editClient.planStartDate}
                        onChange={(e) => setEditClient({ ...editClient, planStartDate: e.target.value })}
                        className="border-gray-300 focus:border-black"
                      />
                      <p className="text-xs text-gray-500">
                        Deixe em branco para usar a data de hoje
                      </p>
                    </div>
                  )}
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
                                  {client.planEndDate && client.planEndDate !== null && (
                                    <span>
                                      Plano válido até: {formatDate(client.planEndDate)}
                                    </span>
                                  )}
                                </div>
                                {/* Informações do período de assinatura para clientes VIP */}
                                {client.plan && (client.plan.name.includes("VIP") || client.plan.name.includes("Premium")) && client.plan_status !== "not_plan" && (
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center space-x-2 text-xs">
                                      <Calendar className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-600">
                                        Início: {formatDate(client.planStartDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                      <Calendar className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-600">
                                        Fim: {formatDate(client.planEndDate)}
                                      </span>
                                    </div>
                                    {/* Status de pagamento */}
                                    {(() => {
                                      const paymentStatus = getPaymentStatus(client)
                                      if (!paymentStatus) return null
                                      
                                      return (
                                        <div className="flex items-center space-x-2">
                                          {paymentStatus.status === "paid" && <CheckCircle className="h-3 w-3 text-green-500" />}
                                          {paymentStatus.status === "warning" && <Clock className="h-3 w-3 text-yellow-500" />}
                                          {paymentStatus.status === "pending" && <AlertTriangle className="h-3 w-3 text-red-500" />}
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                              paymentStatus.status === "paid" ? "border-green-500 text-green-600" :
                                              paymentStatus.status === "warning" ? "border-yellow-500 text-yellow-600" :
                                              "border-red-500 text-red-600"
                                            }`}
                                          >
                                            {paymentStatus.label}
                                          </Badge>
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )}
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
                                {/* Botão de pagamento para clientes pendentes */}
                                {(() => {
                                  const paymentStatus = getPaymentStatus(client)
                                  if (paymentStatus && paymentStatus.status === "pending") {
                                    return (
                                      <div className="flex space-x-2 mt-2">
                                        <Button
                                          size="sm"
                                          className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                          onClick={() => generatePaymentLink(client)}
                                        >
                                          <CreditCard className="h-3 w-3 mr-1" />
                                          Gerar Link
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                          onClick={() => markPlanAsPaid(client)}
                                        >
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Marcar como Pago
                                        </Button>
                                      </div>
                                    )
                                  }
                                  return null
                                })()}
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
                  {clientsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                      <p className="text-gray-500 mt-2">Carregando clientes...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredClients(clients || []).length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Nenhum cliente Premium encontrado</p>
                        </div>
                      ) : (
                        getFilteredClients(clients || []).map((client) => (
                          <div key={client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{client.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>📞 {client.phone}</span>
                                  {client.email && <span>✉️ {client.email}</span>}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span>Agendamentos: {client._count?.appointments || 0}</span>
                                  {client.planEndDate && client.planEndDate !== null && (
                                    <span>Plano válido até: {formatDate(client.planEndDate)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingClient(client)
                                  setEditClient({
                                    name: client.name,
                                    phone: client.phone,
                                    email: client.email || "",
                                    planId: client.planId || "",
                                    planStartDate: client.planStartDate || "",
                                  })
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
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
                  {clientsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                      <p className="text-gray-500 mt-2">Carregando clientes...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredClients(clients || []).length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Nenhum cliente VIP encontrado</p>
                        </div>
                      ) : (
                        getFilteredClients(clients || []).map((client) => (
                          <div key={client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{client.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>📞 {client.phone}</span>
                                  {client.email && <span>✉️ {client.email}</span>}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span>Agendamentos: {client._count?.appointments || 0}</span>
                                  {client.planEndDate && client.planEndDate !== null && (
                                    <span>Plano válido até: {formatDate(client.planEndDate)}</span>
                                  )}
                                </div>
                                {/* Informações do período de assinatura para clientes VIP */}
                                {client.plan && (client.plan.name.includes("VIP") || client.plan.name.includes("Premium")) && client.plan_status !== "not_plan" && (
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center space-x-2 text-xs">
                                      <Calendar className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-600">
                                        Início: {formatDate(client.planStartDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs">
                                      <Calendar className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-600">
                                        Fim: {formatDate(client.planEndDate)}
                                      </span>
                                    </div>
                                    {/* Status de pagamento */}
                                    {(() => {
                                      const paymentStatus = getPaymentStatus(client)
                                      if (!paymentStatus) return null

                                      return (
                                        <div className="flex items-center space-x-2 mt-2">
                                          <Badge
                                            variant={paymentStatus.color === "green" ? "default" : "destructive"}
                                            className={`text-xs ${
                                              paymentStatus.color === "green"
                                                ? "bg-green-100 text-green-800"
                                                : paymentStatus.color === "red"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}
                                          >
                                            {paymentStatus.color === "green" && <CheckCircle className="h-3 w-3 mr-1" />}
                                            {paymentStatus.color === "red" && <Clock className="h-3 w-3 mr-1" />}
                                            {paymentStatus.color === "yellow" && <RefreshCw className="h-3 w-3 mr-1" />}
                                            {paymentStatus.label}
                                          </Badge>
                                          {paymentStatus.status === "pending" && (
                                            <div className="flex space-x-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-6 px-2"
                                                onClick={() => generatePaymentLink(client)}
                                              >
                                                <CreditCard className="h-3 w-3 mr-1" />
                                                Gerar Link
                                              </Button>
                                              <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white text-xs h-6 px-2"
                                                onClick={() => markPlanAsPaid(client)}
                                              >
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Marcar como Pago
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingClient(client)
                                  setEditClient({
                                    name: client.name,
                                    phone: client.phone,
                                    email: client.email || "",
                                    planId: client.planId || "",
                                    planStartDate: client.planStartDate || "",
                                  })
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
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
                  {clientsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                      <p className="text-gray-500 mt-2">Carregando clientes...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredClients(clients || []).length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Nenhum cliente Avulso encontrado</p>
                        </div>
                      ) : (
                        getFilteredClients(clients || []).map((client) => (
                          <div key={client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{client.name}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>📞 {client.phone}</span>
                                  {client.email && <span>✉️ {client.email}</span>}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span>Agendamentos: {client._count?.appointments || 0}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-gray-100 text-gray-800">Avulso</Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingClient(client)
                                  setEditClient({
                                    name: client.name,
                                    phone: client.phone,
                                    email: client.email || "",
                                    planId: client.planId || "",
                                    planStartDate: client.planStartDate || "",
                                  })
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                Editar
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
