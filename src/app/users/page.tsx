"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Users, Plus, Edit, Trash2, Shield, User, Lock, Mail, Phone } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const router = useRouter()

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "funcionario",
  })

  useEffect(() => {
    const barberId = localStorage.getItem("barberId")
    if (!barberId) {
      router.push("/")
      return
    }

    // Verificar se o usuário atual é admin
    checkUserRole(barberId)
    loadUsers(barberId)
  }, [router])

  const checkUserRole = async (barberId: string) => {
    try {
      const response = await fetch(`/api/users?adminBarberId=${barberId}`)
      if (response.ok) {
        setIsAdmin(true)
        const usersData = await response.json()
        setUsers(usersData)
        
        // Encontrar o usuário atual
        const currentUserData = usersData.find((user: User) => user.id === barberId)
        setCurrentUser(currentUserData)
      } else {
        setIsAdmin(false)
        toast.error("Acesso negado. Apenas administradores podem acessar esta página.")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Erro ao verificar role:", error)
      setIsAdmin(false)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async (adminBarberId: string) => {
    try {
      const response = await fetch(`/api/users?adminBarberId=${adminBarberId}`)
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast.error("Erro ao carregar usuários")
    }
  }

  const handleCreateUser = async () => {
    try {
      const barberId = localStorage.getItem("barberId")
      if (!barberId) return

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminBarberId: barberId,
          ...formData,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Usuário criado com sucesso!")
        setShowCreateDialog(false)
        setFormData({ name: "", email: "", phone: "", password: "", role: "funcionario" })
        loadUsers(barberId)
      } else {
        toast.error(data.error || "Erro ao criar usuário")
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      toast.error("Erro ao criar usuário")
    }
  }

  const handleUpdateUser = async () => {
    try {
      const barberId = localStorage.getItem("barberId")
      if (!barberId || !selectedUser) return

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminBarberId: barberId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          isActive: selectedUser.isActive,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Usuário atualizado com sucesso!")
        setShowEditDialog(false)
        setSelectedUser(null)
        setFormData({ name: "", email: "", phone: "", password: "", role: "funcionario" })
        loadUsers(barberId)
      } else {
        toast.error(data.error || "Erro ao atualizar usuário")
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      toast.error("Erro ao atualizar usuário")
    }
  }

  const handleResetPassword = async () => {
    try {
      const barberId = localStorage.getItem("barberId")
      if (!barberId || !selectedUser) return

      const response = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminBarberId: barberId,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Senha resetada com sucesso! Nova senha: ${data.newPassword}`)
        setShowResetDialog(false)
        setSelectedUser(null)
        setNewPassword("")
      } else {
        toast.error(data.error || "Erro ao resetar senha")
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error)
      toast.error("Erro ao resetar senha")
    }
  }

  const handleToggleUserStatus = async (user: User) => {
    try {
      const barberId = localStorage.getItem("barberId")
      if (!barberId) return

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminBarberId: barberId,
          isActive: !user.isActive,
        }),
      })

      if (response.ok) {
        toast.success(`Usuário ${user.isActive ? "desativado" : "ativado"} com sucesso!`)
        loadUsers(barberId)
      } else {
        const data = await response.json()
        toast.error(data.error || "Erro ao alterar status do usuário")
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      toast.error("Erro ao alterar status do usuário")
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role,
    })
    setShowEditDialog(true)
  }

  const openResetDialog = (user: User) => {
    setSelectedUser(user)
    setNewPassword("")
    setShowResetDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-black" />
            <span className="text-lg font-semibold text-black">Gerenciar Usuários</span>
            <Badge variant="outline" className="border-gray-300 text-gray-700">
              Admin
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-black">Usuários do Sistema</h1>
              <p className="text-gray-600">Gerencie os usuários e suas permissões</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo usuário do sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(35) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="funcionario">Funcionário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateUser} disabled={!formData.name || !formData.password}>
                    Criar Usuário
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {users.length} usuário(s) cadastrado(s) no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      user.isActive ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.role === "admin" ? (
                          <Shield className="h-5 w-5 text-black" />
                        ) : (
                          <User className="h-5 w-5 text-black" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-black">{user.name}</h3>
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className={user.role === "admin" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}
                          >
                            {user.role === "admin" ? "Admin" : "Funcionário"}
                          </Badge>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                            className={user.isActive ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                          >
                            {user.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {user.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResetDialog(user)}
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={user.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={user.id === currentUser?.id}
                        className={user.isActive ? "text-red-600 border-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700"}
                      >
                        {user.isActive ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Edição */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Altere os dados do usuário selecionado.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Função</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Reset de Senha */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resetar Senha</DialogTitle>
              <DialogDescription>
                Defina uma nova senha para o usuário {selectedUser?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleResetPassword} disabled={newPassword.length < 6}>
                Resetar Senha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
