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
import { Plus, Search, User, Phone, Edit, Trash2, Star, Crown, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Define a consistent type for a Client
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  plan: string;
  planActive: boolean;
  planStartDate: string | null;
  planEndDate: string | null;
  totalCuts: number;
  totalBeards: number;
  lastVisit: string | null;
}

const plans = [
  { id: "premium", name: "Barbearia Premium", price: 125.9, color: "bg-black" },
  { id: "cabelo", name: "Cabelo VIP", price: 69.9, color: "bg-gray-800" },
  { id: "barba", name: "Barba VIP", price: 69.9, color: "bg-gray-600" },
  { id: "avulso", name: "Avulso", price: 0, color: "bg-gray-400" },
]

// Apply the Client type to the mock data array
const mockClients: Client[] = [
  {
    id: "1",
    name: "João Silva",
    phone: "35999887766",
    email: "joao@email.com",
    plan: "premium",
    planActive: true,
    planStartDate: "2024-12-01",
    planEndDate: "2025-12-01",
    totalCuts: 8,
    totalBeards: 5,
    lastVisit: "2025-01-01",
  },
  {
    id: "2",
    name: "Pedro Santos",
    phone: "35999776655",
    email: "pedro@email.com",
    plan: "cabelo",
    planActive: true,
    planStartDate: "2024-11-15",
    planEndDate: "2025-11-15",
    totalCuts: 12,
    totalBeards: 0,
    lastVisit: "2024-12-30",
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    phone: "35999665544",
    email: "carlos@email.com",
    plan: "avulso",
    planActive: false,
    planStartDate: null,
    planEndDate: null,
    totalCuts: 3,
    totalBeards: 2,
    lastVisit: "2024-12-28",
  },
  {
    id: "4",
    name: "Ana Costa",
    phone: "35999554433",
    email: "ana@email.com",
    plan: "barba",
    planActive: true,
    planStartDate: "2024-12-10",
    planEndDate: "2025-12-10",
    totalCuts: 0,
    totalBeards: 6,
    lastVisit: "2025-01-01",
  },
]

export default function ClientsPage() {
  // Apply the Client type to the useState hook
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("all")
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    plan: "avulso",
  })

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = selectedPlan === "all" || client.plan === selectedPlan
    return matchesSearch && matchesPlan
  })

  const handleCreateClient = () => {
    // This new client object now correctly matches the Client type
    const client: Client = {
      id: Date.now().toString(),
      ...newClient,
      planActive: newClient.plan !== "avulso",
      planStartDate: newClient.plan !== "avulso" ? new Date().toISOString().split("T")[0] : null,
      planEndDate:
        newClient.plan !== "avulso"
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : null,
      totalCuts: 0,
      totalBeards: 0,
      lastVisit: null,
    }
    setClients([...clients, client])
    setNewClient({
      name: "",
      phone: "",
      email: "",
      plan: "avulso",
    })
    setIsDialogOpen(false)
  }

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter((client) => client.id !== clientId))
  }

  const getPlanInfo = (planId: string) => {
    return plans.find((p) => p.id === planId) || plans[3]
  }

  const getClientStats = () => {
    const total = clients.length
    const withPlans = clients.filter((c) => c.planActive).length
    const premium = clients.filter((c) => c.plan === "premium").length
    const revenue = clients.reduce((sum, client) => {
      const plan = getPlanInfo(client.plan)
      return sum + (client.planActive ? plan.price : 0)
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
                <div className="text-3xl font-bold text-black">{stats.total}</div>
                <p className="text-xs text-gray-500">Clientes cadastrados</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Com Planos</CardTitle>
                <Star className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{stats.withPlans}</div>
                <p className="text-xs text-gray-500">Assinantes ativos</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Premium</CardTitle>
                <Crown className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{stats.premium}</div>
                <p className="text-xs text-gray-500">Clientes premium</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Receita Mensal</CardTitle>
                <Calendar className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">R$ {stats.revenue.toFixed(2)}</div>
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

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      <Select onValueChange={(value) => setNewClient({ ...newClient, plan: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-black">
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{plan.name}</span>
                                {plan.price > 0 && (
                                  <span className="text-sm text-gray-500 ml-2">R$ {plan.price.toFixed(2)}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCreateClient} className="w-full bg-black hover:bg-gray-800 text-white">
                    Cadastrar Cliente
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

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
                        {plans.map((plan) => (
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
                    {filteredClients.length} cliente(s) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredClients.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum cliente encontrado</p>
                      </div>
                    ) : (
                      filteredClients.map((client) => {
                        const planInfo = getPlanInfo(client.plan)
                        return (
                          <div
                            key={client.id}
                            className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 ${planInfo.color} rounded-full flex items-center justify-center`}
                              >
                                {client.planActive && client.plan !== "avulso" ? (
                                  <Star className="h-5 w-5 text-white" />
                                ) : (
                                  <User className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-black">{client.name}</p>
                                  {client.plan === "premium" && <Crown className="h-4 w-4 text-black" />}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{client.phone}</span>
                                  </div>
                                  {client.email && <span>{client.email}</span>}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span>Cortes: {client.totalCuts}</span>
                                  <span>Barbas: {client.totalBeards}</span>
                                  {client.lastVisit && (
                                    <span>Última visita: {new Date(client.lastVisit).toLocaleDateString("pt-BR")}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <Badge className={`${planInfo.color} text-white mb-2 border-0`}>{planInfo.name}</Badge>
                                {client.planActive && client.plan !== "avulso" && (
                                  <div className="text-xs text-gray-500">
                                    <p>
                                      Válido até:{" "}
                                      {client.planEndDate
                                        ? new Date(client.planEndDate).toLocaleDateString("pt-BR")
                                        : "N/A"}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-black">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClient(client.id)}
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