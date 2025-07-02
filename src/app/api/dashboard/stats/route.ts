import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/dashboard/stats - Estatísticas do dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get("barberId")
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    const where: any = {
      appointmentDate: new Date(date),
    }

    // Se barberId for fornecido, filtrar apenas os agendamentos desse barbeiro
    if (barberId) {
      where.barberId = barberId
    }

    // Agendamentos do dia
    const todayAppointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          include: {
            plan: true,
          },
        },
        service: true,
        barber: true,
        location: true,
      },
      orderBy: [{ startTime: "asc" }],
    })

    // Receita do dia (apenas serviços avulsos)
    const todayRevenue = todayAppointments
      .filter((apt) => apt.paymentMethod !== "Plano")
      .reduce((total, apt) => total + Number(apt.service.price), 0)

    // Clientes VIP do dia
    const vipClients = todayAppointments.filter((apt) => apt.client.plan && apt.client.plan.name !== "Avulso").length

    // Taxa de ocupação (baseada nos agendamentos vs slots disponíveis)
    const totalSlots = 10 // Assumindo 10 slots por dia por barbeiro
    const occupancyRate = Math.min((todayAppointments.length / totalSlots) * 100, 100)

    // Estatísticas gerais
    const totalClients = await prisma.client.count({
      where: { isActive: true },
    })

    const totalClientsWithPlans = await prisma.client.count({
      where: {
        isActive: true,
        planId: { not: null },
      },
    })

    const monthlyRevenue = await prisma.client.findMany({
      where: {
        isActive: true,
        planId: { not: null },
      },
      include: {
        plan: true,
      },
    })

    const monthlyPlanRevenue = monthlyRevenue.reduce(
      (total, client) => total + (client.plan ? Number(client.plan.price) : 0),
      0,
    )

    return NextResponse.json({
      today: {
        appointments: todayAppointments.length,
        revenue: todayRevenue,
        vipClients,
        occupancyRate: Math.round(occupancyRate),
      },
      general: {
        totalClients,
        totalClientsWithPlans,
        monthlyPlanRevenue,
      },
      appointments: todayAppointments,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
