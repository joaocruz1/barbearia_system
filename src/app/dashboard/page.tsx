"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, DollarSign, TrendingUp, MapPin, Scissors, Star, Plus, Filter } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { dashboardApi, plansApi, locationsApi, type DashboardStats, type Plan, type Location } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner" // Importando toast do sonner

export default function DashboardPage() {
  const [barberId, setBarberId] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const storedBarberId = localStorage.getItem("barberId")
    const storedLocation = localStorage.getItem("barberLocation")
    if (!storedBarberId || !storedLocation) {
      router.push("/")
      // Adicionando um toast informativo se o usuário for redirecionado
      toast.info("Acesso Restrito", {
        description: "Você precisa estar logado para acessar o painel.",
        duration: 3000,
      });
    } else {
      setBarberId(storedBarberId)
      setLocation(storedLocation)
    }
  }, [router])

  // Fetch dashboard stats APENAS do barbeiro logado
  const {
    data: dashboardStats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useApi<DashboardStats>(
    () =>
      dashboardApi.getStats({
        barberId: barberId || undefined, // Sempre filtrar pelo barbeiro logado
        date: new Date().toISOString().split("T")[0],
      }),
    [barberId],
  )

  // Fetch plans
  const { data: plans, loading: plansLoading } = useApi<Plan[]>(() => plansApi.getAll(), [])

  // Fetch locations for filter
  const { data: locations } = useApi<Location[]>(() => locationsApi.getAll(), [])

  if (!barberId || !location) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (statsError) {
    // Usando toast.error para exibir o erro ao carregar os dados
    toast.error("Erro ao carregar dados", {
      description: `Não foi possível carregar as estatísticas. Tente novamente. Detalhes: ${statsError || "Erro desconhecido."}`,
      duration: 5000,
    });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Ocorreu um erro ao carregar o painel.</p>
          <Button onClick={refetchStats} className="bg-black hover:bg-gray-800 text-white">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  const getBarberName = (id: string) => {
    const names: { [key: string]: string } = {
      bruno: "Bruno Souza",
      erick: "Erick",
      ryan: "Ryan",
      carlos: "Carlos",
      julio: "Julio",
      faguinho: "Faguinho",
      joilton: "Joilton",
    }
    return names[id] || id
  }

  const getLocationName = (id: string) => {
    const names: { [key: string]: string } = {
      "rua13-ouro-fino": "Rua 13 - Ouro Fino",
      "avenida-ouro-fino": "Avenida - Ouro Fino",
      inconfidentes: "Inconfidentes",
    }
    return names[id] || id
  }

  // Filtrar agendamentos por localidade se selecionado
  const filteredAppointments =
    dashboardStats?.appointments.filter((appointment) => {
      if (selectedLocationFilter === "all") return true
      return appointment.location.id === selectedLocationFilter
    }) || []

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-black">Olá, {getBarberName(barberId)}!</span>
            <Badge variant="outline" className="border-gray-300 text-gray-700">
              {getLocationName(location)}
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {/* Cards de estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Meus Agendamentos Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  {statsLoading ? "..." : dashboardStats?.today.appointments || 0}
                </div>
                <p className="text-xs text-gray-500">Apenas seus agendamentos</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Minha Receita Hoje</CardTitle>
                <DollarSign className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  R$ {statsLoading ? "..." : dashboardStats?.today.revenue.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-gray-500">Apenas serviços avulsos</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Meus Clientes VIP</CardTitle>
                <Star className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  {statsLoading ? "..." : dashboardStats?.today.vipClients || 0}
                </div>
                <p className="text-xs text-gray-500">Com planos ativos</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Minhas Localidades</CardTitle>
                <TrendingUp className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  {statsLoading ? "..." : new Set(dashboardStats?.appointments.map((a) => a.location.name)).size || 0}
                </div>
                <p className="text-xs text-gray-500">Com agendamentos hoje</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Agendamentos de hoje */}
            <div className="lg:col-span-2">
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-black">Seus Agendamentos de Hoje</CardTitle>
                      <CardDescription className="text-gray-600">
                        Todos os seus atendimentos programados
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={selectedLocationFilter} onValueChange={setSelectedLocationFilter}>
                        <SelectTrigger className="w-40 border-gray-300 focus:border-black">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          {locations?.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        className="bg-black hover:bg-gray-800 text-white"
                        onClick={() => router.push("/appointments")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum agendamento para hoje</p>
                      {selectedLocationFilter !== "all" && (
                        <p className="text-sm mt-2">Tente remover o filtro de localidade</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <Scissors className="h-6 w-6 text-black" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-black text-lg">{appointment.client.name}</p>
                                {appointment.client.plan && appointment.client.plan.name !== "Avulso" && (
                                  <Star className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{appointment.service.name}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-medium">
                                    {appointment.startTime} ({appointment.service.durationMinutes}min)
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="font-medium">{appointment.location.name}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge
                              variant={appointment.client.plan?.name === "Avulso" ? "outline" : "default"}
                              className={
                                appointment.client.plan?.name !== "Avulso"
                                  ? "bg-black text-white"
                                  : "border-gray-300 text-gray-700"
                              }
                            >
                              {appointment.client.plan?.name || "Avulso"}
                            </Badge>
                            <Badge
                              variant={
                                appointment.status === "confirmed" || appointment.status === "scheduled"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                appointment.status === "confirmed" || appointment.status === "scheduled"
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-200 text-gray-700"
                              }
                            >
                              {appointment.status === "confirmed" || appointment.status === "scheduled"
                                ? "Confirmado"
                                : "Aguardando"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Planos disponíveis */}
            <div>
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl text-black">Planos Clube Couto</CardTitle>
                  <CardDescription className="text-gray-600">Planos disponíveis para clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  {plansLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-gray-200 rounded-xl"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {plans
                        ?.filter((plan) => plan.name !== "Avulso")
                        .map((plan) => {
                          const getColorClass = (name: string) => {
                            if (name.includes("Premium")) return "bg-black"
                            if (name.includes("Cabelo")) return "bg-gray-800"
                            if (name.includes("Barba")) return "bg-gray-600"
                            return "bg-gray-500"
                          }

                          return (
                            <div key={plan.id} className={`p-4 rounded-xl text-white ${getColorClass(plan.name)}`}>
                              <h3 className="font-semibold">{plan.name}</h3>
                              <p className="text-2xl font-bold">R$ {Number(plan.price).toFixed(2)}</p>
                              <p className="text-xs opacity-90">por mês</p>
                              <p className="text-xs opacity-75 mt-1">{plan._count?.clients || 0} assinantes</p>
                            </div>
                          )
                        })}
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
                        <p className="text-sm text-gray-600">Promoção Ativa</p>
                        <p className="font-semibold text-black">50% OFF primeiro mês</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}