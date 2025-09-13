"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MapPin,
  User,
  Calendar,
  Home,
  Users,
  UserCheck,
  Coffee,
  AlertCircle,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import {
  barberSchedulesApi,
  barbersApi,
  locationsApi,
  type BarberSchedule,
  type Barber,
  type Location,
} from "@/lib/api";
import { toast } from "sonner";

const weekDays = [
  { value: 1, label: "Segunda-feira", short: "SEG" },
  { value: 2, label: "Terça-feira", short: "TER" },
  { value: 3, label: "Quarta-feira", short: "QUA" },
  { value: 4, label: "Quinta-feira", short: "QUI" },
  { value: 5, label: "Sexta-feira", short: "SEX" },
  { value: 6, label: "Sábado", short: "SÁB" },
  { value: 0, label: "Domingo", short: "DOM" },
];

export default function SchedulePage() {
  const [currentBarber, setCurrentBarber] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("all");

  useEffect(() => {
    const barberId = localStorage.getItem("barberId");
    setCurrentBarber(barberId);
  }, []);

  // API calls
  const {
    data: schedules,
    loading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useApi<BarberSchedule[]>(() => barberSchedulesApi.getAll(), []);

  const { data: barbers, loading: barbersLoading } = useApi<Barber[]>(
    () => barbersApi.getAll(),
    []
  );

  const { data: locations, loading: locationsLoading } = useApi<Location[]>(
    () => locationsApi.getAll(),
    []
  );

  // Debug logs
  useEffect(() => {
    console.log("Schedules:", schedules);
    console.log("Barbers:", barbers);
    console.log("Locations:", locations);
    console.log("Schedules Error:", schedulesError);
  }, [schedules, barbers, locations, schedulesError]);

  const getLocationColor = (locationName: string) => {
    const colors: { [key: string]: string } = {
      "Rua 13 - Ouro Fino": "bg-black",
      "Avenida - Ouro Fino": "bg-gray-800",
      Inconfidentes: "bg-gray-600",
    };
    return colors[locationName] || "bg-gray-500";
  };

  const getBarbersByLocation = (locationName: string) => {
    if (!schedules || !barbers) return [];
    const locationSchedules = schedules.filter(
      (schedule) => schedule.location.name === locationName
    );
    const barberIds = [
      ...new Set(locationSchedules.map((schedule) => schedule.barberId)),
    ];
    return barbers.filter((barber) => barberIds.includes(barber.id));
  };

  const getScheduleForDay = (
    barberId: string,
    day: number,
    locationName?: string
  ) => {
    if (!schedules) return null;
    return schedules.find(
      (schedule) =>
        schedule.barberId === barberId &&
        schedule.weekDay === day &&
        (!locationName || schedule.location.name === locationName)
    );
  };

  const getCurrentBarberName = (id: string) => {
    const barberNames: { [key: string]: string } = {
      bruno: "Bruno Souza",
      erick: "Erick",
      ryan: "Ryan",
      carlos: "Carlos",
      julio: "Julio",
      faguinho: "Faguinho",
      joilton: "Joilton",
    };
    return barberNames[id] || barbers?.find((b) => b.id === id)?.name || id;
  };

  // Loading state render
  if (schedulesLoading || barbersLoading || locationsLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-black" />
              <h1 className="text-lg font-semibold text-black">
                Escala de Trabalho - Barbearia
              </h1>
            </div>
          </header>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-lg font-medium">Carregando sua escala...</p>
              <p className="text-sm text-gray-600 mt-2">Aguarde um momento</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Error state render
  if (schedulesError) {
    toast.error("Erro ao carregar sua escala", {
      description: `Não foi possível carregar os dados da escala. Detalhes: ${
        schedulesError || "Erro desconhecido."
      }`,
      duration: 5000,
    });

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-black" />
              <h1 className="text-lg font-semibold text-black">
                Escala de Trabalho - Barbearia
              </h1>
            </div>
          </header>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-red-600 mb-2">
                Ops! Algo deu errado
              </p>
              <p className="text-gray-600 mb-4">
                Não conseguimos carregar sua escala de trabalho
              </p>
              <Button
                onClick={refetchSchedules}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                <Clock className="h-4 w-4 mr-2" />
                Tentar Carregar Novamente
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-black" />
            <h1 className="text-lg font-semibold text-black">
              Escala de Trabalho - Barbearia
            </h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {/* Informações do Sistema */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Informações do Sistema:</p>
                  <div className="space-y-1">
                    <p>📅 Escalas cadastradas: {schedules?.length || 0}</p>
                    <p>👥 Barbeiros na equipe: {barbers?.length || 0}</p>
                    <p>🏪 Unidades ativas: {locations?.length || 0}</p>
                    {schedules && schedules.length > 0 && (
                      <p className="text-xs mt-2 opacity-75">
                        Última atualização: {schedules[0].barber?.name} em{" "}
                        {schedules[0].location?.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-gray-200">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Resumo Geral
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className="data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Por Unidade
              </TabsTrigger>
              <TabsTrigger
                value="barber"
                className="data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Por Barbeiro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Resumo das Unidades */}
              <div>
                <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Nossas Unidades
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {locations?.map((location) => {
                    const barbersInLocation = getBarbersByLocation(
                      location.name
                    );
                    return (
                      <Card
                        key={location.id}
                        className="border border-gray-200 shadow-lg bg-white"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${getLocationColor(
                                location.name
                              )}`}
                            />
                            <CardTitle className="text-lg text-black">
                              {location.name}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Barbeiros trabalhando:
                              </span>
                              <span className="font-bold text-lg text-black">
                                {barbersInLocation.length}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-700 mb-2">
                                Equipe desta unidade:
                              </p>
                              {barbersInLocation.slice(0, 3).map((barber) => (
                                <div
                                  key={barber.id}
                                  className="text-sm text-gray-600 flex items-center gap-1"
                                >
                                  <UserCheck className="h-3 w-3" />
                                  {barber.name}
                                  {currentBarber === barber.id && (
                                    <Badge className="ml-1 bg-black text-white text-xs">
                                      Você
                                    </Badge>
                                  )}
                                </div>
                              ))}
                              {barbersInLocation.length > 3 && (
                                <div className="text-xs text-gray-500 italic">
                                  +{barbersInLocation.length - 3} outros
                                  barbeiros
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Escala Semanal Completa */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Calendar className="h-5 w-5" />
                    Escala Semanal Completa
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Veja onde cada barbeiro trabalha durante a semana - Sua
                    escala está destacada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!schedules || schedules.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        Nenhuma escala encontrada
                      </p>
                      <p className="text-sm">
                        Entre em contato com a gerência para verificar sua
                        escala
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left p-3 font-semibold text-black bg-gray-50">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Barbeiro
                              </div>
                            </th>
                            {weekDays
                              .slice(1) // Start from Monday
                              .concat(weekDays.slice(0, 1)) // Add Sunday at the end
                              .map((day) => (
                                <th
                                  key={day.value}
                                  className="text-center p-3 font-semibold min-w-32 text-black bg-gray-50"
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm">{day.short}</span>
                                    <span className="text-xs text-gray-600 font-normal">
                                      {day.label.split("-")[0]}
                                    </span>
                                  </div>
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {barbers?.map((barber, index) => (
                            <tr
                              key={barber.id}
                              className={`border-t border-gray-200 hover:bg-gray-50 ${
                                currentBarber === barber.id
                                  ? "bg-yellow-50 border-yellow-200"
                                  : ""
                              }`}
                            >
                              <td className="p-3 font-medium text-black">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      currentBarber === barber.id
                                        ? "bg-yellow-500"
                                        : "bg-gray-300"
                                    }`}
                                  />
                                  {barber.name}
                                  {currentBarber === barber.id && (
                                    <Badge className="bg-black text-white text-xs">
                                      Sua Escala
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              {weekDays
                                .slice(1) // Start from Monday
                                .concat(weekDays.slice(0, 1)) // Add Sunday at the end
                                .map((day) => {
                                  const schedule = getScheduleForDay(
                                    barber.id,
                                    day.value
                                  );
                                  return (
                                    <td
                                      key={day.value}
                                      className="p-3 text-center"
                                    >
                                      {schedule ? (
                                        <div className="space-y-2">
                                          <Badge
                                            variant="outline"
                                            className={`${getLocationColor(
                                              schedule.location.name
                                            )} text-white text-xs border-0 font-medium`}
                                          >
                                            {schedule.location.name.replace(
                                              " - Ouro Fino",
                                              ""
                                            )}
                                          </Badge>
                                          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                                            <Clock className="h-3 w-3" />
                                            {schedule.startTime} às{" "}
                                            {schedule.endTime}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center gap-1">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs bg-gray-200 text-gray-600"
                                          >
                                            <Coffee className="h-3 w-3 mr-1" />
                                            Folga
                                          </Badge>
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Escalas por Unidade
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {locations?.map((location) => {
                    const barbersInLocation = getBarbersByLocation(
                      location.name
                    );
                    const locationSchedules =
                      schedules?.filter(
                        (s) => s.location.name === location.name
                      ) || [];
                    return (
                      <Card
                        key={location.id}
                        className="border border-gray-200 shadow-lg bg-white"
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-black">
                            <div
                              className={`w-4 h-4 rounded-full ${getLocationColor(
                                location.name
                              )}`}
                            />
                            {location.name}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {barbersInLocation.length} barbeiro(s) escalado(s)
                            para esta unidade
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {barbersInLocation.length === 0 ? (
                              <div className="text-center py-6 text-gray-500">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Nenhum barbeiro escalado</p>
                              </div>
                            ) : (
                              barbersInLocation.map((barber) => {
                                const barberLocationSchedules =
                                  locationSchedules.filter(
                                    (s) => s.barberId === barber.id
                                  );
                                return (
                                  <div
                                    key={barber.id}
                                    className={`p-4 border rounded-lg ${
                                      currentBarber === barber.id
                                        ? "border-yellow-300 bg-yellow-50"
                                        : "border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <UserCheck className="h-4 w-4 text-gray-500" />
                                      <span className="font-medium text-black">
                                        {barber.name}
                                      </span>
                                      {currentBarber === barber.id && (
                                        <Badge className="bg-black text-white text-xs">
                                          Você
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="space-y-2">
                                      {barberLocationSchedules.length === 0 ? (
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                          <Coffee className="h-3 w-3" />
                                          Sem horários definidos nesta unidade
                                        </p>
                                      ) : (
                                        <div>
                                          <p className="text-xs font-medium text-gray-700 mb-2">
                                            Horários de trabalho:
                                          </p>
                                          {barberLocationSchedules.map(
                                            (schedule, index) => (
                                              <div
                                                key={index}
                                                className="flex items-center justify-between text-sm bg-white p-2 rounded border"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <Clock className="h-3 w-3 text-gray-500" />
                                                  <span className="text-gray-700 font-medium">
                                                    {schedule.startTime} às{" "}
                                                    {schedule.endTime}
                                                  </span>
                                                </div>
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs border-gray-300 text-gray-700"
                                                >
                                                  {
                                                    weekDays.find(
                                                      (d) =>
                                                        d.value ===
                                                        schedule.weekDay
                                                    )?.short
                                                  }
                                                </Badge>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="barber" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Escalas Individuais dos Barbeiros
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {barbers?.map((barber) => {
                    const barberSchedules =
                      schedules?.filter((s) => s.barberId === barber.id) || [];
                    const uniqueLocations = [
                      ...new Set(barberSchedules.map((s) => s.location.name)),
                    ];
                    const isCurrentUser = currentBarber === barber.id;

                    return (
                      <Card
                        key={barber.id}
                        className={`border shadow-lg bg-white ${
                          isCurrentUser
                            ? "ring-2 ring-black border-black bg-yellow-50"
                            : "border-gray-200"
                        }`}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-black">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isCurrentUser ? "bg-yellow-500" : "bg-gray-400"
                              }`}
                            />
                            {barber.name}
                            {isCurrentUser && (
                              <Badge className="bg-black text-white">
                                Sua Escala
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {uniqueLocations.length > 0
                              ? `Trabalha em ${uniqueLocations.length} unidade(s)`
                              : "Sem escalas definidas"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {uniqueLocations.length === 0 ? (
                              <div className="text-center py-6 text-gray-500">
                                <Coffee className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  Sem horários definidos
                                </p>
                                <p className="text-xs">
                                  Entre em contato com a gerência
                                </p>
                              </div>
                            ) : (
                              uniqueLocations.map((locationName) => {
                                const locationSchedules =
                                  barberSchedules.filter(
                                    (s) => s.location.name === locationName
                                  );
                                return (
                                  <div
                                    key={locationName}
                                    className="p-3 border border-gray-200 rounded-lg bg-white"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <Badge
                                        className={`${getLocationColor(
                                          locationName
                                        )} text-white border-0`}
                                      >
                                        {locationName.replace(
                                          " - Ouro Fino",
                                          ""
                                        )}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-xs font-medium text-gray-700">
                                        Seus horários:
                                      </p>
                                      {locationSchedules.map(
                                        (schedule, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                                          >
                                            <div className="flex items-center gap-2">
                                              <Clock className="h-3 w-3 text-gray-500" />
                                              <span className="font-medium">
                                                {schedule.startTime} às{" "}
                                                {schedule.endTime}
                                              </span>
                                            </div>
                                            <Badge
                                              variant="outline"
                                              className="text-xs border-gray-300 text-gray-700"
                                            >
                                              {
                                                weekDays.find(
                                                  (d) =>
                                                    d.value === schedule.weekDay
                                                )?.label
                                              }
                                            </Badge>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
