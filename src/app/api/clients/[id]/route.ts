import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Route } from "next"

type RouteContext = { 
  params: Promise<{id : string}>
}

// GET /api/clients/[id] - Buscar cliente por ID
export async function GET(request: NextRequest, context : RouteContext): Promise<NextResponse> {
  const routeParams = await context.params;
  const  id  = routeParams.id
  try {
    const client = await prisma.client.findUnique({
      where: { id: id },
      include: {
        plan: true,
        appointments: {
          include: {
            service: true,
            barber: true,
            location: true,
          },
          orderBy: {
            appointmentDate: "desc",
          },
        },
        planUsage: {
          orderBy: {
            usedAt: "desc",
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

// PUT /api/clients/[id] - Atualizar cliente
export async function PUT(request: NextRequest, context : RouteContext): Promise<NextResponse> {
  const routeParams = await context.params;
  const  id  = routeParams.id

  try {
    const body = await request.json()
    const { name, phone, email, planId, planStartDate, planEndDate, isActive } = body

    // Determinar se o cliente será "Avulso" (sem plano)
    const isAvulso = !planId || planId === "none" || planId === null

    // Preparar os dados para atualização
    const updateData: any = {
      name,
      phone,
      email,
      isActive,
    }

    if (isAvulso) {
      // Cliente Avulso: limpar plano e definir status
      updateData.planId = null
      updateData.planStartDate = null
      updateData.planEndDate = null
      updateData.plan_status = "not_plan"
    } else {
      // Cliente com plano: calcular datas automaticamente
      updateData.planId = planId
      
      // Determinar data de início
      const startDate = planStartDate ? new Date(planStartDate) : new Date()
      updateData.planStartDate = startDate
      
      // Calcular data de fim: sempre 30 dias (1 mês)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 30)
      updateData.planEndDate = endDate
      
      // Se não especificado, manter o status atual ou definir como "pending"
      if (body.plan_status) {
        updateData.plan_status = body.plan_status
      } else {
        updateData.plan_status = "pending" // Novo plano sempre começa como "pending"
      }
    }

    const client = await prisma.client.update({
      where: { id: id },
      data: updateData,
      include: {
        plan: true,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

// DELETE /api/clients/[id] - Deletar cliente
export async function DELETE(request: NextRequest, context : RouteContext): Promise<NextResponse> {
  const routeParams = await context.params;
  const  id  = routeParams.id 
  try {
    await prisma.client.update({
      where: { id: id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: "Client deactivated successfully" })
  } catch (error) {
    console.error("Error deactivating client:", error)
    return NextResponse.json({ error: "Failed to deactivate client" }, { status: 500 })
  }
}
