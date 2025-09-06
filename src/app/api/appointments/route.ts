import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/appointments - Listar agendamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const barberId = searchParams.get("barberId")
    const locationId = searchParams.get("locationId")
    const status = searchParams.get("status")

    const where: any = {}

    if (date) {
      where.appointmentDate = new Date(date)
    } else if (startDate && endDate) {
      where.appointmentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    if (barberId) {
      where.barberId = barberId
    }

    if (locationId) {
      where.locationId = locationId
    }

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    })

    console.log("Agendamentos encontrados:", appointments.length)
    console.log("Primeiro agendamento:", appointments[0])

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

// POST /api/appointments - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      barberId,
      locationId,
      serviceId,
      appointmentDate,
      startTime,
      endTime,
      paymentMethod,
      paymentStatus,
      status,
      notes,
    } = body

    if (!clientId || !barberId || !locationId || !serviceId || !appointmentDate || !startTime || !endTime) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    // Verificar se o horário está disponível
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        appointmentDate: new Date(appointmentDate),
        status: { not: "cancelled" },
        OR: [
          {
            AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
          },
          {
            AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
          },
        ],
      },
    })

    if (conflictingAppointment) {
      return NextResponse.json({ error: "Time slot is already booked" }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        barberId,
        locationId,
        serviceId,
        appointmentDate: new Date(appointmentDate),
        startTime,
        endTime,
        paymentMethod,
        paymentStatus: paymentStatus || "pending",
        status: status || "confirmed",
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

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}
