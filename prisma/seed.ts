import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Criar localidades
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { name: "Rua 13" },
      update: {},
      create: {
        name: "Rua 13",
        address: "Rua 13, Centro",
      },
    }),
    prisma.location.upsert({
      where: { name: "Avenida" },
      update: {},
      create: {
        name: "Avenida",
        address: "Avenida Principal, Centro",
      },
    }),
    prisma.location.upsert({
      where: { name: "Inconfidentes" },
      update: {},
      create: {
        name: "Inconfidentes",
        address: "Bairro Inconfidentes",
      },
    }),
    prisma.location.upsert({
      where: { name: "Ouro Fino" },
      update: {},
      create: {
        name: "Ouro Fino",
        address: "Ouro Fino, MG",
      },
    }),
  ])

  // Criar planos
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: "Barbearia Premium" },
      update: {},
      create: {
        name: "Barbearia Premium",
        price: 125.9,
        description: "Plano completo com corte e barba ilimitados",
        benefits: {
          corte_ilimitado: true,
          barba_ilimitada: true,
          desconto_produtos: true,
          sorteio_brindes: true,
          desconto_outros_servicos: true,
        },
      },
    }),
    prisma.plan.upsert({
      where: { name: "Cabelo VIP" },
      update: {},
      create: {
        name: "Cabelo VIP",
        price: 69.9,
        description: "Corte de cabelo ilimitado",
        benefits: {
          corte_ilimitado: true,
          desconto_produtos: true,
          sorteio_brindes: true,
          desconto_outros_servicos: true,
        },
      },
    }),
    prisma.plan.upsert({
      where: { name: "Barba VIP" },
      update: {},
      create: {
        name: "Barba VIP",
        price: 69.9,
        description: "Barba ilimitada",
        benefits: {
          barba_ilimitada: true,
          desconto_produtos: true,
          sorteio_brindes: true,
          desconto_outros_servicos: true,
        },
      },
    }),
    prisma.plan.upsert({
      where: { name: "Avulso" },
      update: {},
      create: {
        name: "Avulso",
        price: 0.0,
        description: "Serviços pagos individualmente",
        benefits: {},
      },
    }),
  ])

  // Criar serviços
  const services = await Promise.all([
    prisma.service.upsert({
      where: { name: "Corte de Cabelo" },
      update: {},
      create: {
        name: "Corte de Cabelo",
        price: 25.0,
        durationMinutes: 30,
      },
    }),
    prisma.service.upsert({
      where: { name: "Barba" },
      update: {},
      create: {
        name: "Barba",
        price: 20.0,
        durationMinutes: 20,
      },
    }),
    prisma.service.upsert({
      where: { name: "Corte + Barba" },
      update: {},
      create: {
        name: "Corte + Barba",
        price: 40.0,
        durationMinutes: 45,
      },
    }),
    prisma.service.upsert({
      where: { name: "Manicure" },
      update: {},
      create: {
        name: "Manicure",
        price: 15.0,
        durationMinutes: 30,
      },
    }),
    prisma.service.upsert({
      where: { name: "Pedicure" },
      update: {},
      create: {
        name: "Pedicure",
        price: 20.0,
        durationMinutes: 40,
      },
    }),
  ])

  // Criar barbeiros
  const barbers = await Promise.all([
    prisma.barber.upsert({
      where: { name: "Bruno Souza" },
      update: {},
      create: {
        name: "Bruno Souza",
        phone: "(35) 99999-0001",
        email: "bruno@barbearia.com",
      },
    }),
    prisma.barber.upsert({
      where: { name: "Erick" },
      update: {},
      create: {
        name: "Erick",
        phone: "(35) 99999-0002",
        email: "erick@barbearia.com",
      },
    }),
    prisma.barber.upsert({
      where: { name: "Ryan" },
      update: {},
      create: {
        name: "Ryan",
        phone: "(35) 99999-0003",
        email: "ryan@barbearia.com",
      },
    }),
    prisma.barber.upsert({
      where: { name: "Carlos" },
      update: {},
      create: {
        name: "Carlos",
        phone: "(35) 99999-0004",
        email: "carlos@barbearia.com",
      },
    }),
    prisma.barber.upsert({
      where: { name: "Julio" },
      update: {},
      create: {
        name: "Julio",
        phone: "(35) 99999-0005",
        email: "julio@barbearia.com",
      },
    }),
    prisma.barber.upsert({
      where: { name: "Faguinho" },
      update: {},
      create: {
        name: "Faguinho",
        phone: "(35) 99999-0006",
        email: "faguinho@barbearia.com",
      },
    }),
    prisma.barber.upsert({
      where: { name: "Joilton" },
      update: {},
      create: {
        name: "Joilton",
        phone: "(35) 99999-0007",
        email: "joilton@barbearia.com",
      },
    }),
  ])

  console.log("✅ Database seeded successfully!")
  console.log(`📍 Created ${locations.length} locations`)
  console.log(`📋 Created ${plans.length} plans`)
  console.log(`🛠️ Created ${services.length} services`)
  console.log(`👨‍💼 Created ${barbers.length} barbers`)
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
