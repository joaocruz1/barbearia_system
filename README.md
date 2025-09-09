# 🏪 Sistema de Gestão de Barbearia

Sistema completo para gestão de barbearia desenvolvido com Next.js 15, TypeScript, Prisma e PostgreSQL. Oferece funcionalidades completas para gerenciamento de clientes, agendamentos, barbeiros, serviços, planos e fluxo de caixa.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração e Instalação](#-configuração-e-instalação)
- [Banco de Dados](#-banco-de-dados)
- [API Endpoints](#-api-endpoints)
- [Autenticação](#-autenticação)
- [Deploy](#-deploy)
- [Contribuição](#-contribuição)

## 🎯 Visão Geral

O Sistema de Gestão de Barbearia é uma aplicação web moderna que permite:

- **Gestão de Clientes**: Cadastro, edição e controle de status de clientes
- **Sistema de Agendamentos**: Agendamento, cancelamento e controle de status
- **Gestão de Barbeiros**: Cadastro, horários de trabalho e autenticação
- **Serviços**: Definição de serviços, preços e duração
- **Planos de Assinatura**: Sistema de planos mensais para clientes VIP
- **Fluxo de Caixa**: Controle de receitas e despesas
- **Dashboard**: Visão geral com estatísticas e métricas
- **Multi-localização**: Suporte a múltiplas unidades da barbearia

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend (Next.js 15)"
        A[Páginas React] --> B[Componentes UI]
        B --> C[Hooks Customizados]
        C --> D[API Client]
    end
    
    subgraph "Backend (Next.js API Routes)"
        D --> E[API Routes]
        E --> F[Middleware de Autenticação]
        F --> G[Validação de Dados]
        G --> H[Prisma ORM]
    end
    
    subgraph "Banco de Dados"
        H --> I[(PostgreSQL)]
        I --> J[Tabelas Principais]
        J --> K[barbers]
        J --> L[clients]
        J --> M[appointments]
        J --> N[services]
        J --> O[plans]
        J --> P[locations]
    end
    
    subgraph "Autenticação"
        Q[Login Form] --> R[bcrypt Hash]
        R --> S[LocalStorage]
        S --> T[Session Management]
    end
    
    subgraph "UI/UX"
        U[Tailwind CSS] --> V[Radix UI Components]
        V --> W[Lucide Icons]
        W --> X[Responsive Design]
    end
    
    A --> Q
    E --> Q
    B --> U
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca de interface de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos

### Backend
- **Next.js API Routes** - API RESTful
- **Prisma** - ORM para banco de dados
- **bcrypt** - Hash de senhas
- **Node.js** - Runtime JavaScript

### Banco de Dados
- **PostgreSQL** - Banco de dados relacional
- **Prisma Migrations** - Controle de versão do schema

### Desenvolvimento
- **Turbopack** - Bundler rápido para desenvolvimento
- **ESLint** - Linter para qualidade de código
- **tsx** - Executor TypeScript

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Login seguro com hash bcrypt
- Controle de sessão via localStorage
- Diferentes níveis de acesso (admin/funcionário)
- Proteção de rotas sensíveis

### 👥 Gestão de Clientes
- Cadastro completo de clientes
- Sistema de planos de assinatura
- Controle de status de pagamento
- Histórico de agendamentos
- Busca e filtros avançados

### 📅 Sistema de Agendamentos
- Agendamento com validação de horários
- Controle de disponibilidade por barbeiro
- Status de agendamento (agendado, concluído, cancelado)
- Integração com planos de assinatura
- Notas e observações

### 💇‍♂️ Gestão de Barbeiros
- Cadastro de barbeiros
- Definição de horários de trabalho
- Controle de disponibilidade por localização
- Sistema de autenticação individual

### 🏢 Multi-localização
- Suporte a múltiplas unidades
- Horários específicos por localização
- Relatórios por unidade
- Gestão centralizada

### 💰 Fluxo de Caixa
- Controle de receitas e despesas
- Relatórios financeiros
- Integração com agendamentos
- Métricas de performance

### 📊 Dashboard
- Estatísticas em tempo real
- Métricas de ocupação
- Receita diária/mensal
- Clientes VIP ativos
- Gráficos e visualizações

## 📁 Estrutura do Projeto

```
barbearia_system/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Autenticação
│   │   │   ├── appointments/  # Agendamentos
│   │   │   ├── barbers/       # Barbeiros
│   │   │   ├── clients/       # Clientes
│   │   │   ├── services/      # Serviços
│   │   │   ├── plans/         # Planos
│   │   │   ├── locations/     # Localizações
│   │   │   └── dashboard/     # Dashboard
│   │   ├── appointments/      # Páginas de agendamentos
│   │   ├── clients/           # Páginas de clientes
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── services/          # Páginas de serviços
│   │   └── users/             # Gestão de usuários
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base (Radix UI)
│   │   ├── app-sidebar.tsx   # Sidebar principal
│   │   └── appointment-calendar.tsx
│   ├── hooks/                # Hooks customizados
│   │   ├── use-api.ts        # Hook para chamadas API
│   │   └── use-mobile.ts     # Hook para detecção mobile
│   ├── lib/                  # Utilitários
│   │   ├── api.ts            # Cliente API
│   │   ├── prisma.ts         # Configuração Prisma
│   │   └── utils.ts          # Funções utilitárias
│   └── types/                # Definições TypeScript
├── prisma/
│   ├── schema.prisma         # Schema do banco
│   ├── migrations/           # Migrações
│   └── seed.ts              # Dados iniciais
├── scripts/                  # Scripts de configuração
└── public/                   # Arquivos estáticos
```

## ⚙️ Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <repository-url>
cd barbearia_system
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/barbearia_db"

# Next.js
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Popular com dados iniciais
npm run db:seed
```

### 5. Execute o projeto
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🗄️ Banco de Dados

### Schema Principal

```mermaid
erDiagram
    BARBER ||--o{ BARBER_SCHEDULE : has
    BARBER ||--o{ APPOINTMENT : serves
    LOCATION ||--o{ BARBER_SCHEDULE : hosts
    LOCATION ||--o{ APPOINTMENT : located_at
    CLIENT ||--o{ APPOINTMENT : books
    CLIENT }o--|| PLAN : subscribes
    SERVICE ||--o{ APPOINTMENT : provided
    APPOINTMENT ||--o{ PLAN_USAGE : generates
    
    BARBER {
        string id PK
        string name
        string phone
        string email
        string password
        string role
        boolean isActive
        datetime createdAt
    }
    
    CLIENT {
        string id PK
        string name
        string phone UK
        string email
        string planId FK
        date planStartDate
        date planEndDate
        string plan_status
        boolean isActive
        datetime createdAt
    }
    
    APPOINTMENT {
        string id PK
        string clientId FK
        string barberId FK
        string locationId FK
        string serviceId FK
        date appointmentDate
        time startTime
        time endTime
        string status
        string paymentMethod
        string paymentStatus
        string notes
        datetime createdAt
    }
    
    SERVICE {
        string id PK
        string name
        decimal price
        int durationMinutes
        boolean isActive
        datetime createdAt
    }
    
    PLAN {
        string id PK
        string name
        decimal price
        string description
        json benefits
        boolean isActive
        datetime createdAt
    }
    
    LOCATION {
        string id PK
        string name
        string address
        datetime createdAt
    }
    
    BARBER_SCHEDULE {
        string id PK
        string barberId FK
        string locationId FK
        int weekDay
        time startTime
        time endTime
        boolean isActive
        datetime createdAt
    }
    
    PLAN_USAGE {
        string id PK
        string clientId FK
        string appointmentId FK
        string serviceType
        datetime usedAt
        string monthYear
    }
```

### Principais Relacionamentos

- **Barbeiros** podem ter múltiplos horários em diferentes localizações
- **Clientes** podem ter planos de assinatura com controle de uso
- **Agendamentos** conectam clientes, barbeiros, serviços e localizações
- **Planos** controlam o uso de serviços pelos clientes VIP

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de barbeiro
- `POST /api/auth/change-password` - Alterar senha
- `POST /api/auth/setup-password` - Configurar senha inicial

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients/[id]` - Buscar cliente
- `PUT /api/clients/[id]` - Atualizar cliente
- `DELETE /api/clients/[id]` - Deletar cliente
- `POST /api/clients/[id]/mark-paid` - Marcar como pago
- `GET /api/clients/[id]/payment-link` - Link de pagamento

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `GET /api/appointments/[id]` - Buscar agendamento
- `PUT /api/appointments/[id]` - Atualizar agendamento
- `DELETE /api/appointments/[id]` - Cancelar agendamento

### Barbeiros
- `GET /api/barbers` - Listar barbeiros
- `POST /api/barbers` - Criar barbeiro
- `GET /api/barbers/[id]` - Buscar barbeiro
- `PUT /api/barbers/[id]` - Atualizar barbeiro
- `DELETE /api/barbers/[id]` - Deletar barbeiro

### Serviços
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço
- `GET /api/services/[id]` - Buscar serviço
- `PUT /api/services/[id]` - Atualizar serviço
- `DELETE /api/services/[id]` - Deletar serviço

### Planos
- `GET /api/plans` - Listar planos
- `POST /api/plans` - Criar plano

### Localizações
- `GET /api/locations` - Listar localizações
- `POST /api/locations` - Criar localização
- `GET /api/locations/[id]` - Buscar localização
- `PUT /api/locations/[id]` - Atualizar localização
- `DELETE /api/locations/[id]` - Deletar localização

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas do dashboard

### Horários de Barbeiros
- `GET /api/barber-schedules` - Listar horários
- `POST /api/barber-schedules` - Criar horário

### Fluxo de Caixa
- `GET /api/cash-flow` - Dados do fluxo de caixa

## 🔐 Autenticação

### Sistema de Login
O sistema utiliza autenticação baseada em sessão com as seguintes características:

- **Hash de senhas**: bcrypt com salt rounds 10
- **Armazenamento**: localStorage para persistência da sessão
- **Validação**: Verificação de barbeiro ativo e localização válida
- **Segurança**: Senhas nunca são expostas na resposta da API

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API Auth
    participant D as Database
    participant L as LocalStorage
    
    U->>F: Insere credenciais
    F->>A: POST /api/auth/login
    A->>D: Busca barbeiro
    D-->>A: Dados do barbeiro
    A->>A: Verifica senha (bcrypt)
    A->>D: Valida localização
    D-->>A: Dados da localização
    A-->>F: Dados da sessão
    F->>L: Salva dados da sessão
    F->>F: Redireciona para dashboard
```

### Configuração de Senhas
- **Senha padrão**: `123456` (deve ser alterada no primeiro login)
- **Hash padrão**: `$2b$10$FU2.T1CJn9wrAw9LVuCx1O24ryp7qSkyzjw9xJC.Cnn3h/xyA7HLS`
- **Script de configuração**: `scripts/setup-authentication.js`

## 🚀 Deploy

### Variáveis de Ambiente para Produção
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_SECRET="seu-secret-super-seguro"
NEXTAUTH_URL="https://seu-dominio.com"
NODE_ENV="production"
```

### Build para Produção
```bash
npm run build
npm start
```

### Deploy no Vercel
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Deploy no Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Próximas Funcionalidades

- [ ] Sistema de notificações push
- [ ] Integração com WhatsApp
- [ ] Relatórios avançados com gráficos
- [ ] Sistema de backup automático
- [ ] API para aplicativo mobile
- [ ] Integração com gateways de pagamento
- [ ] Sistema de avaliações
- [ ] Gestão de estoque de produtos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email: [seu-email@exemplo.com]

---

**Desenvolvido com ❤️ para modernizar a gestão de barbearias**