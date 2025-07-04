import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/barbers - Listar todos os barbeiros
export async function GET() {
  try {
    console.log("Fetching barbers...")

    const barbers = await prisma.barber.findMany({
      orderBy: { name: "asc" },
      include: {
        schedules: {
          include: {
            location: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    })


    return NextResponse.json(barbers)
  } catch (error) {
    console.error("Error fetching barbers:", error)
    return NextResponse.json({ error: "Failed to fetch barbers" }, { status: 500 })
  }
}

// POST /api/barbers - Criar novo barbeiro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const barber = await prisma.barber.create({
      data: {
        name,
        phone,
        email,
      },
    })

    return NextResponse.json(barber, { status: 201 })
  } catch (error) {
    console.error("Error creating barber:", error)
    return NextResponse.json({ error: "Failed to create barber" }, { status: 500 })
  }
}
