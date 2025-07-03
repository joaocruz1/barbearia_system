"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" // Assuming Button is needed for retrying
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
import { toast } from "sonner" // 🎯 Importando toast do sonner

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
  const [selectedLocation, setSelectedLocation] = useState("all") // This state is available but not actively used for filtering the displayed schedules in this component's current logic.

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

  const { data: barbers, loading: barbersLoading } = useApi<Barber[]>(() => barbersApi.getAll(), [])

  const { data: locations, loading: locationsLoading } = useApi<Location[]>(() => locationsApi.getAll(), [])

  // Debug logs (consider removing or wrapping in a conditional in production for performance)
  useEffect(() => {
    console.log("Schedules:", schedules)
    console.log("Barbers:", barbers)
    console.log("Locations:", locations)
    console.log("Schedules Error:", schedulesError)
  }, [schedules, barbers, locations, schedulesError])

  const getLocationColor = (locationName: string) => {
    const colors: { [key: string]: string } = {
      "Rua 13 - Ouro Fino": "bg-black",
      "Avenida - Ouro Fino": "bg-gray-800",
      Inconfidentes: "bg-gray-600",
    }
    return colors[locationName] || "bg-gray-500" // Default color
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

  const getCurrentBarberName = (id: string) => {
    const barberNames: { [key: string]: string } = {
      bruno: "Bruno Souza",
      erick: "Erick",
      ryan: "Ryan",
      carlos: "Carlos",
      julio: "Julio",
      faguinho: "Faguinho",
      joilton: "Joilton",
    }
    return barberNames[id] || barbers?.find((b) => b.id === id)?.name || id
  }

  // Loading state render
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
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p>Carregando horários...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Error state render
  if (schedulesError) {
    // 🎯 Using toast.error from sonner to display the error
    toast.error("Erro ao carregar horários", {
      description: `Não foi possível carregar os dados de horários. Detalhes: ${schedulesError || "Erro desconhecido."}`,
      duration: 5000, // Toast visible for 5 seconds
    });
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold text-black">Rodízio de Barbeiros</h1>
          </header>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-red-600 mb-4">Ocorreu um erro ao carregar os horários.</p>
              <Button onClick={refetchSchedules} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                Tentar Novamente
              </Button>
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
          {/* Debug Info (consider removing or making conditional for production) */}
          <Card className="border border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="text-sm text-gray-700">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>Schedules: {schedules?.length || 0} encontrados</p>
                <p>Barbers: {barbers?.length || 0} encontrados</p>
                <p>Locations: {locations?.length || 0} encontradas</p>
                {schedules && schedules.length > 0 && (
                  <p>
                    Primeira schedule: {schedules[0].barber?.name} - {schedules[0].location?.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

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
              <div className="grid gap-4 md:grid-cols-3">
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
                  {!schedules || schedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum horário encontrado</p>
                      <p className="text-sm mt-2">Verifique se os horários foram cadastrados no banco de dados</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left p-2 font-medium text-black">Barbeiro</th>
                            {weekDays
                              .slice(1) // Start from Monday
                              .concat(weekDays.slice(0, 1)) // Add Sunday at the end
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
                              <td className="p-2 font-medium text-black">
                                {barber.name}
                                {currentBarber === barber.id && (
                                  <Badge className="ml-2 bg-black text-white text-xs">Você</Badge>
                                )}
                              </td>
                              {weekDays
                                .slice(1) // Start from Monday
                                .concat(weekDays.slice(0, 1)) // Add Sunday at the end
                                .map((day) => {
                                  const schedule = getScheduleForDay(barber.id, day.value)
                                  return (
                                    <td key={day.value} className="p-2 text-center">
                                      {schedule ? (
                                        <div className="space-y-1">
                                          <Badge
                                            variant="outline"
                                            className={`${getLocationColor(schedule.location.name)} text-white text-xs border-0`}
                                          >
                                            {schedule.location.name.replace(" - Ouro Fino", "")}
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
                  )}
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
                          {barbersInLocation.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">Nenhum barbeiro encontrado</p>
                          ) : (
                            barbersInLocation.map((barber) => {
                              const barberLocationSchedules = locationSchedules.filter((s) => s.barberId === barber.id)
                              return (
                                <div key={barber.id} className="p-4 border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-black">{barber.name}</span>
                                    {currentBarber === barber.id && (
                                      <Badge className="bg-black text-white text-xs">Você</Badge>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    {barberLocationSchedules.length === 0 ? (
                                      <p className="text-sm text-gray-500">Nenhum horário definido</p>
                                    ) : (
                                      barberLocationSchedules.map((schedule, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm">
                                          <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-gray-500" />
                                            <span className="text-gray-700">
                                              {schedule.startTime} - {schedule.endTime}
                                            </span>
                                          </div>
                                          <div className="flex gap-1">
                                            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                              {weekDays.find((d) => d.value === schedule.weekDay)?.short}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          )}
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
                          {uniqueLocations.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">Nenhum horário definido</p>
                          ) : (
                            uniqueLocations.map((locationName) => {
                              const locationSchedules = barberSchedules.filter((s) => s.location.name === locationName)
                              return (
                                <div key={locationName} className="p-3 border border-gray-200 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge className={`${getLocationColor(locationName)} text-white border-0`}>
                                      {locationName.replace(" - Ouro Fino", "")}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    {locationSchedules.map((schedule, index) => (
                                      <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          {schedule.startTime} - {schedule.endTime}
                                        </div>
                                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                          {weekDays.find((d) => d.value === schedule.weekDay)?.short}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })
                          )}
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