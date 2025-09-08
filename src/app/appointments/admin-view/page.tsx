"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Star,
  User,
  Settings,
  Filter,
  Users,
  Eye,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { AppointmentCalendar } from "@/components/appointment-calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApi, useMutation } from "@/hooks/use-api";
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
} from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Função para converter data para string no formato YYYY-MM-DD sem problemas de timezone
const formatDateForAPI = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get week dates from a given date
const getWeekDates = (date: Date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para segunda-feira como início da semana
  startOfWeek.setDate(diff);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    weekDates.push(currentDate);
  }
  return weekDates;
};

// Format date for display
const formatDisplayDate = (date: Date) => {
  const weekdays = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return `${weekdays[date.getDay()]}, ${date.getDate()} ${
    months[date.getMonth()]
  }. ${date.getFullYear()}`;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [newAppointment, setNewAppointment] = useState({
    clientId: "",
    serviceId: "",
    barberId: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    paymentMethod: "",
    notes: "",
  });

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Callback functions for Select components
  const handleBarberChange = useCallback((value: string) => {
    setNewAppointment((prev) => ({ ...prev, barberId: value }));
  }, []);

  const handleClientChange = useCallback((value: string) => {
    setNewAppointment((prev) => ({ ...prev, clientId: value }));
  }, []);

  const handleServiceChange = useCallback((value: string) => {
    setNewAppointment((prev) => ({ ...prev, serviceId: value }));
  }, []);

  const handlePaymentMethodChange = useCallback((value: string) => {
    setNewAppointment((prev) => ({ ...prev, paymentMethod: value }));
  }, []);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewAppointment((prev) => ({ ...prev, date: e.target.value }));
    },
    []
  );

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewAppointment((prev) => ({ ...prev, time: e.target.value }));
    },
    []
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewAppointment((prev) => ({ ...prev, notes: e.target.value }));
    },
    []
  );

  const handleStatusFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStatusFilter(e.target.value);
    },
    []
  );

  const handleStatusFilterChangeString = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  useEffect(() => {
    const storedBarberId = localStorage.getItem("barberId");
    if (!storedBarberId) {
      router.push("/");
      return;
    }
    setBarberId(storedBarberId);

    // Verificar se o usuário atual é admin
    checkUserRole(storedBarberId);
  }, [router]);

  // API calls
  const { data: clients, loading: clientsLoading } = useApi<Client[]>(
    () => clientsApi.getAll({}),
    []
  );

  const { data: services, loading: servicesLoading } = useApi<Service[]>(
    () => servicesApi.getAll(),
    []
  );

  const { data: barbers, loading: barbersLoading } = useApi<Barber[]>(
    () => barbersApi.getAll(),
    []
  );

  const { data: locations } = useApi<Location[]>(
    () => locationsApi.getAll(),
    []
  );

  // Get appointments for the entire week
  const {
    data: appointments,
    loading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useApi<Appointment[]>(() => {
    const startDate = formatDateForAPI(weekDates[0]);
    const endDate = formatDateForAPI(weekDates[6]);
    return appointmentsApi.getAll({
      startDate,
      endDate,
      status: statusFilter || undefined,
    });
  }, [weekDates, statusFilter]);

  // Mutation for creating appointments
  const { mutate: createAppointment, loading: creatingAppointment } =
    useMutation((data: CreateAppointmentData) => appointmentsApi.create(data));

  // Date navigation
  const navigateWeek = useCallback(
    (direction: "prev" | "next") => {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
      setCurrentDate(newDate);
    },
    [currentDate]
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const checkUserRole = async (barberId: string) => {
    try {
      const response = await fetch(`/api/users?adminBarberId=${barberId}`);
      if (response.ok) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Erro ao verificar role:", error);
      setIsAdmin(false);
    }
  };

  const handleCreateAppointment = useCallback(async () => {
    if (
      !newAppointment.clientId ||
      !newAppointment.serviceId ||
      !newAppointment.time ||
      !newAppointment.barberId
    ) {
      toast.error("Erro", {
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    // Validation for past appointments
    const now = new Date();
    const selectedDateTime = new Date(
      `${newAppointment.date}T${newAppointment.time}`
    );
    if (selectedDateTime < now) {
      toast.error("Erro", {
        description: "Não é possível agendar para uma data/hora no passado",
      });
      return;
    }

    const client = clients?.find((c) => c.id === newAppointment.clientId);
    const service = services?.find((s) => s.id === newAppointment.serviceId);
    if (!client || !service) return;

    // Calculate end time
    const [hours, minutes] = newAppointment.time.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(
      startTime.getTime() + service.durationMinutes * 60000
    );
    const endTimeString = `${endTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;

    // Determine payment method based on client plan
    let paymentMethod = newAppointment.paymentMethod;
    if (client.plan && client.plan.name !== "Avulso") {
      const canUsePlan =
        (service.name.includes("Corte") &&
          (client.plan.name === "Barbearia Premium" ||
            client.plan.name === "Cabelo VIP")) ||
        (service.name.includes("Barba") &&
          (client.plan.name === "Barbearia Premium" ||
            client.plan.name === "Barba VIP"));
      if (canUsePlan) {
        paymentMethod = "Plano";
      }
    }

    const currentLocation = localStorage.getItem("barberLocation");
    const locationObj = locations?.find(
      (l) => l.name.toLowerCase().replace(/\s/g, "-") === currentLocation
    );
    const locationId = locationObj?.id || locations?.[0]?.id;

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
    };

    try {
      await createAppointment(appointmentData);
      toast.success("Sucesso", {
        description: "Agendamento criado com sucesso!",
      });
      setNewAppointment({
        clientId: "",
        serviceId: "",
        barberId: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        paymentMethod: "",
        notes: "",
      });
      setIsDialogOpen(false);
      refetchAppointments();
    } catch (error) {
      toast.error("Erro", {
        description:
          "Falha ao criar agendamento. Verifique se o horário está disponível.",
      });
    }
  }, [
    newAppointment,
    clients,
    services,
    locations,
    createAppointment,
    refetchAppointments,
  ]);

  const handleDeleteAppointment = useCallback(
    async (appointmentId: string) => {
      console.log("🗑️ handleDeleteAppointment chamado para:", appointmentId);

      try {
        console.log("📡 Chamando API de cancelamento...");
        await appointmentsApi.cancel(appointmentId);
        console.log("✅ API de cancelamento retornou com sucesso!");

        toast.success("Sucesso", {
          description: "Agendamento cancelado com sucesso!",
        });

        console.log("🔄 Recarregando agendamentos...");
        await refetchAppointments();
        console.log("✅ Agendamentos recarregados!");
      } catch (error) {
        console.error("❌ Erro ao cancelar agendamento:", error);
        toast.error("Erro", {
          description: "Falha ao cancelar agendamento.",
        });
        throw error;
      }
    },
    [refetchAppointments]
  );

  const handlePermanentDeleteAppointment = useCallback(
    async (appointmentId: string) => {
      console.log(
        "🗑️ handlePermanentDeleteAppointment chamado para:",
        appointmentId
      );

      try {
        console.log("📡 Chamando API de exclusão permanente...");
        await appointmentsApi.permanentDelete(appointmentId);
        console.log("✅ API de exclusão permanente retornou com sucesso!");

        toast.success("Sucesso", {
          description: "Agendamento excluído permanentemente!",
        });

        console.log("🔄 Recarregando agendamentos...");
        await refetchAppointments();
        console.log("✅ Agendamentos recarregados!");
      } catch (error) {
        console.error("❌ Erro ao excluir agendamento permanentemente:", error);
        toast.error("Erro", {
          description: "Falha ao excluir agendamento permanentemente.",
        });
        throw error;
      }
    },
    [refetchAppointments]
  );

  const handleRescheduleAppointment = useCallback(
    (appointment: Appointment) => {
      console.log(
        "🔄 handleRescheduleAppointment chamado para:",
        appointment.client.name
      );

      // Preencher o formulário com os dados do agendamento existente
      setNewAppointment({
        clientId: appointment.clientId,
        serviceId: appointment.serviceId,
        barberId: appointment.barberId,
        date: typeof appointment.appointmentDate === 'string' 
          ? appointment.appointmentDate
          : (appointment.appointmentDate as Date).toISOString().split("T")[0],
        time: appointment.startTime,
        paymentMethod: appointment.paymentMethod || "",
        notes: appointment.notes || "",
      });

      // Definir o agendamento sendo editado
      setEditingAppointment(appointment);

      // Abrir o modal de edição
      setIsEditDialogOpen(true);

      toast.info("Editando Agendamento", {
        description: `Editando agendamento de ${appointment.client.name}`,
      });
    },
    []
  );

  const handleCompleteAppointment = useCallback(
    async (appointmentId: string, clientName: string) => {
      const confirmed = confirm(
        `✅ Tem certeza que deseja marcar o agendamento de ${clientName} como concluído?\n\nEsta ação não pode ser desfeita!`
      );

      if (confirmed) {
        try {
          await appointmentsApi.complete(appointmentId);
          toast.success("Sucesso", {
            description: "Agendamento marcado como concluído!",
          });
          refetchAppointments();
        } catch (error) {
          console.error("❌ Erro ao concluir agendamento:", error);
          toast.error("Erro", {
            description: "Falha ao marcar agendamento como concluído.",
          });
        }
      }
    },
    [refetchAppointments]
  );

  const handleUpdateAppointment = useCallback(async () => {
    if (!editingAppointment) return;

    if (
      !newAppointment.clientId ||
      !newAppointment.serviceId ||
      !newAppointment.time ||
      !newAppointment.barberId
    ) {
      toast.error("Erro", {
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    const client = clients?.find((c) => c.id === newAppointment.clientId);
    const service = services?.find((s) => s.id === newAppointment.serviceId);
    if (!client || !service) return;

    // Calculate end time
    const [hours, minutes] = newAppointment.time.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(
      startTime.getTime() + service.durationMinutes * 60000
    );
    const endTimeString = `${endTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;

    // Determine payment method based on client plan
    let paymentMethod = newAppointment.paymentMethod;
    if (client.plan && client.plan.name !== "Avulso") {
      const canUsePlan =
        (service.name.includes("Corte") &&
          (client.plan.name === "Barbearia Premium" ||
            client.plan.name === "Cabelo VIP")) ||
        (service.name.includes("Barba") &&
          (client.plan.name === "Barbearia Premium" ||
            client.plan.name === "Barba VIP"));
      if (canUsePlan) {
        paymentMethod = "Plano";
      }
    }

    const currentLocation = localStorage.getItem("barberLocation");
    const locationObj = locations?.find(
      (l) => l.name.toLowerCase().replace(/\s/g, "-") === currentLocation
    );
    const locationId = locationObj?.id || locations?.[0]?.id;

    try {
      await appointmentsApi.update(editingAppointment.id, {
        appointmentDate: newAppointment.date,
        startTime: newAppointment.time,
        endTime: endTimeString,
        paymentMethod,
        paymentStatus: paymentMethod === "Plano" ? "paid" : "pending",
        notes: newAppointment.notes,
      });

      toast.success("Sucesso", {
        description: "Agendamento atualizado com sucesso!",
      });

      // Limpar formulário e fechar modal
      setNewAppointment({
        clientId: "",
        serviceId: "",
        barberId: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        paymentMethod: "",
        notes: "",
      });
      setEditingAppointment(null);
      setIsEditDialogOpen(false);
      refetchAppointments();
    } catch (error: any) {
      console.error("Erro ao atualizar agendamento:", error);
      
      // Verificar se é erro de conflito de horário
      if (error?.status === 400 && error?.message === "Time slot is already booked") {
        toast.error("Horário Ocupado", {
          description: "Já existe um agendamento neste horário. Escolha outro horário disponível.",
        });
      } else {
        toast.error("Erro", {
          description: error?.message || "Falha ao atualizar agendamento. Tente novamente.",
        });
      }
    }
  }, [
    editingAppointment,
    newAppointment,
    clients,
    services,
    locations,
    refetchAppointments,
  ]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-20 shrink-0 items-center gap-4 border-b bg-card px-6 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />

          <div className="flex items-center justify-between w-full">
            {/* Left section - Back button, date and navigation */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/appointments")}
                className="h-9 px-3 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {formatDisplayDate(weekDates[2])}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-accent text-accent-foreground text-xs"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Visão Administrativa
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateWeek("prev")}
                  className="h-8 w-8 p-0 hover:bg-background"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={goToToday}
                  className="h-8 px-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                >
                  HOJE
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateWeek("next")}
                  className="h-8 w-8 p-0 hover:bg-background"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right section - Controls and actions */}
            <div className="flex items-center gap-3">
              {/* View selector */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Semana
                </Badge>
              </div>

              {/* Filter section */}
              <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filtrar status..."
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-40 h-8 bg-background border-0 focus-visible:ring-1"
                />
              </div>

              {/* Settings */}
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Settings className="h-4 w-4" />
              </Button>

              {/* New appointment button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 font-medium shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    NOVO AGENDAMENTO
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-card border shadow-lg">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-primary" />
                      Criar Novo Agendamento
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Preencha os dados para criar um novo agendamento
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-6 py-4">
                    {/* Barber selection */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="barber"
                        className="text-sm font-medium text-card-foreground flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-primary" />
                        Barbeiro *
                      </Label>
                      <Select
                        onValueChange={handleBarberChange}
                        value={newAppointment.barberId}
                      >
                        <SelectTrigger className="h-10 bg-background border-border focus:border-primary focus:ring-ring">
                          <SelectValue placeholder="Selecione o barbeiro" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]" position="popper">
                          {barbersLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando barbeiros...
                            </SelectItem>
                          ) : barbers && barbers.length > 0 ? (
                            barbers.map((barber) => (
                              <SelectItem key={barber.id} value={barber.id}>
                                {barber.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-barbers" disabled>
                              Nenhum barbeiro disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Client selection */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="client"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Cliente *
                      </Label>
                      <Select
                        onValueChange={handleClientChange}
                        value={newAppointment.clientId}
                      >
                        <SelectTrigger className="h-10 bg-background border-border focus:border-primary focus:ring-ring">
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]" position="popper">
                          {clientsLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          ) : clients && clients.length > 0 ? (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{client.name}</span>
                                  {client.plan &&
                                    client.plan.name !== "Avulso" && (
                                      <Star className="h-3 w-3 text-accent ml-2" />
                                    )}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-clients" disabled>
                              Nenhum cliente disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Service selection */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="service"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Serviço *
                      </Label>
                      <Select
                        onValueChange={handleServiceChange}
                        value={newAppointment.serviceId}
                      >
                        <SelectTrigger className="h-10 bg-background border-border focus:border-primary focus:ring-ring">
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]" position="popper">
                          {servicesLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          ) : services && services.length > 0 ? (
                            services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex justify-between w-full">
                                  <span>{service.name}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    R$ {Number(service.price).toFixed(2)} (
                                    {service.durationMinutes}min)
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-services" disabled>
                              Nenhum serviço disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date and time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label
                          htmlFor="date"
                          className="text-sm font-medium text-card-foreground flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4 text-primary" />
                          Data *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={newAppointment.date}
                          onChange={handleDateChange}
                          className="h-10 bg-background border-border focus:border-primary focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="time"
                          className="text-sm font-medium text-card-foreground flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-primary" />
                          Horário *
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={newAppointment.time}
                          onChange={handleTimeChange}
                          className="h-10 bg-background border-border focus:border-primary focus:ring-ring"
                        />
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="payment"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Método de Pagamento
                      </Label>
                      <Select
                        onValueChange={handlePaymentMethodChange}
                        value={newAppointment.paymentMethod}
                      >
                        <SelectTrigger className="h-10 bg-background border-border focus:border-primary focus:ring-ring">
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]" position="popper">
                          <SelectItem value="Pix">Pix</SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Cartão">Cartão</SelectItem>
                          <SelectItem value="Plano">
                            Plano (se aplicável)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="notes"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Observações
                      </Label>
                      <Input
                        id="notes"
                        placeholder="Observações adicionais (opcional)"
                        value={newAppointment.notes}
                        onChange={handleNotesChange}
                        className="h-10 bg-background border-border focus:border-primary focus:ring-ring"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateAppointment}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                    disabled={creatingAppointment}
                  >
                    {creatingAppointment ? "Criando..." : "Criar Agendamento"}
                  </Button>
                </DialogContent>
              </Dialog>

              {/* Modal de Edição */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-lg bg-card border shadow-lg">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                      <Scissors className="h-5 w-5 text-primary" />
                      Editar Agendamento
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Edite os dados do agendamento de {editingAppointment?.client.name}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-6 py-4">
                    {/* Barber selection */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="edit-barber"
                        className="text-sm font-medium text-card-foreground flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-primary" />
                        Barbeiro *
                      </Label>
                      <Select
                        onValueChange={handleBarberChange}
                        value={newAppointment.barberId}
                      >
                        <SelectTrigger className="h-10 bg-background border-border focus:border-primary focus:ring-ring">
                          <SelectValue placeholder="Selecione o barbeiro" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]" position="popper">
                          {barbersLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando barbeiros...
                            </SelectItem>
                          ) : barbers && barbers.length > 0 ? (
                            barbers.map((barber) => (
                              <SelectItem key={barber.id} value={barber.id}>
                                {barber.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-barbers" disabled>
                              Nenhum barbeiro disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Client selection */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="edit-client"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Cliente *
                      </Label>
                      <Select
                        onValueChange={handleClientChange}
                        value={newAppointment.clientId}
                      >
                        <SelectTrigger className="h-10 bg-background border-border focus:border-primary focus:ring-ring">
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]" position="popper">
                          {clientsLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          ) : clients && clients.length > 0 ? (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{client.name}</span>
                                  {client.plan &&
                                    client.plan.name !== "Avulso" && (
                                      <Star className="h-3 w-3 text-accent ml-2" />
                                    )}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-clients" disabled>
                              Nenhum cliente disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Service selection */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="edit-service"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Serviço *
                      </Label>
                      <Select
                        onValueChange={handleServiceChange}
                        value={newAppointment.serviceId}
                      >
                        <SelectTrigger className="h-10 bg-background border-border focus:border-primary focus:ring-ring">
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]" position="popper">
                          {servicesLoading ? (
                            <SelectItem value="loading" disabled>
                              Carregando...
                            </SelectItem>
                          ) : services && services.length > 0 ? (
                            services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex justify-between w-full">
                                  <span>{service.name}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    R$ {Number(service.price).toFixed(2)} (
                                    {service.durationMinutes}min)
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-services" disabled>
                              Nenhum serviço disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date and time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label
                          htmlFor="edit-date"
                          className="text-sm font-medium text-card-foreground flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4 text-primary" />
                          Data *
                        </Label>
                        <Input
                          id="edit-date"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={newAppointment.date}
                          onChange={handleDateChange}
                          className="h-10 bg-background border-border focus:border-primary focus:ring-ring"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="edit-time"
                          className="text-sm font-medium text-card-foreground flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-primary" />
                          Horário *
                        </Label>
                        <Input
                          id="edit-time"
                          type="time"
                          value={newAppointment.time}
                          onChange={handleTimeChange}
                          className="h-10 bg-background border-border focus:border-primary focus:ring-ring"
                        />
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="edit-payment"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Método de Pagamento
                      </Label>
                      <Select
                        onValueChange={handlePaymentMethodChange}
                        value={newAppointment.paymentMethod}
                      >
                        <SelectTrigger className="h-10 bg-background border-border focus:border-primary focus:ring-ring">
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]" position="popper">
                          <SelectItem value="Pix">Pix</SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Cartão">Cartão</SelectItem>
                          <SelectItem value="Plano">
                            Plano (se aplicável)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="edit-notes"
                        className="text-sm font-medium text-card-foreground"
                      >
                        Observações
                      </Label>
                      <Input
                        id="edit-notes"
                        placeholder="Observações adicionais (opcional)"
                        value={newAppointment.notes}
                        onChange={handleNotesChange}
                        className="h-10 bg-background border-border focus:border-primary focus:ring-ring"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleUpdateAppointment}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                    disabled={creatingAppointment}
                  >
                    {creatingAppointment ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <AppointmentCalendar
          currentDate={currentDate}
          weekDates={weekDates}
          appointments={appointments}
          barbers={barbers}
          appointmentsLoading={appointmentsLoading}
          onNavigateWeek={navigateWeek}
          onGoToToday={goToToday}
          onCreateAppointment={handleOpenDialog}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChangeString}
          onDeleteAppointment={handleDeleteAppointment}
          onPermanentDeleteAppointment={handlePermanentDeleteAppointment}
          onRescheduleAppointment={handleRescheduleAppointment}
          onCompleteAppointment={handleCompleteAppointment}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
