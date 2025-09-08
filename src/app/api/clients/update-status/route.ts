import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Zerar horas para comparar apenas a data

    // Buscar todos os clientes com planos ativos
    const clients = await prisma.client.findMany({
      where: {
        isActive: true,
        planId: { not: null },
        plan: { isActive: true }
      },
      include: {
        plan: true,
      },
    })

    let updatedCount = 0
    const updates = []

    for (const client of clients) {
      if (!client.planEndDate) continue

      const endDate = new Date(client.planEndDate)
      endDate.setHours(0, 0, 0, 0)

      let newStatus = client.plan_status

      // Se a data de fim já passou e o status não é "pending", atualizar para "pending"
      if (today > endDate && client.plan_status !== "pending") {
        newStatus = "pending"
        updates.push({
          clientId: client.id,
          clientName: client.name,
          oldStatus: client.plan_status,
          newStatus: "pending",
          endDate: client.planEndDate
        })
      }
      // Se a data de fim ainda não passou e o status é "pending", pode ser que foi pago
      // (isso seria atualizado manualmente ou por webhook de pagamento)
      else if (today <= endDate && client.plan_status === "pending") {
        // Aqui você pode implementar lógica adicional se necessário
        // Por exemplo, verificar se há pagamentos recentes
      }

      // Atualizar o status se mudou
      if (newStatus !== client.plan_status) {
        await prisma.client.update({
          where: { id: client.id },
          data: { plan_status: newStatus }
        })
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} clientes tiveram o status atualizado`,
      updatedCount,
      updates,
      checkedDate: today.toISOString().split('T')[0]
    })

  } catch (error) {
    console.error("Erro ao atualizar status dos clientes:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// GET para verificar status sem atualizar
export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const clients = await prisma.client.findMany({
      where: {
        isActive: true,
        planId: { not: null },
        plan: { isActive: true }
      },
      include: {
        plan: true,
      },
    })

    const expiredClients = []
    const validClients = []

    for (const client of clients) {
      if (!client.planEndDate) continue

      const endDate = new Date(client.planEndDate)
      endDate.setHours(0, 0, 0, 0)

      const clientInfo = {
        id: client.id,
        name: client.name,
        planName: client.plan?.name,
        planEndDate: client.planEndDate,
        currentStatus: client.plan_status,
        daysUntilExpiry: Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      }

      if (today > endDate) {
        expiredClients.push(clientInfo)
      } else {
        validClients.push(clientInfo)
      }
    }

    return NextResponse.json({
      success: true,
      today: today.toISOString().split('T')[0],
      expiredClients,
      validClients,
      summary: {
        total: clients.length,
        expired: expiredClients.length,
        valid: validClients.length
      }
    })

  } catch (error) {
    console.error("Erro ao verificar status dos clientes:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
