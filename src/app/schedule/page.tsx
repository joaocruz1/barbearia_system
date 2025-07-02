"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, User, Calendar } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import {
  barberSchedulesApi,
  barbersApi,
  locationsApi,
  type BarberSchedule,
  type Barber,
  type Location,
} from "@/lib/api"
import { toast } from "sonner" // 👈 NOVO: Importar o toast

const weekDays = [
  { value: 1, label: "Segunda", short: "SEG" },
  { value: 2, label: "Terça", short: "TER" },
  { value: 3, label: "Quarta", short: "QUA" },
  { value: 4, label: "Quinta", short: "QUI" },
  { value: 5, label: "Sexta", short: "SEX" },
  { value: 6, label: "Sábado", short: "SAB" },
  { value: 0, label: "Domingo", short: "DOM" },
]

export default function SchedulePage() {
  const [currentBarber, setCurrentBarber] = useState<string | null>(null)

  useEffect(() => {
    const barberId = localStorage.getItem("barberId")
    setCurrentBarber(barberId)
  }, [])

  // API calls
  const {
    data: schedules,
    loading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useApi<BarberSchedule[]>(() => barberSchedulesApi.getAll(), [])

  const {
    data: barbers,
    loading: barbersLoading,
    error: barbersError,
    refetch: refetchBarbers,
  } = useApi<Barber[]>(() => barbersApi.getAll(), [])

  const {
    data: locations,
    loading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useApi<Location[]>(() => locationsApi.getAll(), [])

  // 👇 NOVO: Efeito para exibir toasts de erro
  useEffect(() => {
    if (schedulesError) {
      toast.error("Erro ao carregar horários", {
        description: "Não foi possível buscar os dados da grade. Tente novamente.",
        action: {
          label: "Tentar Novamente",
          onClick: () => refetchSchedules(),
        },
      })
    }
    if (barbersError) {
      toast.error("Erro ao carregar barbeiros", {
        description: "Não foi possível buscar os dados dos barbeiros. Tente novamente.",
        action: {
          label: "Tentar Novamente",
          onClick: () => refetchBarbers(),
        },
      })
    }
    if (locationsError) {
      toast.error("Erro ao carregar localidades", {
        description: "Não foi possível buscar os dados das localidades. Tente novamente.",
        action: {
          label: "Tentar Novamente",
          onClick: () => refetchLocations(),
        },
      })
    }
  }, [
    schedulesError,
    barbersError,
    locationsError,
    refetchSchedules,
    refetchBarbers,
    refetchLocations,
  ])

  const getLocationColor = (locationName: string) => {
    const colors: { [key: string]: string } = {
      "Rua 13": "bg-black",
      Avenida: "bg-gray-800",
      Inconfidentes: "bg-gray-600",
      "Ouro Fino": "bg-gray-400",
    }
    return colors[locationName] || "bg-gray-500"
  }

  const getBarbersByLocation = (locationName: string) => {
    if (!schedules || !barbers) return []

    const locationSchedules = schedules.filter((schedule) => schedule.location.name === locationName)
    const barberIds = [...new Set(locationSchedules.map((schedule) => schedule.barberId))]

    return barbers.filter((barber) => barberIds.includes(barber.id))
  }

  const getScheduleForDay = (barberId: string, day: number, locationName?: string) => {
    if (!schedules) return null

    return schedules.find(
      (schedule) =>
        schedule.barberId === barberId &&
        schedule.weekDay === day &&
        (!locationName || schedule.location.name === locationName),
    )
  }

  if (schedulesLoading || barbersLoading || locationsLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold text-black">Rodízio de Barbeiros</h1>
          </header>
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p>Carregando horários...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold text-black">Rodízio de Barbeiros</h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-gray-200">
              <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="location" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Por Localidade
              </TabsTrigger>
              <TabsTrigger value="barber" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Por Barbeiro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Resumo por localidade */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {locations?.map((location) => {
                  const barbersInLocation = getBarbersByLocation(location.name)
                  return (
                    <Card key={location.id} className="border border-gray-200 shadow-lg bg-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getLocationColor(location.name)}`} />
                          <CardTitle className="text-lg text-black">{location.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Barbeiros:</span>
                            <span className="font-medium text-black">{barbersInLocation.length}</span>
                          </div>
                          <div className="space-y-1">
                            {barbersInLocation.slice(0, 3).map((barber) => (
                              <div key={barber.id} className="text-xs text-gray-500">
                                • {barber.name}
                              </div>
                            ))}
                            {barbersInLocation.length > 3 && (
                              <div className="text-xs text-gray-500">+{barbersInLocation.length - 3} mais</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Grade semanal */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Calendar className="h-5 w-5" />
                    Grade Semanal Completa
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Visualização completa do rodízio de todos os barbeiros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-2 font-medium text-black">Barbeiro</th>
                          {weekDays
                            .slice(1)
                            .concat(weekDays.slice(0, 1))
                            .map((day) => (
                              <th key={day.value} className="text-center p-2 font-medium min-w-24 text-black">
                                {day.short}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {barbers?.map((barber) => (
                          <tr key={barber.id} className="border-t border-gray-200">
                            <td className="p-2 font-medium text-black">{barber.name}</td>
                            {weekDays
                              .slice(1)
                              .concat(weekDays.slice(0, 1))
                              .map((day) => {
                                const schedule = getScheduleForDay(barber.id, day.value)
                                return (
                                  <td key={day.value} className="p-2 text-center">
                                    {schedule ? (
                                      <div className="space-y-1">
                                        <Badge
                                          variant="outline"
                                          className={`${getLocationColor(
                                            schedule.location.name,
                                          )} text-white text-xs border-0`}
                                        >
                                          {schedule.location.name}
                                        </Badge>
                                        <div className="text-xs text-gray-500">
                                          {schedule.startTime}-{schedule.endTime}
                                        </div>
                                      </div>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">
                                        Folga
                                      </Badge>
                                    )}
                                  </td>
                                )
                              })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {locations?.map((location) => {
                  const barbersInLocation = getBarbersByLocation(location.name)
                  const locationSchedules = schedules?.filter((s) => s.location.name === location.name) || []

                  return (
                    <Card key={location.id} className="border border-gray-200 shadow-lg bg-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <MapPin className="h-5 w-5" />
                          {location.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {barbersInLocation.length} barbeiro(s) nesta localidade
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {barbersInLocation.map((barber) => {
                            const barberLocationSchedules = locationSchedules.filter(
                              (s) => s.barberId === barber.id,
                            )
                            return (
                              <div key={barber.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-black">{barber.name}</span>
                                </div>
                                <div className="space-y-2">
                                  {barberLocationSchedules.map((schedule, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-gray-500" />
                                        <span className="text-gray-700">
                                          {schedule.startTime} - {schedule.endTime}
                                        </span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-gray-300 text-gray-700"
                                        >
                                          {weekDays.find((d) => d.value === schedule.weekDay)?.short}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="barber" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {barbers?.map((barber) => {
                  const barberSchedules = schedules?.filter((s) => s.barberId === barber.id) || []
                  const uniqueLocations = [...new Set(barberSchedules.map((s) => s.location.name))]

                  return (
                    <Card
                      key={barber.id}
                      className={`border shadow-lg bg-white ${
                        currentBarber === barber.id ? "ring-2 ring-black border-black" : "border-gray-200"
                      }`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <User className="h-5 w-5" />
                          {barber.name}
                          {currentBarber === barber.id && <Badge className="bg-black text-white">Você</Badge>}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {uniqueLocations.length} localidade(s)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {uniqueLocations.map((locationName) => {
                            const locationSchedules = barberSchedules.filter(
                              (s) => s.location.name === locationName,
                            )
                            return (
                              <div key={locationName} className="p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={`${getLocationColor(locationName)} text-white border-0`}>
                                    {locationName}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  {locationSchedules.map((schedule, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        {schedule.startTime} - {schedule.endTime}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-gray-300 text-gray-700"
                                      >
                                        {weekDays.find((d) => d.value === schedule.weekDay)?.short}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}