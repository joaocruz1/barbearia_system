import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params

    // Buscar o cliente
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { plan: true },
    })

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    if (!client.plan || client.plan.name === "Avulso") {
      return NextResponse.json({ error: "Cliente não possui plano ativo" }, { status: 400 })
    }

    // Atualizar o status para "paid"
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: { plan_status: "paid" },
      include: { plan: true },
    })

    return NextResponse.json({
      message: "Plano marcado como pago com sucesso",
      data: updatedClient,
    })
  } catch (error) {
    console.error("Error marking plan as paid:", error)
    return NextResponse.json({ error: "Falha ao marcar plano como pago" }, { status: 500 })
  }
}
