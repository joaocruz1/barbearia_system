import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT /api/services/[id] - Atualizar serviço
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, price, durationMinutes, isActive } = body

    if (!name || price === undefined || !durationMinutes) {
      return NextResponse.json(
        { error: "Name, price, and duration are required" },
        { status: 400 }
      )
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        price,
        durationMinutes,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id] - Deletar serviço
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log(`Tentando deletar serviço com ID: ${id}`)
    
    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    })

    if (!service) {
      console.log(`Serviço não encontrado: ${id}`)
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      )
    }

    console.log(`Serviço encontrado: ${service.name}, Agendamentos: ${service._count.appointments}`)

    // Verificar se o serviço está sendo usado em agendamentos
    if (service._count.appointments > 0) {
      console.log(`Não é possível deletar serviço com ${service._count.appointments} agendamentos`)
      return NextResponse.json(
        { 
          error: `Não é possível excluir o serviço "${service.name}" pois ele possui ${service._count.appointments} agendamento(s) associado(s). Remova os agendamentos primeiro ou desative o serviço.`,
          appointmentsCount: service._count.appointments,
          serviceName: service.name
        },
        { status: 400 }
      )
    }

    // Deletar o serviço
    await prisma.service.delete({
      where: { id },
    })

    console.log(`Serviço deletado com sucesso: ${id}`)
    return NextResponse.json({ 
      message: `Serviço "${service.name}" excluído com sucesso!`,
      deletedService: service.name
    })
  } catch (error) {
    console.error("Erro ao deletar serviço:", error)
    return NextResponse.json(
      { error: "Falha ao excluir serviço. Tente novamente." },
      { status: 500 }
    )
  }
}
