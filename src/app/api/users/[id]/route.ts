import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

// PUT /api/users/[id] - Atualizar usuário (apenas admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminBarberId, name, email, phone, role, isActive } = await request.json()
    const barberId = params.id

    // Validar campos obrigatórios
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
        { error: "Acesso negado. Apenas administradores podem atualizar usuários." },
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

    // Validar role
    if (role && !["admin", "funcionario"].includes(role)) {
      return NextResponse.json(
        { error: "Role deve ser 'admin' ou 'funcionario'" },
        { status: 400 }
      )
    }

    // Verificar se o email já existe (se estiver sendo alterado)
    if (email && email !== existingBarber.email) {
      const emailExists = await prisma.barber.findFirst({
        where: { email, id: { not: barberId } },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "Email já está em uso" },
          { status: 400 }
        )
      }
    }

    // Atualizar barbeiro
    const updatedBarber = await prisma.barber.update({
      where: { id: barberId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
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

    return NextResponse.json(updatedBarber)
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Desativar usuário (apenas admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const adminBarberId = searchParams.get("adminBarberId")
    const barberId = params.id

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
        { error: "Acesso negado. Apenas administradores podem desativar usuários." },
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

    // Não permitir desativar a si mesmo
    if (barberId === adminBarberId) {
      return NextResponse.json(
        { error: "Não é possível desativar sua própria conta" },
        { status: 400 }
      )
    }

    // Desativar barbeiro (soft delete)
    await prisma.barber.update({
      where: { id: barberId },
      data: { isActive: false },
    })

    return NextResponse.json({ message: "Usuário desativado com sucesso" })
  } catch (error) {
    console.error("Erro ao desativar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
