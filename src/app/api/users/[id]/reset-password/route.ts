import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

// POST /api/users/[id]/reset-password - Resetar senha (apenas admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminBarberId, newPassword } = await request.json()
    const barberId = params.id

    // Validar campos obrigatórios
    if (!adminBarberId || !newPassword) {
      return NextResponse.json(
        { error: "ID do administrador e nova senha são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar tamanho da senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Verificar se o usuário é admin
    const adminBarber = await prisma.barber.findUnique({
      where: { id: adminBarberId },
      select: { role: true },
    })

    if (!adminBarber || adminBarber.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem resetar senhas." },
        { status: 403 }
      )
    }

    // Verificar se o barbeiro existe
    const existingBarber = await prisma.barber.findUnique({
      where: { id: barberId },
    })

    if (!existingBarber) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Gerar hash da nova senha
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Atualizar a senha
    await prisma.barber.update({
      where: { id: barberId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ 
      message: "Senha resetada com sucesso",
      newPassword: newPassword // Retornar a senha em texto para o admin informar ao usuário
    })
  } catch (error) {
    console.error("Erro ao resetar senha:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
