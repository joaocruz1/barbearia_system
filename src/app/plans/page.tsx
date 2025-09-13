"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Crown,
  Scissors,
  Users,
  TrendingUp,
  DollarSign,
  Gift,
  Percent,
  Calendar,
  Phone,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { plansApi, clientsApi, type Plan, type Client } from "@/lib/api";
import { toast } from "sonner";

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // API calls
  const {
    data: plans,
    loading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useApi<Plan[]>(() => plansApi.getAll(), []);

  const {
    data: allClients,
    loading: clientsLoading,
    error: clientsError,
    refetch: refetchClients,
  } = useApi<Client[]>(() => clientsApi.getAll(), []);

  // Efeito para exibir toasts de erro
  useEffect(() => {
    if (plansError) {
      toast.error("Erro ao carregar planos", {
        description:
          "Não foi possível buscar os dados dos planos. Tente novamente.",
        action: {
          label: "Tentar Novamente",
          onClick: () => refetchPlans(),
        },
      });
    }
    if (clientsError) {
      toast.error("Erro ao carregar clientes", {
        description:
          "Não foi possível buscar os dados dos clientes. Tente novamente.",
        action: {
          label: "Tentar Novamente",
          onClick: () => refetchClients(),
        },
      });
    }
  }, [plansError, clientsError, refetchPlans, refetchClients]);

  // Calcular estatísticas
  const totalSubscribers =
    plans?.reduce((sum, plan) => sum + (plan._count?.clients || 0), 0) || 0;
  const totalRevenue =
    allClients?.reduce((sum, client) => {
      return sum + (client.plan ? Number(client.plan.price) : 0);
    }, 0) || 0;

  const mostPopularPlan = plans?.reduce(
    (prev, current) =>
      (current._count?.clients || 0) > (prev._count?.clients || 0)
        ? current
        : prev,
    plans?.[0]
  );

  // Buscar assinantes recentes (clientes com planos, ordenados por data de criação)
  const recentSubscribers =
    allClients
      ?.filter((client) => client.plan && client.plan.name !== "Avulso")
      ?.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      ?.slice(0, 10) || [];

  // Função para calcular se o cliente tem desconto (exemplo: se foi criado nos últimos 30 dias)
  const hasRecentDiscount = (createdAt: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(createdAt) > thirtyDaysAgo;
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-black" />
            <h1 className="text-lg font-semibold text-black">
              Planos e Assinaturas - Clube Couto
            </h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50">
          {/* Estatísticas gerais */}
          <div>
            <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo Financeiro dos Planos
            </h2>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total de Assinantes
                  </CardTitle>
                  <Users className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">
                    {plansLoading ? "..." : totalSubscribers}
                  </div>
                  <p className="text-xs text-gray-500">
                    Clientes com planos ativos
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Receita Mensal Recorrente
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">
                    R${" "}
                    {clientsLoading
                      ? "..."
                      : totalRevenue.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Valor garantido mensalmente
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Plano Mais Procurado
                  </CardTitle>
                  <Star className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-black">
                    {plansLoading ? "..." : mostPopularPlan?.name || "N/A"}
                  </div>
                  <p className="text-xs text-gray-500">
                    {mostPopularPlan?._count?.clients || 0} cliente(s)
                    assinante(s)
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Promoção Ativa
                  </CardTitle>
                  <Percent className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black">50%</div>
                  <p className="text-xs text-gray-500">
                    Desconto no primeiro mês
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-gray-200">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Nossos Planos
              </TabsTrigger>
              <TabsTrigger
                value="subscribers"
                className="data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Assinantes
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-black data-[state=active]:text-white flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Cards dos planos */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Planos Disponíveis para Assinatura
                </h3>
                <div className="grid gap-6 md:grid-cols-3">
                  {plansLoading
                    ? [1, 2, 3].map((i) => (
                        <Card
                          key={i}
                          className="border border-gray-200 shadow-lg bg-white"
                        >
                          <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                              <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    : plans
                        ?.filter((plan) => plan.name !== "Avulso")
                        .map((plan) => {
                          const getIconComponent = (name: string) => {
                            if (name.includes("Premium")) return Crown;
                            if (name.includes("Cabelo")) return Scissors;
                            if (name.includes("Barba")) return Star;
                            return Star;
                          };
                          const getColorClass = (name: string) => {
                            if (name.includes("Premium")) return "bg-black";
                            if (name.includes("Cabelo")) return "bg-gray-800";
                            if (name.includes("Barba")) return "bg-gray-600";
                            return "bg-gray-500";
                          };
                          const IconComponent = getIconComponent(plan.name);
                          const originalPrice = Number(plan.price) * 2; // Simulando desconto de 50%

                          return (
                            <Card
                              key={plan.id}
                              className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow bg-white"
                            >
                              <CardHeader>
                                <div
                                  className={`w-12 h-12 rounded-full ${getColorClass(
                                    plan.name
                                  )} flex items-center justify-center mb-4`}
                                >
                                  <IconComponent className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-xl text-black">
                                  {plan.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <span className="text-3xl font-bold text-black">
                                    R$ {Number(plan.price).toFixed(2)}
                                  </span>
                                  <div className="text-sm text-gray-500">
                                    <span className="line-through">
                                      R$ {originalPrice.toFixed(2)}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 bg-gray-100 text-black"
                                    >
                                      50% OFF
                                    </Badge>
                                  </div>
                                </div>
                                <CardDescription className="text-gray-600">
                                  por mês
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    {plan.description && (
                                      <p className="text-sm text-gray-700">
                                        {plan.description}
                                      </p>
                                    )}
                                    {plan.benefits &&
                                      typeof plan.benefits === "object" && (
                                        <div className="space-y-1">
                                          <p className="text-xs font-medium text-gray-700 mb-2">
                                            Benefícios inclusos:
                                          </p>
                                          {Object.entries(plan.benefits).map(
                                            ([key, value]) => {
                                              if (value === true) {
                                                const benefitText = key
                                                  .replace(/_/g, " ")
                                                  .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase()
                                                  );
                                                return (
                                                  <div
                                                    key={key}
                                                    className="flex items-center gap-2 text-sm text-gray-700"
                                                  >
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                    <span>{benefitText}</span>
                                                  </div>
                                                );
                                              }
                                              return null;
                                            }
                                          )}
                                        </div>
                                      )}
                                  </div>
                                  <Separator />
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-500 flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        Assinantes
                                      </p>
                                      <p className="font-semibold text-black">
                                        {plan._count?.clients || 0}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Receita Mensal
                                      </p>
                                      <p className="font-semibold text-black">
                                        R${" "}
                                        {(
                                          (plan._count?.clients || 0) *
                                          Number(plan.price)
                                        ).toLocaleString("pt-BR", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                </div>
              </div>

              {/* Promoção especial */}
              <Card className="border border-yellow-200 shadow-lg bg-yellow-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-black">
                        🎉 Promoção Especial Ativa
                      </CardTitle>
                      <CardDescription className="text-gray-700">
                        50% de desconto no primeiro mês para novos assinantes -
                        Oferta por tempo limitado!
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {plans
                      ?.filter((plan) => plan.name !== "Avulso")
                      .map((plan) => (
                        <div
                          key={plan.id}
                          className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                        >
                          <p className="text-2xl font-bold text-black">
                            R$ {(Number(plan.price) / 2).toFixed(2)}
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {plan.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Apenas no primeiro mês
                          </p>
                          <Badge className="mt-2 bg-black text-white text-xs">
                            ECONOMIA DE 50%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscribers" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Nossos Assinantes Ativos
                </h3>

                <Card className="border border-gray-200 shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-black flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Assinantes Mais Recentes
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {clientsLoading
                        ? "Carregando assinantes..."
                        : `${recentSubscribers.length} assinante(s) com planos ativos`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientsLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                                <div className="w-20 h-6 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : recentSubscribers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">
                            Nenhum assinante encontrado
                          </p>
                          <p className="text-sm">
                            Ainda não há clientes com planos ativos
                          </p>
                        </div>
                      ) : (
                        recentSubscribers.map((client) => {
                          const getColorClass = (planName: string) => {
                            if (planName.includes("Premium")) return "bg-black";
                            if (planName.includes("Cabelo"))
                              return "bg-gray-800";
                            if (planName.includes("Barba"))
                              return "bg-gray-600";
                            return "bg-gray-400";
                          };

                          const hasDiscount = client.createdAt
                            ? hasRecentDiscount(client.createdAt)
                            : false;

                          return (
                            <div
                              key={client.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-10 h-10 ${getColorClass(
                                    client.plan?.name || ""
                                  )} rounded-full flex items-center justify-center`}
                                >
                                  {client.plan?.name?.includes("Premium") ? (
                                    <Crown className="h-5 w-5 text-white" />
                                  ) : (
                                    <Star className="h-5 w-5 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-black">
                                    {client.name}
                                  </p>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {client.phone}
                                    </span>
                                    <span className="font-medium">
                                      {client.plan?.name}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Assinante desde:{" "}
                                    {client.createdAt
                                      ? new Date(
                                          client.createdAt
                                        ).toLocaleDateString("pt-BR")
                                      : "Data não disponível"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right">
                                  <p className="font-semibold text-black">
                                    R${" "}
                                    {Number(client.plan?.price || 0).toFixed(2)}
                                    /mês
                                  </p>
                                  {client.planEndDate && (
                                    <p className="text-xs text-gray-500">
                                      Válido até:{" "}
                                      {new Date(
                                        client.planEndDate
                                      ).toLocaleDateString("pt-BR")}
                                    </p>
                                  )}
                                </div>
                                {hasDiscount && (
                                  <Badge className="bg-black text-white text-xs">
                                    50% OFF
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análise de Performance dos Planos
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader>
                      <CardTitle className="text-black">
                        Distribuição de Assinantes por Plano
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Percentual de clientes em cada plano disponível
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {plansLoading ? (
                          [1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse space-y-2">
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-2 bg-gray-200 rounded"></div>
                            </div>
                          ))
                        ) : totalSubscribers === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum assinante para análise</p>
                          </div>
                        ) : (
                          plans
                            ?.filter((plan) => plan.name !== "Avulso")
                            .map((plan) => {
                              const percentage =
                                totalSubscribers > 0
                                  ? ((plan._count?.clients || 0) /
                                      totalSubscribers) *
                                    100
                                  : 0;
                              const getColorClass = (name: string) => {
                                if (name.includes("Premium")) return "bg-black";
                                if (name.includes("Cabelo"))
                                  return "bg-gray-800";
                                if (name.includes("Barba"))
                                  return "bg-gray-600";
                                return "bg-gray-500";
                              };

                              return (
                                <div key={plan.id} className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-black font-medium">
                                      {plan.name}
                                    </span>
                                    <span className="text-gray-600">
                                      {plan._count?.clients || 0} cliente(s) -{" "}
                                      {percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`${getColorClass(
                                        plan.name
                                      )} h-2 rounded-full transition-all duration-300`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 shadow-lg bg-white">
                    <CardHeader>
                      <CardTitle className="text-black">
                        Receita Mensal por Plano
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Quanto cada plano contribui para a receita total
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {plansLoading ? (
                          [1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-16 bg-gray-200 rounded-lg"></div>
                            </div>
                          ))
                        ) : totalRevenue === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhuma receita para análise</p>
                          </div>
                        ) : (
                          plans
                            ?.filter((plan) => plan.name !== "Avulso")
                            .map((plan) => {
                              const planRevenue =
                                (plan._count?.clients || 0) *
                                Number(plan.price);
                              const percentage =
                                totalRevenue > 0
                                  ? (planRevenue / totalRevenue) * 100
                                  : 0;
                              const getColorClass = (name: string) => {
                                if (name.includes("Premium")) return "bg-black";
                                if (name.includes("Cabelo"))
                                  return "bg-gray-800";
                                if (name.includes("Barba"))
                                  return "bg-gray-600";
                                return "bg-gray-500";
                              };

                              return (
                                <div
                                  key={plan.id}
                                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={`w-4 h-4 rounded-full ${getColorClass(
                                        plan.name
                                      )}`}
                                    />
                                    <div>
                                      <span className="font-medium text-black">
                                        {plan.name}
                                      </span>
                                      <p className="text-xs text-gray-500">
                                        {plan._count?.clients || 0} assinante(s)
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-black">
                                      R${" "}
                                      {planRevenue.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                      })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {percentage.toFixed(1)}% da receita
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
