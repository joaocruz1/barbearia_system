"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // Validar se as senhas coincidem
    if (newPassword !== confirmPassword) {
      setMessage("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    // Validar tamanho da senha
    if (newPassword.length < 6) {
      setMessage("A nova senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const barberId = localStorage.getItem("barberId")
      if (!barberId) {
        setMessage("Usuário não autenticado")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId,
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || "Erro ao alterar senha")
        setIsLoading(false)
        return
      }

      setMessage("Senha alterada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      // Redirecionar para o dashboard após 2 segundos
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)

    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      setMessage("Erro de conexão. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border border-gray-800 bg-white">
        <CardHeader className="text-center pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="mx-auto mb-4 w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-black">Alterar Senha</CardTitle>
          <CardDescription className="text-base mt-2 text-gray-600">
            Digite sua senha atual e a nova senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-black">
                Senha Atual
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-500" />
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Digite sua senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-black"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-black">
                Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-500" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-black"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-4 h-4 w-4 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-black"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes("sucesso") 
                  ? "bg-green-100 text-green-700 border border-green-300" 
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}>
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? "Alterando..." : "Alterar Senha"}
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
