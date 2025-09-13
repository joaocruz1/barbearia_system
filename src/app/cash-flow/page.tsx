"use client";

import React, { useMemo, memo } from "react";
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
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Users,
  Scissors,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useCashFlow } from "@/contexts/CashFlowContext";
import { toast } from "sonner";

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

// Componente memoizado para os cards de resumo
const StatsCards = memo(({ stats }: { stats: any }) => (
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
));

StatsCards.displayName = "StatsCards";

// Componente memoizado para métodos de pagamento
const PaymentMethods = memo(({ stats }: { stats: any }) => (
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
));

PaymentMethods.displayName = "PaymentMethods";

// Componente memoizado para top barbeiros
const TopBarbers = memo(({ barberStats }: { barberStats: any[] }) => (
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
        {barberStats.slice(0, 5).map((barber, index) => (
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
));

TopBarbers.displayName = "TopBarbers";

// Componente memoizado para top serviços
const TopServices = memo(({ serviceStats }: { serviceStats: any[] }) => (
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
        {serviceStats.slice(0, 5).map((service, index) => (
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
));

TopServices.displayName = "TopServices";

// Componente memoizado para lista de agendamentos
const AppointmentsList = memo(({ 
  appointments, 
  isLoading 
}: { 
  appointments: any[], 
  isLoading: boolean 
}) => {
  if (isLoading) {
    return (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Carregando dados...
                </div>
    );
  }

  if (appointments.length === 0) {
    return (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado para os filtros selecionados.
                </div>
    );
  }

  return (
                <div className="space-y-4">
      {appointments.map((appointment) => (
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
  );
});

AppointmentsList.displayName = "AppointmentsList";

export default function CashFlowPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { locations, barbers, isLoading: dataLoading } = useData();
  const {
    data: cashFlowData,
    isLoading: cashFlowLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useCashFlow();

  // Memoizar handlers para evitar re-criações
  const handleRefresh = useMemo(() => () => {
    refetch();
    toast.success("Dados atualizados com sucesso!");
  }, [refetch]);

  const handleExport = useMemo(() => () => {
    toast.info("Funcionalidade de exportação em desenvolvimento");
  }, []);

  // Memoizar filtros para evitar re-renderizações desnecessárias
  const memoizedFilters = useMemo(() => ({
    startDate: filters.startDate,
    endDate: filters.endDate,
    locationId: filters.locationId,
    barberId: filters.barberId,
    status: filters.status,
  }), [filters]);

  // Filtrar agendamentos por status
  const filteredAppointments = useMemo(() => {
    if (!cashFlowData?.appointments) return [];

    if (!filters.status || filters.status === "all")
      return cashFlowData.appointments;

    return cashFlowData.appointments.filter(
      (appointment) => appointment.status === filters.status
    );
  }, [cashFlowData?.appointments, filters.status]);

  // Loading state
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin mr-2" />
        Carregando...
      </div>
    );
  }

  // Verificar se é admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro ao Carregar Dados</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
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
                    value={memoizedFilters.startDate}
                    onChange={(e) => setFilters({ startDate: e.target.value })}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={memoizedFilters.endDate}
                    onChange={(e) => setFilters({ endDate: e.target.value })}
                    className="h-9"
                  />
                </div>

                {/* Localização */}
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <Select
                    value={memoizedFilters.locationId}
                    onValueChange={(value) => setFilters({ locationId: value })}
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
                    value={memoizedFilters.barberId}
                    onValueChange={(value) => setFilters({ barberId: value })}
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
                    value={memoizedFilters.status}
                    onValueChange={(value) => setFilters({ status: value })}
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
          <StatsCards stats={stats} />

          {/* Métodos de Pagamento */}
          <PaymentMethods stats={stats} />

          {/* Top Barbeiros */}
          <TopBarbers barberStats={stats?.barberStats || []} />

          {/* Top Serviços */}
          <TopServices serviceStats={stats?.serviceStats || []} />

          {/* Lista de Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>
                Lista detalhada dos agendamentos no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentsList 
                appointments={filteredAppointments} 
                isLoading={cashFlowLoading} 
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
