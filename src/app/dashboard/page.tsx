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
import { Calendar, Clock, DollarSign, TrendingUp, MapPin, Scissors, Star, Plus } from "lucide-react"

// Dados simulados para demonstração
const mockTodayAppointments = [
  {
    id: "1",
    clientName: "João Silva",
    service: "Corte + Barba",
    time: "09:00",
    duration: 45,
    status: "confirmed",
    plan: "Barbearia Premium",
    paymentMethod: "Plano",
  },
  {
    id: "2",
    clientName: "Pedro Santos",
    service: "Corte de Cabelo",
    time: "10:00",
    duration: 30,
    status: "confirmed",
    plan: "Cabelo VIP",
    paymentMethod: "Plano",
  },
  {
    id: "3",
    clientName: "Carlos Oliveira",
    service: "Barba",
    time: "11:30",
    duration: 20,
    status: "waiting",
    plan: "Avulso",
    paymentMethod: "Pix",
  },
]

const plans = [
  { name: "Barbearia Premium", price: 125.9, color: "bg-black" },
  { name: "Cabelo VIP", price: 69.9, color: "bg-gray-800" },
  { name: "Barba VIP", price: 69.9, color: "bg-gray-600" },
]

export default function DashboardPage() {
  const [barberId, setBarberId] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedBarberId = localStorage.getItem("barberId")
    const storedLocation = localStorage.getItem("barberLocation")
    if (!storedBarberId || !storedLocation) {
      router.push("/")
    } else {
      setBarberId(storedBarberId)
      setLocation(storedLocation)
    }
  }, [router])

  if (!barberId || !location) {
    return <div>Carregando...</div>
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
      rua13: "Rua 13",
      avenida: "Avenida",
      inconfidentes: "Inconfidentes",
      "ouro-fino": "Ouro Fino",
    }
    return names[id] || id
  }

  const todayRevenue = mockTodayAppointments.reduce((total, apt) => {
    if (apt.paymentMethod === "Plano") return total
    return total + (apt.service === "Corte + Barba" ? 40 : apt.service === "Corte de Cabelo" ? 25 : 20)
  }, 0)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-black" />
            <span className="font-medium text-black">{getLocationName(location)}</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-lg font-semibold text-black">Olá, {getBarberName(barberId)}!</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {/* Cards de estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Agendamentos Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{mockTodayAppointments.length}</div>
                <p className="text-xs text-gray-500">+2 desde ontem</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Receita Hoje</CardTitle>
                <DollarSign className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">R$ {todayRevenue}</div>
                <p className="text-xs text-gray-500">Apenas serviços avulsos</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Clientes VIP</CardTitle>
                <Star className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">2</div>
                <p className="text-xs text-gray-500">Com planos ativos</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa Ocupação</CardTitle>
                <TrendingUp className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">75%</div>
                <p className="text-xs text-gray-500">Horários ocupados</p>
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
                      <CardTitle className="text-xl text-black">Agendamentos de Hoje</CardTitle>
                      <CardDescription className="text-gray-600">Seus próximos atendimentos</CardDescription>
                    </div>
                    <Button className="bg-black hover:bg-gray-800 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Agendamento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTodayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Scissors className="h-5 w-5 text-black" />
                          </div>
                          <div>
                            <p className="font-semibold text-black">{appointment.clientName}</p>
                            <p className="text-sm text-gray-600">{appointment.service}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {appointment.time} ({appointment.duration}min)
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={appointment.plan === "Avulso" ? "outline" : "default"}
                            className={
                              appointment.plan !== "Avulso" ? "bg-black text-white" : "border-gray-300 text-gray-700"
                            }
                          >
                            {appointment.plan}
                          </Badge>
                          <Badge
                            variant={appointment.status === "confirmed" ? "default" : "secondary"}
                            className={
                              appointment.status === "confirmed"
                                ? "bg-gray-800 text-white"
                                : "bg-gray-200 text-gray-700"
                            }
                          >
                            {appointment.status === "confirmed" ? "Confirmado" : "Aguardando"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div key={plan.name} className={`p-4 rounded-xl text-white ${plan.color}`}>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-2xl font-bold">R$ {plan.price.toFixed(2)}</p>
                        <p className="text-xs opacity-90">por mês</p>
                      </div>
                    ))}
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
                      <p className="text-sm text-gray-600">Promoção Ativa</p>
                      <p className="font-semibold text-black">50% OFF primeiro mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
