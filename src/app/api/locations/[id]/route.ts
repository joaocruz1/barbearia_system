import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/locations/[id] - Buscar localidade por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        barberSchedules: {
          include: {
            barber: true,
          },
        },
        appointments: {
          include: {
            client: true,
            barber: true,
            service: true,
          },
        },
      },
    })

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error fetching location:", error)
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 })
  }
}

// PUT /api/locations/[id] - Atualizar localidade
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, address } = body

    const location = await prisma.location.update({
      where: { id: params.id },
      data: {
        name,
        address,
      },
    })

    return NextResponse.json(location)
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

// DELETE /api/locations/[id] - Deletar localidade
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.location.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Location deleted successfully" })
  } catch (error) {
    console.error("Error deleting location:", error)
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}
