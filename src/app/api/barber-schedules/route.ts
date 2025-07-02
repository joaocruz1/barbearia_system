import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/barber-schedules - Listar horários dos barbeiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barberId = searchParams.get("barberId")
    const locationId = searchParams.get("locationId")

    const where: any = {}
    if (barberId) where.barberId = barberId
    if (locationId) where.locationId = locationId

    const schedules = await prisma.barberSchedule.findMany({
      where,
      include: {
        barber: true,
        location: true,
      },
      orderBy: [{ barber: { name: "asc" } }, { weekDay: "asc" }, { startTime: "asc" }],
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Error fetching barber schedules:", error)
    return NextResponse.json({ error: "Failed to fetch barber schedules" }, { status: 500 })
  }
}

// POST /api/barber-schedules - Criar novo horário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barberId, locationId, weekDay, startTime, endTime, isActive } = body

    if (!barberId || !locationId || weekDay === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const schedule = await prisma.barberSchedule.create({
      data: {
        barberId,
        locationId,
        weekDay,
        startTime,
        endTime,
        isActive: isActive ?? true,
      },
      include: {
        barber: true,
        location: true,
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error("Error creating barber schedule:", error)
    return NextResponse.json({ error: "Failed to create barber schedule" }, { status: 500 })
  }
}
