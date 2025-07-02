"use client"

import { useState, useEffect } from "react"
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
import { Plus, Search, Calendar, Clock, MapPin, Scissors, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useApi, useMutation } from "@/hooks/use-api"
import {
  clientsApi,
  servicesApi,
  appointmentsApi,
  barbersApi,
  locationsApi,
  type Client,
  type Service,
  type Appointment,
  type Barber,
  type Location,
  type CreateAppointmentData,
} from "@/lib/api"
import { toast } from "sonner"

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [location, setLocation] = useState<string | null>(null)
  const [barberId, setBarberId] = useState<string | null>(null)
  

  const [newAppointment, setNewAppointment] = useState({
    clientId: "",
    serviceId: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    paymentMethod: "",
    notes: "",
  })

  useEffect(() => {
    const storedLocation = localStorage.getItem("barberLocation")
    const storedBarberId = localStorage.getItem("barberId")
    setLocation(storedLocation)
    setBarberId(storedBarberId)
  }, [])

  // API calls
  const { data: clients, loading: clientsLoading } = useApi<Client[]>(
    () => clientsApi.getAll({ search: searchTerm }),
    [searchTerm],
  )

  const { data: services, loading: servicesLoading } = useApi<Service[]>(() => servicesApi.getAll(), [])

  const {
    data: appointments,
    loading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useApi<Appointment[]>(
    () =>
      appointmentsApi.getAll({
        date: selectedDate,
        barberId: barberId || undefined,
      }),
    [selectedDate, barberId],
  )

  const { data: barbers } = useApi<Barber[]>(() => barbersApi.getAll(), [])
  const { data: locations } = useApi<Location[]>(() => locationsApi.getAll(), [])

  // Mutation for creating appointments
  const { mutate: createAppointment, loading: creatingAppointment } = useMutation((data: CreateAppointmentData) =>
    appointmentsApi.create(data),
  )

  const filteredAppointments =
    appointments?.filter((appointment) => {
      const matchesSearch =
        appointment.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.client.phone.includes(searchTerm)
      return matchesSearch
    }) || []

  const handleCreateAppointment = async () => {
    if (!newAppointment.clientId || !newAppointment.serviceId || !newAppointment.time || !barberId) {
      toast.error("Erro", {
        description: "Preencha todos os campos obrigatórios",
      });
      return
    }

    const client = clients?.find((c) => c.id === newAppointment.clientId)
    const service = services?.find((s) => s.id === newAppointment.serviceId)

    if (!client || !service) return

    // Calculate end time
    const [hours, minutes] = newAppointment.time.split(":").map(Number)
    const startTime = new Date()
    startTime.setHours(hours, minutes, 0, 0)
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000)

    const endTimeString = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`

    // Determine payment method based on client plan
    let paymentMethod = newAppointment.paymentMethod
    if (client.plan && client.plan.name !== "Avulso") {
      const canUsePlan =
        (service.name.includes("Corte") &&
          (client.plan.name === "Barbearia Premium" || client.plan.name === "Cabelo VIP")) ||
        (service.name.includes("Barba") &&
          (client.plan.name === "Barbearia Premium" || client.plan.name === "Barba VIP"))

      if (canUsePlan) {
        paymentMethod = "Plano"
      }
    }

    const appointmentData: CreateAppointmentData = {
      clientId: newAppointment.clientId,
      barberId: barberId,
      locationId: location || "",
      serviceId: newAppointment.serviceId,
      appointmentDate: newAppointment.date,
      startTime: newAppointment.time,
      endTime: endTimeString,
      paymentMethod,
      paymentStatus: paymentMethod === "Plano" ? "paid" : "pending",
      notes: newAppointment.notes,
    }

    try {
      await createAppointment(appointmentData)
        toast.success("Sucesso", {
          description: "Agendamento criado com sucesso!",
        });
      setNewAppointment({
        clientId: "",
        serviceId: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        paymentMethod: "",
        notes: "",
      })
      setIsDialogOpen(false)
      refetchAppointments()
    } catch (error) {
      toast.error("Erro", {
        description: "Falha ao criar agendamento. Tente novamente.",
      });
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "scheduled":
        return "bg-black text-white"
      case "waiting":
        return "bg-gray-600 text-white"
      case "completed":
        return "bg-gray-800 text-white"
      case "cancelled":
        return "bg-gray-400 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
      case "scheduled":
        return "Confirmado"
      case "waiting":
        return "Aguardando"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold text-black">Gerenciar Agendamentos</h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          <Tabs defaultValue="today" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-gray-200">
                <TabsTrigger value="today" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Hoje
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Semana
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-black data-[state=active]:text-white">
                  Mês
                </TabsTrigger>
              </TabsList>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-white border border-gray-200">
                  <DialogHeader>
                    <DialogTitle className="text-black">Criar Novo Agendamento</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Preencha os dados para criar um novo agendamento
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="client" className="text-black">
                        Cliente
                      </Label>
                      <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, clientId: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-black">
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientsLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          ) : (
                            clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{client.name}</span>
                                  {client.plan && client.plan.name !== "Avulso" && (
                                    <Star className="h-3 w-3 text-black ml-2" />
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service" className="text-black">
                        Serviço
                      </Label>
                      <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, serviceId: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-black">
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicesLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          ) : (
                            services?.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex justify-between w-full">
                                  <span>{service.name}</span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    R$ {Number(service.price).toFixed(2)} ({service.durationMinutes}min)
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-black">
                          Data
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                          className="border-gray-300 focus:border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-black">
                          Horário
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={newAppointment.time}
                          onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                          className="border-gray-300 focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment" className="text-black">
                        Método de Pagamento
                      </Label>
                      <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, paymentMethod: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-black">
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pix">Pix</SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Cartão">Cartão</SelectItem>
                          <SelectItem value="Plano">Plano (se aplicável)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateAppointment}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={creatingAppointment}
                  >
                    {creatingAppointment ? "Criando..." : "Criar Agendamento"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="today" className="space-y-6">
              {/* Filtros */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 flex-1">
                      <Search className="h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Buscar por cliente ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm border-gray-300 focus:border-black"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-40 border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de agendamentos */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Calendar className="h-5 w-5" />
                    Agendamentos do Dia
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {appointmentsLoading
                      ? "Carregando..."
                      : `${filteredAppointments.length} agendamento(s) para ${new Date(selectedDate).toLocaleDateString("pt-BR")}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointmentsLoading ? (
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
                    ) : filteredAppointments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum agendamento encontrado para esta data</p>
                      </div>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Scissors className="h-5 w-5 text-black" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-black">{appointment.client.name}</p>
                                {appointment.client.plan && appointment.client.plan.name !== "Avulso" && (
                                  <Star className="h-4 w-4 text-black" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{appointment.service.name}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {appointment.startTime} ({appointment.service.durationMinutes}min)
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{appointment.location.name}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
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
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                            <Badge variant="outline" className="border-gray-300 text-gray-700">
                              {appointment.paymentMethod || "Não definido"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week">
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">Agendamentos da Semana</CardTitle>
                  <CardDescription className="text-gray-600">Visão semanal dos agendamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">Funcionalidade em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month">
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">Agendamentos do Mês</CardTitle>
                  <CardDescription className="text-gray-600">Visão mensal dos agendamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-500 py-8">Funcionalidade em desenvolvimento</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
