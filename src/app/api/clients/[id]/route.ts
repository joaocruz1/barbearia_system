import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/clients/[id] - Buscar cliente por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, phone, email, planId, planStartDate, planEndDate, isActive } = body

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        email,
        planId,
        planStartDate: planStartDate ? new Date(planStartDate) : null,
        planEndDate: planEndDate ? new Date(planEndDate) : null,
        isActive,
      },
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
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.client.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: "Client deactivated successfully" })
  } catch (error) {
    console.error("Error deactivating client:", error)
    return NextResponse.json({ error: "Failed to deactivate client" }, { status: 500 })
  }
}
