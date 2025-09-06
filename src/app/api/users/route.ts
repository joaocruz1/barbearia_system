import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

// GET /api/users - Listar todos os usuários (apenas admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminBarberId = searchParams.get("adminBarberId")

    if (!adminBarberId) {
      return NextResponse.json(
        { error: "ID do administrador é obrigatório" },
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
        { error: "Acesso negado. Apenas administradores podem acessar esta funcionalidade." },
        { status: 403 }
      )
    }

    // Buscar todos os barbeiros (sem a senha)
    const barbers = await prisma.barber.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(barbers)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// POST /api/users - Criar novo usuário (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const { adminBarberId, name, email, phone, password, role } = await request.json()

    // Validar campos obrigatórios
    if (!adminBarberId || !name || !password) {
      return NextResponse.json(
        { error: "ID do admin, nome e senha são obrigatórios" },
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
        { error: "Acesso negado. Apenas administradores podem criar usuários." },
        { status: 403 }
      )
    }

    // Validar role
    if (role && !["admin", "funcionario"].includes(role)) {
      return NextResponse.json(
        { error: "Role deve ser 'admin' ou 'funcionario'" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    if (email) {
      const existingBarber = await prisma.barber.findFirst({
        where: { email },
      })

      if (existingBarber) {
        return NextResponse.json(
          { error: "Email já está em uso" },
          { status: 400 }
        )
      }
    }

    // Gerar hash da senha
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Criar novo barbeiro
    const newBarber = await prisma.barber.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || "funcionario",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(newBarber, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
