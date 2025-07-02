import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/services - Listar todos os serviços
export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

// POST /api/services - Criar novo serviço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, durationMinutes, isActive } = body

    if (!name || price === undefined || !durationMinutes) {
      return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        name,
        price,
        durationMinutes,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}
