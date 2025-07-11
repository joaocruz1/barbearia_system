"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronLeft, ChevronRight, Scissors, Star, User } from "lucide-react"
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

// Generate time slots from 8:00 to 20:00 in 10-minute intervals
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      slots.push(timeString)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [barberId, setBarberId] = useState<string | null>(null)
  const [newAppointment, setNewAppointment] = useState({
    clientId: "",
    serviceId: "",
    barberId: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    paymentMethod: "",
    notes: "",
  })

  useEffect(() => {
    const storedBarberId = localStorage.getItem("barberId")
    setBarberId(storedBarberId)
  }, [])

  // API calls
  const { data: clients, loading: clientsLoading } = useApi<Client[]>(() => clientsApi.getAll({}), [])

  const { data: services, loading: servicesLoading } = useApi<Service[]>(() => servicesApi.getAll(), [])

  const { data: barbers } = useApi<Barber[]>(() => barbersApi.getAll(), [])

  const { data: locations } = useApi<Location[]>(() => locationsApi.getAll(), [])

  const {
    data: appointments,
    loading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useApi<Appointment[]>(() => appointmentsApi.getAll({ date: selectedDate }), [selectedDate])

  // Mutation for creating appointments
  const { mutate: createAppointment, loading: creatingAppointment } = useMutation((data: CreateAppointmentData) =>
    appointmentsApi.create(data),
  )

  // Date navigation
  const navigateDate = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedDate)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate.toISOString().split("T")[0])
  }

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0])
  }

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString)
    const weekdays = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ]
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}. ${date.getFullYear()}`
  }

  // Get appointment for specific barber and time slot
  const getAppointmentForSlot = (barberId: string, timeSlot: string) => {
    return appointments?.find(
      (appointment) =>
        appointment.barberId === barberId && appointment.startTime <= timeSlot && appointment.endTime > timeSlot,
    )
  }

  // Calculate appointment duration in slots
  const getAppointmentDuration = (startTime: string, endTime: string) => {
    const start = TIME_SLOTS.indexOf(startTime)
    const end = TIME_SLOTS.indexOf(endTime)
    return end - start
  }

  // Get appointment color based on service type
  const getAppointmentColor = (service: string, status: string) => {
    if (status === "cancelled") return "bg-red-200 border-red-300"
    if (status === "completed") return "bg-blue-200 border-blue-300"

    if (service.toLowerCase().includes("corte")) return "bg-green-200 border-green-300"
    if (service.toLowerCase().includes("barba")) return "bg-yellow-200 border-yellow-300"
    if (service.toLowerCase().includes("combo")) return "bg-purple-200 border-purple-300"
    return "bg-orange-200 border-orange-300"
  }

  const handleCreateAppointment = async () => {
    if (!newAppointment.clientId || !newAppointment.serviceId || !newAppointment.time || !newAppointment.barberId) {
      toast.error("Erro", {
        description: "Preencha todos os campos obrigatórios",
      })
      return
    }

    // Validation for past appointments
    const now = new Date()
    const selectedDateTime = new Date(`${newAppointment.date}T${newAppointment.time}`)
    if (selectedDateTime < now) {
      toast.error("Erro", {
        description: "Não é possível agendar para uma data/hora no passado",
      })
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

    const currentLocation = localStorage.getItem("barberLocation")
    const locationObj = locations?.find((l) => l.name.toLowerCase().replace(/\s/g, "-") === currentLocation)
    const locationId = locationObj?.id || locations?.[0]?.id

    const appointmentData: CreateAppointmentData = {
      clientId: newAppointment.clientId,
      barberId: newAppointment.barberId,
      locationId: locationId || "",
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
      })
      setNewAppointment({
        clientId: "",
        serviceId: "",
        barberId: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        paymentMethod: "",
        notes: "",
      })
      setIsDialogOpen(false)
      refetchAppointments()
    } catch (error) {
      toast.error("Erro", {
        description: "Falha ao criar agendamento. Verifique se o horário está disponível.",
      })
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-black">{formatDisplayDate(selectedDate)}</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate("prev")} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="h-8 px-3 bg-transparent">
                  Hoje
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate("next")} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-2" />
                Nova comanda de consumo
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo agendamento
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
                      <Label htmlFor="barber" className="text-black">
                        Barbeiro *
                      </Label>
                      <Select onValueChange={(value) => setNewAppointment({ ...newAppointment, barberId: value })}>
                        <SelectTrigger className="border-gray-300 focus:border-black">
                          <SelectValue placeholder="Selecione o barbeiro" />
                        </SelectTrigger>
                        <SelectContent>
                          {barbers?.map((barber) => (
                            <SelectItem key={barber.id} value={barber.id}>
                              {barber.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client" className="text-black">
                        Cliente *
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
                                    <Star className="h-3 w-3 text-yellow-500 ml-2" />
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
                        Serviço *
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
                          Data *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                          className="border-gray-300 focus:border-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-black">
                          Horário *
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
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-black">
                        Observações
                      </Label>
                      <Input
                        id="notes"
                        placeholder="Observações adicionais (opcional)"
                        value={newAppointment.notes}
                        onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                        className="border-gray-300 focus:border-black"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateAppointment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={creatingAppointment}
                  >
                    {creatingAppointment ? "Criando..." : "Criar Agendamento"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-gray-50 overflow-auto">
          {appointmentsLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Carregando agendamentos...</p>
              </div>
            </div>
          ) : (
            <div className="min-w-max">
              {/* Header with barber names */}
              <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="flex">
                  <div className="w-16 flex-shrink-0 border-r border-gray-200"></div>
                  {barbers?.map((barber) => (
                    <div key={barber.id} className="flex-1 min-w-64 p-4 border-r border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{barber.name}</h3>
                          
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time slots and appointments grid */}
              <div className="flex">
                {/* Time column */}
                <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50">
                  {TIME_SLOTS.map((timeSlot) => (
                    <div
                      key={timeSlot}
                      className="h-12 flex items-center justify-center text-xs text-gray-500 border-b border-gray-100"
                    >
                      {timeSlot}
                    </div>
                  ))}
                </div>

                {/* Barber columns */}
                {barbers?.map((barber) => (
                  <div key={barber.id} className="flex-1 min-w-64 border-r border-gray-200">
                    {TIME_SLOTS.map((timeSlot, index) => {
                      const appointment = getAppointmentForSlot(barber.id, timeSlot)
                      const isFirstSlotOfAppointment = appointment && appointment.startTime === timeSlot

                      if (appointment && !isFirstSlotOfAppointment) {
                        return <div key={timeSlot} className="h-12"></div>
                      }

                      return (
                        <div key={timeSlot} className="h-12 border-b border-gray-100 relative">
                          {appointment && isFirstSlotOfAppointment && (
                            <div
                              className={`absolute inset-x-1 rounded-lg p-2 border-l-4 ${getAppointmentColor(appointment.service.name, appointment.status)} shadow-sm`}
                              style={{
                                height: `${getAppointmentDuration(appointment.startTime, appointment.endTime) * 48 - 4}px`,
                                zIndex: 1,
                              }}
                            >
                              <div className="flex items-start gap-2 h-full">
                                <div className="flex-shrink-0 flex gap-1">
                                  {appointment.service.name.toLowerCase().includes("corte") && (
                                    <Scissors className="h-3 w-3 text-gray-600" />
                                  )}
                                  {appointment.client.plan && appointment.client.plan.name !== "Avulso" && (
                                    <Star className="h-3 w-3 text-yellow-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {appointment.client.name}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate">{appointment.service.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {appointment.startTime} - {appointment.endTime}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
