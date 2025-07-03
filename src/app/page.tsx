"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scissors, User, Lock, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

const locations = [
  { id: "33c430c1-1652-4ee3-b4a1-00b141d9dd35", name: "Rua 13 - Ouro Fino" },
  { id: "a5748ee0-bffc-41a0-9c74-46afc6468db2", name: "Avenida - Ouro Fino" },
  { id: "b97c7d24-fff9-4ea8-9e4b-3d670b70e12d", name: "Inconfidentes" },
]

const barbers = [
  { id: "16dae2fe-cb58-4dd4-a454-fdb352500538", name: "Bruno Souza" },
  { id: "a7ad7f98-8107-49ea-b44c-317a6569c593", name: "Erick" },
  { id: "c1f4c1d4-de40-417b-9e22-49d7db1fa2b3", name: "Ryan" },
  { id: "a027418f-072e-4bfb-b83a-3873e14baeb8", name: "Carlos" },
  { id: "9036779c-1967-4b46-83ae-49692a51d286", name: "Julio" },
  { id: "231bd7d5-e407-4250-81f1-98bea95c372b", name: "Faguinho" },
  { id: "e5a5ef77-7c77-445b-b412-88a4ae1237e2", name: "Joilton" },
]

export default function LoginPage() {
  const [barberId, setBarberId] = useState("")
  const [password, setPassword] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular autenticação
    setTimeout(() => {
      if (barberId && password && location) {
        localStorage.setItem("barberId", barberId)
        localStorage.setItem("barberLocation", location)
        router.push("/dashboard")
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-800 bg-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-black">Barbearia Faguinho Couto</CardTitle>
          <CardDescription className="text-base mt-2 text-gray-600">
            Sistema de Gestão - Faça login para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barberId" className="text-sm font-medium text-black">
                Barbeiro
              </Label>
              <Select onValueChange={setBarberId} required>
                <SelectTrigger className="h-12 border-gray-300 focus:border-black">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Selecione seu nome" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-black">
                Localidade
              </Label>
              <Select onValueChange={setLocation} required>
                <SelectTrigger className="h-12 border-gray-300 focus:border-black">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Selecione a localidade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-black">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-black"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no Sistema"}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Barbearia Faguinho Couto © 2025</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
