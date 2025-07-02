import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/plans - Listar todos os planos
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "desc" },
      include: {
        _count: {
          select: {
            clients: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}

// POST /api/plans - Criar novo plano
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description, benefits, isActive } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 })
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        price,
        description,
        benefits,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 })
  }
}
