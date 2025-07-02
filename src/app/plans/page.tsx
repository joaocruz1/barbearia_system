"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Crown, Scissors, Users, TrendingUp, DollarSign, Gift, Percent } from "lucide-react"

const plans = [
  {
    id: "premium",
    name: "Barbearia Premium",
    price: 125.9,
    originalPrice: 251.8,
    color: "bg-black",
    icon: Crown,
    benefits: [
      "Corte ilimitado",
      "Barba ilimitada",
      "Descontos em produtos",
      "Sorteio de brindes",
      "Desconto em outros serviços",
    ],
    subscribers: 45,
    revenue: 5665.5,
  },
  {
    id: "cabelo",
    name: "Cabelo VIP",
    price: 69.9,
    originalPrice: 139.8,
    color: "bg-gray-800",
    icon: Scissors,
    benefits: ["Corte ilimitado", "Descontos em produtos", "Sorteio de brindes", "Desconto em outros serviços"],
    subscribers: 78,
    revenue: 5452.2,
  },
  {
    id: "barba",
    name: "Barba VIP",
    price: 69.9,
    originalPrice: 139.8,
    color: "bg-gray-600",
    icon: Star,
    benefits: ["Barba ilimitada", "Descontos em produtos", "Sorteio de brindes", "Desconto em outros serviços"],
    subscribers: 32,
    revenue: 2236.8,
  },
]

const recentSubscriptions = [
  { id: "1", clientName: "João Silva", plan: "Barbearia Premium", date: "2025-01-01", discount: true },
  { id: "2", clientName: "Maria Santos", plan: "Cabelo VIP", date: "2025-01-01", discount: true },
  { id: "3", clientName: "Pedro Costa", plan: "Barba VIP", date: "2024-12-30", discount: false },
  { id: "4", clientName: "Ana Oliveira", plan: "Barbearia Premium", date: "2024-12-29", discount: true },
]

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0)
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold text-black">Planos Clube Couto</h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {/* Estatísticas gerais */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Assinantes</CardTitle>
                <Users className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{totalSubscribers}</div>
                <p className="text-xs text-gray-500">Clientes com planos ativos</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-500">Receita recorrente</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Plano Mais Popular</CardTitle>
                <TrendingUp className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">Cabelo VIP</div>
                <p className="text-xs text-gray-500">78 assinantes</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-lg bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Promoção Ativa</CardTitle>
                <Percent className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">50%</div>
                <p className="text-xs text-gray-500">Desconto primeiro mês</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-gray-200">
              <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Assinantes
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-black data-[state=active]:text-white">
                Análises
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Cards dos planos */}
              <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => {
                  const IconComponent = plan.icon
                  return (
                    <Card
                      key={plan.id}
                      className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow bg-white"
                    >
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center mb-4`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl text-black">{plan.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-black">R$ {plan.price.toFixed(2)}</span>
                          <div className="text-sm text-gray-500">
                            <span className="line-through">R$ {plan.originalPrice.toFixed(2)}</span>
                            <Badge variant="secondary" className="ml-2 bg-gray-100 text-black">
                              50% OFF
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-gray-600">por mês</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            {plan.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>

                          <Separator />

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Assinantes</p>
                              <p className="font-semibold text-black">{plan.subscribers}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Receita</p>
                              <p className="font-semibold text-black">
                                R$ {plan.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Promoção especial */}
              <Card className="border border-gray-300 shadow-lg bg-gray-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-black">Promoção Especial</CardTitle>
                      <CardDescription className="text-gray-600">
                        50% de desconto no primeiro mês para novos assinantes
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-black">R$ 62,95</p>
                      <p className="text-sm text-gray-600">Barbearia Premium</p>
                      <p className="text-xs text-gray-500">Primeiro mês</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-black">R$ 34,95</p>
                      <p className="text-sm text-gray-600">Cabelo VIP</p>
                      <p className="text-xs text-gray-500">Primeiro mês</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-black">R$ 34,95</p>
                      <p className="text-sm text-gray-600">Barba VIP</p>
                      <p className="text-xs text-gray-500">Primeiro mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscribers" className="space-y-6">
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-black">Assinantes Recentes</CardTitle>
                  <CardDescription className="text-gray-600">Últimas assinaturas dos planos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSubscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-black" />
                          </div>
                          <div>
                            <p className="font-medium text-black">{subscription.clientName}</p>
                            <p className="text-sm text-gray-600">{subscription.plan}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="border-gray-300 text-gray-700">
                            {new Date(subscription.date).toLocaleDateString("pt-BR")}
                          </Badge>
                          {subscription.discount && <Badge className="bg-black text-white">50% OFF</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border border-gray-200 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-black">Distribuição por Plano</CardTitle>
                    <CardDescription className="text-gray-600">Percentual de assinantes por plano</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plans.map((plan) => {
                        const percentage = (plan.subscribers / totalSubscribers) * 100
                        return (
                          <div key={plan.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-black">{plan.name}</span>
                              <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`${plan.color} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-black">Receita por Plano</CardTitle>
                    <CardDescription className="text-gray-600">
                      Contribuição de cada plano para receita total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plans.map((plan) => {
                        const percentage = (plan.revenue / totalRevenue) * 100
                        return (
                          <div
                            key={plan.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${plan.color}`} />
                              <span className="font-medium text-black">{plan.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-black">
                                R$ {plan.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
