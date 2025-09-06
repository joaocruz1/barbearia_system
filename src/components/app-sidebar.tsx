"use client"

import { Calendar, Home, Users, LogOut, Scissors, MapPin, Crown, Lock, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Agendamentos",
    url: "/appointments",
    icon: Calendar,
  },
  {
    title: "Visão Completa",
    url: "/appointments/admin-view",
    icon: Calendar,
    adminOnly: true,
  },
  {
    title: "Planos Clube Couto",
    url: "/plans",
    icon: Crown,
  },
  {
    title: "Rodízio Barbeiros",
    url: "/schedule",
    icon: MapPin,
  },
  {
    title: "Clientes",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Serviços",
    url: "/services",
    icon: Settings,
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users,
    adminOnly: true,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Verificar se o usuário é admin
    const checkAdminStatus = async () => {
      const barberId = localStorage.getItem("barberId")
      if (barberId) {
        try {
          const response = await fetch(`/api/users?adminBarberId=${barberId}`)
          setIsAdmin(response.ok)
        } catch (error) {
          setIsAdmin(false)
        }
      }
    }
    checkAdminStatus()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("barberId")
    localStorage.removeItem("barberLocation")
    router.push("/")
  }

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader>
        <div className="flex items-center space-x-3 px-2 py-4">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">Faguinho Couto</h2>
            <p className="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Não mostrar itens adminOnly para usuários não-admin
                if (item.adminOnly && !isAdmin) {
                  return null
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          pathname === item.url ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/change-password"}>
              <Link
                href="/change-password"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  pathname === "/change-password" ? "bg-black text-white" : "text-gray-600 hover:text-black hover:bg-gray-100"
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>Alterar Senha</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-black hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair do Sistema
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
