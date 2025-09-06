import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const { barberId, currentPassword, newPassword } = await request.json()

    // Validar campos obrigatórios
    if (!barberId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Validar tamanho da nova senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Buscar o barbeiro no banco de dados
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        password: true,
      },
    })

    if (!barber) {
      return NextResponse.json(
        { error: "Barbeiro não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o barbeiro tem senha definida
    if (!barber.password) {
      return NextResponse.json(
        { error: "Senha não configurada para este barbeiro" },
        { status: 401 }
      )
    }

    // Verificar a senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, barber.password)

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 401 }
      )
    }

    // Gerar hash da nova senha
    const saltRounds = 10
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Atualizar a senha no banco de dados
    await prisma.barber.update({
      where: { id: barberId },
      data: { password: newPasswordHash },
    })

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso",
    })

  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
