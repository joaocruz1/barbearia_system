import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/clients - Listar todos os clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const planId = searchParams.get("planId")

    const where: any = { isActive: true }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (planId) {
      where.planId = planId
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        plan: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

// POST /api/clients - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, planId, planStartDate, planEndDate } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    // Verificar se o telefone já existe
    const existingClient = await prisma.client.findUnique({
      where: { phone },
    })

    if (existingClient) {
      return NextResponse.json({ error: "Phone number already exists" }, { status: 400 })
    }

    // Determinar se o cliente será "Avulso" (sem plano)
    const isAvulso = !planId || planId === "none" || planId === null

    let finalStartDate = null
    let finalEndDate = null

    if (!isAvulso) {
      // Se não é Avulso, calcular datas
      finalStartDate = planStartDate ? new Date(planStartDate) : new Date()
      
      // Calcular data de fim: sempre 30 dias (1 mês)
      finalEndDate = new Date(finalStartDate)
      finalEndDate.setDate(finalEndDate.getDate() + 30)
    }

    const client = await prisma.client.create({
      data: {
        name,
        phone,
        email,
        planId: isAvulso ? null : planId,
        planStartDate: finalStartDate,
        planEndDate: finalEndDate,
        plan_status: isAvulso ? "not_plan" : "pending", // Novo cliente com plano começa como "pending"
      },
      include: {
        plan: true,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
