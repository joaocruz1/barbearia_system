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

// Dados dos barbeiros e seus horários por localidade
const barberSchedules = {
  bruno: {
    name: "Bruno Souza",
    schedules: [
      { location: "Rua 13", days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "19:00" },
      { location: "Rua 13", days: [6], startTime: "09:00", endTime: "15:00" },
    ],
  },
  erick: {
    name: "Erick",
    schedules: [
      { location: "Rua 13", days: [1, 2, 3, 4], startTime: "09:00", endTime: "19:00" },
      { location: "Rua 13", days: [5], startTime: "08:00", endTime: "19:00" },
      { location: "Rua 13", days: [6], startTime: "08:00", endTime: "15:00" },
    ],
  },
  ryan: {
    name: "Ryan",
    schedules: [
      { location: "Avenida", days: [1, 2, 3, 4], startTime: "09:00", endTime: "19:00" },
      { location: "Inconfidentes", days: [5], startTime: "08:30", endTime: "19:00" },
      { location: "Inconfidentes", days: [6], startTime: "07:30", endTime: "15:00" },
    ],
  },
  carlos: {
    name: "Carlos",
    schedules: [
      { location: "Inconfidentes", days: [1, 3, 5], startTime: "09:00", endTime: "19:00" },
      { location: "Inconfidentes", days: [6], startTime: "09:00", endTime: "15:00" },
      { location: "Rua 13", days: [2, 4], startTime: "09:00", endTime: "19:00" },
    ],
  },
  julio: {
    name: "Julio",
    schedules: [
      { location: "Inconfidentes", days: [1, 2, 3, 4], startTime: "09:00", endTime: "19:00" },
      { location: "Rua 13", days: [5], startTime: "09:00", endTime: "19:00" },
      { location: "Rua 13", days: [6], startTime: "09:00", endTime: "15:00" },
    ],
  },
  faguinho: {
    name: "Faguinho",
    schedules: [
      { location: "Inconfidentes", days: [2, 4], startTime: "09:00", endTime: "19:00" },
      { location: "Rua 13", days: [3], startTime: "09:00", endTime: "19:00" },
      { location: "Avenida", days: [5], startTime: "09:00", endTime: "19:00" },
      { location: "Avenida", days: [6], startTime: "09:00", endTime: "15:00" },
    ],
  },
  joilton: {
    name: "Joilton",
    schedules: [
      { location: "Avenida", days: [1, 2, 3, 4, 5], startTime: "09:00", endTime: "19:00" },
      { location: "Avenida", days: [6], startTime: "09:00", endTime: "15:00" },
    ],
  },
}

const weekDays = [
  { value: 1, label: "Segunda", short: "SEG" },
  { value: 2, label: "Terça", short: "TER" },
  { value: 3, label: "Quarta", short: "QUA" },
  { value: 4, label: "Quinta", short: "QUI" },
  { value: 5, label: "Sexta", short: "SEX" },
  { value: 6, label: "Sábado", short: "SAB" },
  { value: 0, label: "Domingo", short: "DOM" },
]

const locations = ["Rua 13", "Avenida", "Inconfidentes", "Ouro Fino"]

export default function SchedulePage() {
  const [currentBarber, setCurrentBarber] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState("all")

  useEffect(() => {
    const barberId = localStorage.getItem("barberId")
    setCurrentBarber(barberId)
  }, [])

  const getLocationColor = (location: string) => {
    const colors: { [key: string]: string } = {
      "Rua 13": "bg-black",
      Avenida: "bg-gray-800",
      Inconfidentes: "bg-gray-600",
      "Ouro Fino": "bg-gray-400",
    }
    return colors[location] || "bg-gray-500"
  }

  const getBarbersByLocation = (location: string) => {
    return Object.entries(barberSchedules).filter(([_, barber]) =>
      barber.schedules.some((schedule) => schedule.location === location),
    )
  }

  const getScheduleForDay = (barberId: string, day: number, location?: string) => {
    const barber = barberSchedules[barberId as keyof typeof barberSchedules]
    if (!barber) return null

    return barber.schedules.find(
      (schedule) => schedule.days.includes(day) && (!location || schedule.location === location),
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
                {locations.map((location) => {
                  const barbersInLocation = getBarbersByLocation(location)
                  return (
                    <Card key={location} className="border border-gray-200 shadow-lg bg-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getLocationColor(location)}`} />
                          <CardTitle className="text-lg text-black">{location}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Barbeiros:</span>
                            <span className="font-medium text-black">{barbersInLocation.length}</span>
                          </div>
                          <div className="space-y-1">
                            {barbersInLocation.slice(0, 3).map(([id, barber]) => (
                              <div key={id} className="text-xs text-gray-500">
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
                        {Object.entries(barberSchedules).map(([id, barber]) => (
                          <tr key={id} className="border-t border-gray-200">
                            <td className="p-2 font-medium text-black">{barber.name}</td>
                            {weekDays
                              .slice(1)
                              .concat(weekDays.slice(0, 1))
                              .map((day) => {
                                const schedule = getScheduleForDay(id, day.value)
                                return (
                                  <td key={day.value} className="p-2 text-center">
                                    {schedule ? (
                                      <div className="space-y-1">
                                        <Badge
                                          variant="outline"
                                          className={`${getLocationColor(schedule.location)} text-white text-xs border-0`}
                                        >
                                          {schedule.location}
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
                {locations.map((location) => {
                  const barbersInLocation = getBarbersByLocation(location)
                  return (
                    <Card key={location} className="border border-gray-200 shadow-lg bg-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black">
                          <MapPin className="h-5 w-5" />
                          {location}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {barbersInLocation.length} barbeiro(s) nesta localidade
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {barbersInLocation.map(([id, barber]) => {
                            const locationSchedules = barber.schedules.filter((s) => s.location === location)
                            return (
                              <div key={id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-black">{barber.name}</span>
                                </div>
                                <div className="space-y-2">
                                  {locationSchedules.map((schedule, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-gray-500" />
                                        <span className="text-gray-700">
                                          {schedule.startTime} - {schedule.endTime}
                                        </span>
                                      </div>
                                      <div className="flex gap-1">
                                        {schedule.days.map((day) => (
                                          <Badge
                                            key={day}
                                            variant="outline"
                                            className="text-xs border-gray-300 text-gray-700"
                                          >
                                            {weekDays.find((d) => d.value === day)?.short}
                                          </Badge>
                                        ))}
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
                {Object.entries(barberSchedules).map(([id, barber]) => (
                  <Card
                    key={id}
                    className={`border shadow-lg bg-white ${currentBarber === id ? "ring-2 ring-black border-black" : "border-gray-200"}`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-black">
                        <User className="h-5 w-5" />
                        {barber.name}
                        {currentBarber === id && <Badge className="bg-black text-white">Você</Badge>}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {barber.schedules.length} localidade(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {barber.schedules.map((schedule, index) => (
                          <div key={index} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={`${getLocationColor(schedule.location)} text-white border-0`}>
                                {schedule.location}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {schedule.days.map((day) => (
                                <Badge key={day} variant="outline" className="text-xs border-gray-300 text-gray-700">
                                  {weekDays.find((d) => d.value === day)?.short}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
