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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Scissors,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import {
  locationsApi,
  barbersApi,
  type Location,
  type Barber,
} from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Tipos para os dados de caixa
interface CashFlowStats {
  totalRevenue: number;
  pendingRevenue: number;
  paidRevenue: number;
  cancelledRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  paymentMethods: {
    pix: number;
    dinheiro: number;
    cartao: number;
    plano: number;
  };
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    appointments: number;
  }>;
  barberStats: Array<{
    barberId: string;
    barberName: string;
    revenue: number;
    appointments: number;
  }>;
  serviceStats: Array<{
    serviceId: string;
    serviceName: string;
    revenue: number;
    appointments: number;
  }>;
}

interface CashFlowAppointment {
  id: string;
  clientName: string;
  barberName: string;
  serviceName: string;
  servicePrice: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  locationName: string;
  notes: string;
  createdAt: string;
}

interface CashFlowData {
  stats: CashFlowStats;
  appointments: CashFlowAppointment[];
}

// Função para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Função para formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

// Função para formatar data e hora
const formatDateTime = (dateString: string, timeString: string) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString("pt-BR")} às ${timeString}`;
};

export default function CashFlowPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 dias atrás
    endDate: new Date().toISOString().split("T")[0], // hoje
  });
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [barberFilter, setBarberFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Verificar se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const barberId = localStorage.getItem("barberId");
      if (!barberId) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch(`/api/users?adminBarberId=${barberId}`);
        if (response.ok) {
          setIsAdmin(true);
        } else {
          router.push("/unauthorized");
        }
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        router.push("/unauthorized");
      }
    };

    checkAdminStatus();
  }, [router]);

  // Buscar dados de localizações e barbeiros
  const { data: locations } = useApi<Location[]>(
    () => locationsApi.getAll(),
    []
  );

  const { data: barbers } = useApi<Barber[]>(() => barbersApi.getAll(), []);

  // Buscar dados de caixa
  const {
    data: cashFlowData,
    loading: cashFlowLoading,
    refetch: refetchCashFlow,
  } = useApi<CashFlowData>(() => {
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });

    if (locationFilter && locationFilter !== "all")
      params.append("locationId", locationFilter);
    if (barberFilter && barberFilter !== "all")
      params.append("barberId", barberFilter);

    return fetch(`/api/cash-flow?${params.toString()}`).then((res) =>
      res.json()
    );
  }, [dateRange, locationFilter, barberFilter]);

  // Filtrar agendamentos por status
  const filteredAppointments = useMemo(() => {
    if (!cashFlowData?.appointments) return [];

    if (!statusFilter || statusFilter === "all")
      return cashFlowData.appointments;

    return cashFlowData.appointments.filter(
      (appointment) => appointment.status === statusFilter
    );
  }, [cashFlowData?.appointments, statusFilter]);

  // Handlers para filtros
  const handleDateRangeChange = useCallback(
    (field: "startDate" | "endDate", value: string) => {
      setDateRange((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleLocationFilterChange = useCallback((value: string) => {
    setLocationFilter(value);
  }, []);

  const handleBarberFilterChange = useCallback((value: string) => {
    setBarberFilter(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchCashFlow();
    toast.success("Dados atualizados com sucesso!");
  }, [refetchCashFlow]);

  // Função para exportar dados (placeholder)
  const handleExport = useCallback(() => {
    toast.info("Funcionalidade de exportação em desenvolvimento");
  }, []);

  if (!isAdmin) {
    return null; // Não renderizar nada se não for admin
  }

  const stats = cashFlowData?.stats;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-20 shrink-0 items-center gap-4 border-b bg-card px-6 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />

          <div className="flex items-center justify-between w-full">
            {/* Título */}
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                Acompanhamento de Caixa
              </h1>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={cashFlowLoading}
                className="h-9 px-4"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    cashFlowLoading ? "animate-spin" : ""
                  }`}
                />
                Atualizar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-9 px-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-6 p-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Período */}
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      handleDateRangeChange("startDate", e.target.value)
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      handleDateRangeChange("endDate", e.target.value)
                    }
                    className="h-9"
                  />
                </div>

                {/* Localização */}
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Select
                    value={locationFilter}
                    onValueChange={handleLocationFilterChange}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todas as localizações" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as localizações</SelectItem>
                      {locations?.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Barbeiro */}
                <div className="space-y-2">
                  <Label>Barbeiro</Label>
                  <Select
                    value={barberFilter}
                    onValueChange={handleBarberFilterChange}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os barbeiros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os barbeiros</SelectItem>
                      {barbers?.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id}>
                          {barber.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="no_show">Não compareceu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Receita Total */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalAppointments || 0} agendamentos
                </p>
              </CardContent>
            </Card>

            {/* Receita Paga */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Paga
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.paidRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.completedAppointments || 0} concluídos
                </p>
              </CardContent>
            </Card>

            {/* Receita Pendente */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Pendente
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats?.pendingRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingAppointments || 0} pendentes
                </p>
              </CardContent>
            </Card>

            {/* Receita Cancelada */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receita Cancelada
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats?.cancelledRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.cancelledAppointments || 0} cancelados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Métodos de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>
                Distribuição da receita por método de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats?.paymentMethods.pix || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">PIX</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats?.paymentMethods.dinheiro || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Dinheiro</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats?.paymentMethods.cartao || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Cartão</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats?.paymentMethods.plano || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Plano</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Barbeiros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Top Barbeiros
              </CardTitle>
              <CardDescription>Ranking por receita gerada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.barberStats.slice(0, 5).map((barber, index) => (
                  <div
                    key={barber.barberId}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          {barber.barberName || "Nome não disponível"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {barber.appointments} agendamentos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(barber.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Serviços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Top Serviços
              </CardTitle>
              <CardDescription>Ranking por receita gerada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.serviceStats.slice(0, 5).map((service, index) => (
                  <div
                    key={service.serviceId}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">
                          {service.serviceName || "Nome não disponível"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {service.appointments} agendamentos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(service.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>
                Lista detalhada dos agendamentos no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cashFlowLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Carregando dados...
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado para os filtros selecionados.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {appointment.clientName}
                          </span>
                          <Badge
                            variant={
                              appointment.status === "completed"
                                ? "default"
                                : appointment.status === "scheduled"
                                ? "secondary"
                                : appointment.status === "cancelled"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {appointment.status === "completed"
                              ? "Concluído"
                              : appointment.status === "scheduled"
                              ? "Agendado"
                              : appointment.status === "cancelled"
                              ? "Cancelado"
                              : "Não compareceu"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.barberName} • {appointment.serviceName} •{" "}
                          {appointment.locationName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(
                            appointment.appointmentDate,
                            appointment.startTime
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatCurrency(appointment.servicePrice)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.paymentMethod || "Não informado"}
                        </div>
                        <Badge
                          variant={
                            appointment.paymentStatus === "paid"
                              ? "default"
                              : appointment.paymentStatus === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {appointment.paymentStatus === "paid"
                            ? "Pago"
                            : appointment.paymentStatus === "pending"
                            ? "Pendente"
                            : "Cancelado"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
