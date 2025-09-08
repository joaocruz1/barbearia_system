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
      include: {
        plan: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    if (!client.plan || client.plan.name === "Avulso") {
      return NextResponse.json({ error: "Cliente não possui plano ativo" }, { status: 400 })
    }

    // Verificar se o cliente está realmente pendente de pagamento usando plan_status
    if (client.plan_status !== "pending") {
      return NextResponse.json({ 
        error: `Cliente não está pendente de pagamento. Status atual: ${client.plan_status}` 
      }, { status: 400 })
    }

    // Aqui você pode integrar com um gateway de pagamento real
    // Por exemplo: Stripe, PagSeguro, Mercado Pago, etc.
    
    // Por enquanto, vamos simular a geração de um link
    const paymentData = {
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      planName: client.plan.name,
      planPrice: Number(client.plan.price),
      planEndDate: client.planEndDate,
      paymentLink: `https://pagamento.barbearia.com/pay/${client.id}?amount=${Number(client.plan.price)}&plan=${client.plan.name}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    }

    // Aqui você pode salvar o link de pagamento no banco de dados se necessário
    // await prisma.paymentLink.create({ ... })

    // Simular envio de notificação (SMS, email, WhatsApp, etc.)
    console.log(`Link de pagamento gerado para ${client.name}:`, paymentData.paymentLink)

    return NextResponse.json({
      success: true,
      message: "Link de pagamento gerado com sucesso",
      data: {
        paymentLink: paymentData.paymentLink,
        expiresAt: paymentData.expiresAt,
        amount: paymentData.planPrice,
        planName: paymentData.planName,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar link de pagamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
