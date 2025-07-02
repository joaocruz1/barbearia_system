import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type RouteContext = { 
  params: Promise<{id : string}>
}


export async function GET(request: NextRequest, context : RouteContext): Promise<NextResponse> {
  const routeParams = await context.params;
  const  id  = routeParams.id

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: id },
      include: {
        client: {
          include: {
            plan: true,
          },
        },
        barber: true,
        location: true,
        service: true,
        planUsage: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 })
  }
}

// PUT /api/appointments/[id] - Atualizar agendamento
export async function PUT(request: NextRequest, context : RouteContext): Promise<NextResponse>{
  const routeParams = await context.params;
  const  id  = routeParams.id
  try {
    const body = await request.json()
    const { appointmentDate, startTime, endTime, status, paymentMethod, paymentStatus, notes } = body

    const appointment = await prisma.appointment.update({
      where: {id : id},
      data: {
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        startTime,
        endTime,
        status,
        paymentMethod,
        paymentStatus,
        notes,
      },
      include: {
        client: {
          include: {
            plan: true,
          },
        },
        barber: true,
        location: true,
        service: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 })
  }
}

// DELETE /api/appointments/[id] - Cancelar agendamento
export async function DELETE(request: NextRequest, context : RouteContext) : Promise<NextResponse> {
  const routeParams = await context.params;
  const  id  = routeParams.id 

  try {
    const appointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: "cancelled",
        paymentStatus: "cancelled",
      },
    })

    return NextResponse.json({ message: "Appointment cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 })
  }
}
