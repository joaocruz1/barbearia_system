import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = { 
  params: Promise<{id : string}>
}

// GET /api/barbers/[id] - Buscar barbeiro por ID
export async function GET(request: NextRequest, constext : RouteContext): Promise<NextResponse> {
  const params = await constext.params;
  const id = params.id
  try {
    const barber = await prisma.barber.findUnique({
      where: { id: id },
      include: {
        schedules: {
          include: {
            location: true,
          },
        },
        appointments: {
          include: {
            client: true,
            service: true,
            location: true,
          },
          orderBy: {
            appointmentDate: "desc",
          },
        },
      },
    })

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    return NextResponse.json(barber)
  } catch (error) {
    console.error("Error fetching barber:", error)
    return NextResponse.json({ error: "Failed to fetch barber" }, { status: 500 })
  }
}

// PUT /api/barbers/[id] - Atualizar barbeiro
export async function PUT(request: NextRequest, context : RouteContext): Promise<NextResponse>  {
  const params = await context.params;
  const id = params.id
  try {
    const body = await request.json()
    const { name, phone, email } = body

    const barber = await prisma.barber.update({
      where: { id: id },
      data: {
        name,
        phone,
        email,
      },
    })

    return NextResponse.json(barber)
  } catch (error) {
    console.error("Error updating barber:", error)
    return NextResponse.json({ error: "Failed to update barber" }, { status: 500 })
  }
}

// DELETE /api/barbers/[id] - Deletar barbeiro
export async function DELETE(request: NextRequest, context : RouteContext): Promise<NextResponse> {
  const params = await context.params;
  const id = params.id
  try {
    await prisma.barber.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: "Barber deleted successfully" })
  } catch (error) {
    console.error("Error deleting barber:", error)
    return NextResponse.json({ error: "Failed to delete barber" }, { status: 500 })
  }
}
