import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const { barberId, password, locationId } = await request.json()
    
    console.log("API Login - Dados recebidos:", { barberId, password: "***", locationId })

    // Validar campos obrigatórios
    if (!barberId || !password || !locationId) {
      console.log("API Login - Campos obrigatórios faltando")
      return NextResponse.json(
        { error: "Barbeiro, senha e localidade são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar o barbeiro no banco de dados
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        name: true,
        password: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    })

    if (!barber) {
      return NextResponse.json(
        { error: "Barbeiro não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o barbeiro está ativo
    if (!barber.isActive) {
      return NextResponse.json(
        { error: "Conta desativada. Entre em contato com o administrador." },
        { status: 401 }
      )
    }

    // Verificar se o barbeiro tem senha definida
    if (!barber.password) {
      return NextResponse.json(
        { error: "Senha não configurada para este barbeiro" },
        { status: 401 }
      )
    }

    // Verificar a senha usando bcrypt
    console.log("API Login - Verificando senha...")
    const isPasswordValid = await bcrypt.compare(password, barber.password)
    console.log("API Login - Senha válida:", isPasswordValid)

    if (!isPasswordValid) {
      console.log("API Login - Senha incorreta")
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      )
    }

    // Verificar se a localidade existe
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    })

    if (!location) {
      return NextResponse.json(
        { error: "Localidade não encontrada" },
        { status: 404 }
      )
    }

    // Login bem-sucedido - retornar dados do barbeiro (sem a senha)
    const { password: _, ...barberWithoutPassword } = barber
    
    console.log("API Login - Login bem-sucedido, retornando dados:", {
      success: true,
      barber: barberWithoutPassword,
      location: { id: location.id, name: location.name }
    })

    return NextResponse.json({
      success: true,
      barber: barberWithoutPassword,
      location: {
        id: location.id,
        name: location.name,
      },
    })

  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
