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
  { id: "8cecb648-ad70-433a-9841-1717e2b0fac1", name: "Rua 13 - Ouro Fino" },
  { id: "bf844af4-e283-4600-8241-29a5fead8f18", name: "Avenida - Ouro Fino" },
  { id: "df88109a-0005-41f0-a7cc-feb19540d280", name: "Inconfidentes" },
]


const barbers = [
  { id: "25aad185-561b-4ec0-a570-a6d35d513868", name: "Bruno Souza" },
  { id: "f9d29449-bec9-4499-83e8-3ce8b1f4078d", name: "Erick" },
  { id: "e4541de6-7803-4474-9ed1-1ce6efbf591d", name: "Ryan" },
  { id: "524995f1-9827-4fba-804f-e965c8425bc2", name: "Carlos" },
  { id: "b6640820-5082-4a35-bf03-c9bb70ca280d", name: "Julio" },
  { id: "4684fd88-1307-45a1-918c-cf74879d90c9", name: "Faguinho" },
  { id: "400ab9f7-9cf1-48be-90e5-282cdcd7f874", name: "Joilton" },
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

    try {
      console.log("Tentando fazer login com:", { barberId, password: "***", locationId: location })
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId,
          password,
          locationId: location,
        }),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        // Mostrar erro de autenticação
        alert(data.error || "Erro ao fazer login")
        setIsLoading(false)
        return
      }

      // Login bem-sucedido
      console.log("Login bem-sucedido, salvando dados...")
      localStorage.setItem("barberId", barberId)
      localStorage.setItem("barberLocation", location)
      localStorage.setItem("barberName", data.barber.name)
      
      console.log("Redirecionando para dashboard...")
      
      // Adicionar um pequeno delay para garantir que o localStorage foi salvo
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (error) {
      console.error("Erro no login:", error)
      alert("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
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
