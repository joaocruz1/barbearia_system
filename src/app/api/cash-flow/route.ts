import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/cash-flow - Obter dados de caixa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const locationId = searchParams.get("locationId");
    const barberId = searchParams.get("barberId");

    // Definir período padrão (últimos 30 dias se não especificado)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const start = startDate 
      ? new Date(startDate) 
      : defaultStartDate;
    const end = endDate 
      ? new Date(endDate) 
      : defaultEndDate;

    // Construir filtros
    const where: any = {
      appointmentDate: {
        gte: start,
        lte: end,
      },
    };

    if (locationId) {
      where.locationId = locationId;
    }

    if (barberId) {
      where.barberId = barberId;
    }

    // Buscar agendamentos com dados relacionados
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: {
          include: {
            plan: true,
          },
        },
        barber: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: [{ appointmentDate: "desc" }, { startTime: "desc" }],
    });


    // Calcular estatísticas financeiras
    const stats = {
      totalRevenue: 0,
      pendingRevenue: 0,
      paidRevenue: 0,
      cancelledRevenue: 0,
      totalAppointments: appointments.length,
      completedAppointments: 0,
      pendingAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      paymentMethods: {
        pix: 0,
        dinheiro: 0,
        cartao: 0,
        plano: 0,
      },
      dailyRevenue: [] as Array<{
        date: string;
        revenue: number;
        appointments: number;
      }>,
      barberStats: [] as Array<{
        barberId: string;
        barberName: string;
        revenue: number;
        appointments: number;
      }>,
      serviceStats: [] as Array<{
        serviceId: string;
        serviceName: string;
        revenue: number;
        appointments: number;
      }>,
    };

    // Processar cada agendamento
    const dailyMap = new Map<string, { revenue: number; appointments: number }>();
    const barberMap = new Map<string, { name: string; revenue: number; appointments: number }>();
    const serviceMap = new Map<string, { name: string; revenue: number; appointments: number }>();


    appointments.forEach((appointment) => {
      const servicePrice = Number(appointment.service.price);
      const dateKey = appointment.appointmentDate.toISOString().split('T')[0];

      // Contar por status
      switch (appointment.status) {
        case 'completed':
          stats.completedAppointments++;
          if (appointment.paymentStatus === 'paid') {
            stats.paidRevenue += servicePrice;
            stats.totalRevenue += servicePrice;
          } else if (appointment.paymentStatus === 'pending') {
            stats.pendingRevenue += servicePrice;
          }
          break;
        case 'scheduled':
          stats.pendingAppointments++;
          stats.pendingRevenue += servicePrice;
          break;
        case 'cancelled':
          stats.cancelledAppointments++;
          stats.cancelledRevenue += servicePrice;
          break;
        case 'no_show':
          stats.noShowAppointments++;
          break;
      }

      // Contar por método de pagamento
      if (appointment.paymentMethod) {
        switch (appointment.paymentMethod.toLowerCase()) {
          case 'pix':
            stats.paymentMethods.pix += servicePrice;
            break;
          case 'dinheiro':
            stats.paymentMethods.dinheiro += servicePrice;
            break;
          case 'cartão':
          case 'cartao':
            stats.paymentMethods.cartao += servicePrice;
            break;
          case 'plano':
            stats.paymentMethods.plano += servicePrice;
            break;
        }
      }

      // Agrupar por dia
      if (dailyMap.has(dateKey)) {
        const dayData = dailyMap.get(dateKey)!;
        dayData.appointments++;
        if (appointment.status === 'completed' && appointment.paymentStatus === 'paid') {
          dayData.revenue += servicePrice;
        }
      } else {
        dailyMap.set(dateKey, {
          appointments: 1,
          revenue: appointment.status === 'completed' && appointment.paymentStatus === 'paid' ? servicePrice : 0,
        });
      }

      // Agrupar por barbeiro
      if (barberMap.has(appointment.barberId)) {
        const barberData = barberMap.get(appointment.barberId)!;
        barberData.appointments++;
        // Incluir receita para agendamentos concluídos (independente do status de pagamento)
        if (appointment.status === 'completed') {
          barberData.revenue += servicePrice;
        }
      } else {
        barberMap.set(appointment.barberId, {
          name: appointment.barber.name,
          appointments: 1,
          revenue: appointment.status === 'completed' ? servicePrice : 0,
        });
      }

      // Agrupar por serviço
      if (serviceMap.has(appointment.serviceId)) {
        const serviceData = serviceMap.get(appointment.serviceId)!;
        serviceData.appointments++;
        // Incluir receita para agendamentos concluídos (independente do status de pagamento)
        if (appointment.status === 'completed') {
          serviceData.revenue += servicePrice;
        }
      } else {
        serviceMap.set(appointment.serviceId, {
          name: appointment.service.name,
          appointments: 1,
          revenue: appointment.status === 'completed' ? servicePrice : 0,
        });
      }
    });

    // Converter maps para arrays
    stats.dailyRevenue = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    stats.barberStats = Array.from(barberMap.entries())
      .map(([barberId, data]) => ({ barberId, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    stats.serviceStats = Array.from(serviceMap.entries())
      .map(([serviceId, data]) => ({ serviceId, ...data }))
      .sort((a, b) => b.revenue - a.revenue);


    return NextResponse.json({
      stats,
      appointments: appointments.map(appointment => ({
        id: appointment.id,
        clientName: appointment.client.name,
        barberName: appointment.barber.name,
        serviceName: appointment.service.name,
        servicePrice: Number(appointment.service.price),
        appointmentDate: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        paymentMethod: appointment.paymentMethod,
        paymentStatus: appointment.paymentStatus,
        locationName: appointment.location.name,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching cash flow data:", error);
    return NextResponse.json(
      { error: "Failed to fetch cash flow data" },
      { status: 500 }
    );
  }
}
