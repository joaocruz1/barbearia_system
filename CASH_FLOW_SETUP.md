# Sistema de Acompanhamento de Caixa

## Visão Geral

O sistema de acompanhamento de caixa foi implementado para fornecer uma visão completa e funcional do fluxo financeiro da barbearia, permitindo que administradores acompanhem receitas, agendamentos e métricas importantes.

## Funcionalidades Implementadas

### 1. API de Cash Flow (`/api/cash-flow`)

**Endpoint:** `GET /api/cash-flow`

**Parâmetros de Query:**
- `startDate` (opcional): Data inicial no formato YYYY-MM-DD
- `endDate` (opcional): Data final no formato YYYY-MM-DD
- `locationId` (opcional): ID da localização para filtrar
- `barberId` (opcional): ID do barbeiro para filtrar

**Resposta:**
```json
{
  "stats": {
    "totalRevenue": 0,
    "pendingRevenue": 0,
    "paidRevenue": 0,
    "cancelledRevenue": 0,
    "totalAppointments": 0,
    "completedAppointments": 0,
    "pendingAppointments": 0,
    "cancelledAppointments": 0,
    "noShowAppointments": 0,
    "paymentMethods": {
      "pix": 0,
      "dinheiro": 0,
      "cartao": 0,
      "plano": 0
    },
    "dailyRevenue": [...],
    "barberStats": [...],
    "serviceStats": [...]
  },
  "appointments": [...]
}
```

### 2. Página de Caixa (`/cash-flow`)

**Acesso:** Apenas para administradores

**Funcionalidades:**
- **Filtros Avançados:**
  - Período (data inicial e final)
  - Localização
  - Barbeiro
  - Status do agendamento

- **Cards de Resumo:**
  - Receita Total
  - Receita Paga
  - Receita Pendente
  - Receita Cancelada

- **Métodos de Pagamento:**
  - Distribuição por PIX, Dinheiro, Cartão e Plano
  - Valores formatados em Real (R$)

- **Rankings:**
  - Top 5 Barbeiros por receita
  - Top 5 Serviços por receita

- **Lista Detalhada:**
  - Todos os agendamentos no período
  - Informações completas de cada agendamento
  - Status visual com badges coloridos

### 3. Navegação

**Menu Lateral:**
- Novo item "Caixa" adicionado à sidebar
- Ícone: DollarSign (💰)
- Acesso restrito a administradores
- Posicionado após "Usuários"

## Como Usar

### 1. Acesso à Página
1. Faça login como administrador
2. Clique em "Caixa" no menu lateral
3. A página carregará automaticamente com dados dos últimos 30 dias

### 2. Aplicar Filtros
1. **Período:** Selecione data inicial e final
2. **Localização:** Escolha uma localização específica ou "Todas"
3. **Barbeiro:** Filtre por barbeiro específico ou "Todos"
4. **Status:** Filtre por status do agendamento

### 3. Interpretar os Dados

**Cards de Resumo:**
- **Receita Total:** Soma de todos os valores dos agendamentos
- **Receita Paga:** Valores já recebidos (status: completed + paid)
- **Receita Pendente:** Valores a receber (status: scheduled ou completed + pending)
- **Receita Cancelada:** Valores perdidos por cancelamentos

**Métodos de Pagamento:**
- Mostra a distribuição da receita por forma de pagamento
- Útil para entender preferências dos clientes

**Rankings:**
- **Top Barbeiros:** Ranking por receita gerada
- **Top Serviços:** Ranking por receita gerada
- Ajuda a identificar os mais produtivos

### 4. Ações Disponíveis
- **Atualizar:** Recarrega os dados com os filtros atuais
- **Exportar:** (Em desenvolvimento) Exportará dados para Excel/PDF

## Características Técnicas

### Segurança
- Acesso restrito apenas a administradores
- Verificação de permissões no frontend e backend
- Redirecionamento automático para não-administradores

### Performance
- Consultas otimizadas no banco de dados
- Agregações calculadas no servidor
- Cache de dados no frontend

### Responsividade
- Interface adaptável para desktop e mobile
- Cards organizados em grid responsivo
- Filtros empilhados em telas menores

## Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   └── cash-flow/
│   │       └── route.ts          # API endpoint
│   └── cash-flow/
│       └── page.tsx              # Página principal
├── components/
│   └── app-sidebar.tsx           # Menu lateral (atualizado)
└── lib/
    └── api.ts                    # Funções de API (se necessário)
```

## Próximas Melhorias

1. **Exportação de Dados:**
   - Exportar para Excel/CSV
   - Relatórios em PDF
   - Gráficos e charts

2. **Métricas Avançadas:**
   - Comparação com períodos anteriores
   - Tendências e projeções
   - Análise de sazonalidade

3. **Notificações:**
   - Alertas de metas não atingidas
   - Lembretes de pagamentos pendentes

4. **Integração:**
   - Sincronização com sistemas de pagamento
   - Integração com contabilidade

## Teste da Funcionalidade

Execute o arquivo `test-cash-flow.js` no navegador para testar a API:

```javascript
// No console do navegador
const testCashFlowAPI = async () => {
  const response = await fetch('/api/cash-flow');
  const data = await response.json();
  console.log('Dados de caixa:', data);
};
testCashFlowAPI();
```

## Suporte

Para dúvidas ou problemas com a funcionalidade de caixa, verifique:
1. Se o usuário tem permissões de administrador
2. Se há dados de agendamentos no período selecionado
3. Se a API está respondendo corretamente
4. Se os filtros estão aplicados corretamente
