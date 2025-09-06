import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar localizações
  const location1 = await prisma.location.create({
    data: {
      id: "8cecb648-ad70-433a-9841-1717e2b0fac1",
      name: 'Rua 13 - Ouro Fino',
      address: 'Rua 13, Ouro Fino - MG',
    },
  })

  const location2 = await prisma.location.create({
    data: {
      id: "bf844af4-e283-4600-8241-29a5fead8f18",
      name: 'Avenida - Ouro Fino',
      address: 'Avenida Principal, Ouro Fino - MG',
    },
  })

  const location3 = await prisma.location.create({
    data: {
      id: "df88109a-0005-41f0-a7cc-feb19540d280",
      name: 'Inconfidentes',
      address: 'Inconfidentes - MG',
    },
  })

  // Criar barbeiros com IDs específicos que correspondem ao frontend
  const barber1 = await prisma.barber.create({
    data: {
      id: "25aad185-561b-4ec0-a570-a6d35d513868",
      name: 'Bruno Souza',
      phone: '(35) 99999-0001',
      email: 'bruno@barbearia.com',
      password: '$2b$10$s/ex.DjXsJF.8KJIKaD6Xe1ctZq7Z', // senha: 123456
      role: 'funcionario',
      isActive: true,
    },
  })

  const barber2 = await prisma.barber.create({
    data: {
      id: "f9d29449-bec9-4499-83e8-3ce8b1f4078d",
      name: 'Erick',
      phone: '(35) 99999-0006',
      email: 'erick@barbearia.com',
      password: '$2b$10$s/ex.DjXsJF.8KJIKaD6Xe1ctZq7Z', // senha: 123456
      role: 'funcionario',
      isActive: true,
    },
  })

  const barber3 = await prisma.barber.create({
    data: {
      id: "e4541de6-7803-4474-9ed1-1ce6efbf591d",
      name: 'Ryan',
      phone: '(35) 99999-0007',
      email: 'ryan@barbearia.com',
      password: '$2b$10$s/ex.DjXsJF.8KJIKaD6Xe1ctZq7Z', // senha: 123456
      role: 'funcionario',
      isActive: true,
    },
  })

  const barber4 = await prisma.barber.create({
    data: {
      id: "524995f1-9827-4fba-804f-e965c8425bc2",
      name: 'Carlos',
      phone: '(35) 99999-0004',
      email: 'carlos@barbearia.com',
      password: '$2b$10$qud9OhrLj8zz20NZwTZJPOc3Q', // senha: 123456
      role: 'funcionario',
      isActive: true,
    },
  })

  const barber5 = await prisma.barber.create({
    data: {
      id: "b6640820-5082-4a35-bf03-c9bb70ca280d",
      name: 'Julio',
      phone: '(35) 99999-0005',
      email: 'julio@barbearia.com',
      password: '$2b$10$n46ELpi8WcGk811CZbeZxu75pX', // senha: 123456
      role: 'funcionario',
      isActive: true,
    },
  })

  const barber6 = await prisma.barber.create({
    data: {
      id: "4684fd88-1307-45a1-918c-cf74879d90c9",
      name: 'Faguinho',
      phone: '(35) 99999-0003',
      email: 'faguinho@barbearia.com',
      password: '$2b$10$fqzrU7YrNOrGyTIJC4mH8.ykmV', // senha: 123456
      role: 'admin',
      isActive: true,
    },
  })

  const barber7 = await prisma.barber.create({
    data: {
      id: "400ab9f7-9cf1-48be-90e5-282cdcd7f874",
      name: 'Joilton',
      phone: '(35) 99999-0002',
      email: 'joilton@barbearia.com',
      password: '$2b$10$CK5YWCFSMxJX0yirJXppgeprki', // senha: 123456
      role: 'funcionario',
      isActive: true,
    },
  })

  // Criar planos
  const plan1 = await prisma.plan.create({
    data: {
      name: 'Barbearia Premium',
      price: 99.90,
      description: 'Plano completo com corte e barba',
      benefits: ['Corte mensal', 'Barba mensal', 'Desconto em produtos'],
    },
  })

  const plan2 = await prisma.plan.create({
    data: {
      name: 'Cabelo VIP',
      price: 59.90,
      description: 'Plano focado em cabelo',
      benefits: ['Corte mensal', 'Tratamentos especiais'],
    },
  })

  // Criar clientes
  const client1 = await prisma.client.create({
    data: {
      name: 'Matheus Machado',
      phone: '11777777777',
      email: 'matheus@email.com',
      planId: plan1.id,
      planStartDate: new Date('2024-01-01'),
      planEndDate: new Date('2024-12-31'),
    },
  })

  const client2 = await prisma.client.create({
    data: {
      name: 'Carlos Oliveira',
      phone: '11666666666',
      email: 'carlos@email.com',
    },
  })

  const client3 = await prisma.client.create({
    data: {
      name: 'Paciente para Treinamento',
      phone: '11555555555',
      email: 'treinamento@email.com',
    },
  })

  // Criar serviços
  const service1 = await prisma.service.create({
    data: {
      name: 'Corte Masculino',
      price: 35.00,
      durationMinutes: 30,
    },
  })

  const service2 = await prisma.service.create({
    data: {
      name: 'Barba',
      price: 25.00,
      durationMinutes: 20,
    },
  })

  const service3 = await prisma.service.create({
    data: {
      name: 'Corte + Barba',
      price: 50.00,
      durationMinutes: 45,
    },
  })

  const service4 = await prisma.service.create({
    data: {
      name: 'Avaliação',
      price: 0.00,
      durationMinutes: 15,
    },
  })

  const service5 = await prisma.service.create({
    data: {
      name: '001 - Procedimento',
      price: 80.00,
      durationMinutes: 60,
    },
  })

  const service6 = await prisma.service.create({
    data: {
      name: 'Teleorientação',
      price: 0.00,
      durationMinutes: 30,
    },
  })

  const service7 = await prisma.service.create({
    data: {
      name: 'SORO 1',
      price: 45.00,
      durationMinutes: 30,
    },
  })

  // Criar agendamentos de exemplo (baseados na imagem)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(today.getDate() + 2)
  const friday = new Date(today)
  friday.setDate(today.getDate() + 4)

  // Agendamentos para terça-feira (hoje)
  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      barberId: barber1.id,
      locationId: location1.id,
      serviceId: service7.id, // SORO 1
      appointmentDate: today,
      startTime: '09:30',
      endTime: '10:00',
      status: 'scheduled',
      paymentMethod: 'Pix',
      paymentStatus: 'paid',
    },
  })

  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      barberId: barber1.id,
      locationId: location1.id,
      serviceId: service4.id, // Avaliação
      appointmentDate: today,
      startTime: '14:00',
      endTime: '14:15',
      status: 'scheduled',
      paymentMethod: 'Plano',
      paymentStatus: 'paid',
    },
  })

  // Agendamentos para quarta-feira
  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      barberId: barber1.id,
      locationId: location1.id,
      serviceId: service5.id, // 001 - Procedimento
      appointmentDate: tomorrow,
      startTime: '08:00',
      endTime: '09:00',
      status: 'scheduled',
      paymentMethod: 'Cartão',
      paymentStatus: 'paid',
    },
  })

  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      barberId: barber1.id,
      locationId: location1.id,
      serviceId: service4.id, // Avaliação
      appointmentDate: tomorrow,
      startTime: '10:00',
      endTime: '10:15',
      status: 'scheduled',
      paymentMethod: 'Plano',
      paymentStatus: 'paid',
    },
  })

  await prisma.appointment.create({
    data: {
      clientId: client1.id,
      barberId: barber1.id,
      locationId: location1.id,
      serviceId: service6.id, // Teleorientação
      appointmentDate: tomorrow,
      startTime: '12:00',
      endTime: '12:30',
      status: 'scheduled',
      paymentMethod: 'Plano',
      paymentStatus: 'paid',
    },
  })

  // Agendamento para sexta-feira
  await prisma.appointment.create({
    data: {
      clientId: client3.id,
      barberId: barber2.id,
      locationId: location1.id,
      serviceId: service5.id, // 001 - Procedimento
      appointmentDate: friday,
      startTime: '11:15',
      endTime: '12:15',
      status: 'scheduled',
      paymentMethod: 'Dinheiro',
      paymentStatus: 'pending',
    },
  })

  console.log('Dados de exemplo criados com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


