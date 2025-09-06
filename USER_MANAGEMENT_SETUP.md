# Sistema de Gerenciamento de Usuários - Barbearia

## Resumo das Implementações

✅ **Schema Prisma atualizado**: Adicionados campos `role` e `isActive` ao modelo `Barber`
✅ **APIs criadas**: CRUD completo para gerenciamento de usuários
✅ **Página de administração**: Interface completa para gerenciar usuários
✅ **Sistema de roles**: Admin e Funcionário com permissões diferentes
✅ **Segurança**: Apenas admins podem acessar funcionalidades administrativas

## Estrutura do Sistema

### Roles (Funções)
- **Admin**: Acesso total ao sistema, pode gerenciar usuários
- **Funcionário**: Acesso limitado às funcionalidades operacionais

### Funcionalidades por Role

#### Admin
- ✅ Criar novos usuários
- ✅ Editar dados de usuários
- ✅ Resetar senhas
- ✅ Ativar/Desativar usuários
- ✅ Alterar roles de usuários
- ✅ Acessar todas as funcionalidades do sistema

#### Funcionário
- ✅ Acessar dashboard
- ✅ Gerenciar agendamentos
- ✅ Gerenciar clientes
- ✅ Alterar própria senha
- ❌ Gerenciar usuários (apenas visualização)

## Passos para Implementar

### 1. Atualizar o Banco de Dados

Execute o script SQL para adicionar os novos campos:

```sql
-- Execute este script no seu banco de dados PostgreSQL
-- Arquivo: scripts/add-role-column.sql
```

### 2. Configurar Primeiro Admin

O script SQL define o Bruno Souza como admin. Para alterar:

```sql
-- Alterar admin (substitua o ID conforme necessário)
UPDATE barbers SET role = 'admin' WHERE id = 'SEU_ID_AQUI';
```

### 3. Testar o Sistema

1. **Faça login como admin** (Bruno Souza com senha `123456`)
2. **Acesse a página "Usuários"** no menu lateral
3. **Teste as funcionalidades**:
   - Criar novo usuário
   - Editar usuário existente
   - Resetar senha
   - Ativar/Desativar usuário

## APIs Criadas

### GET /api/users
- **Descrição**: Listar todos os usuários
- **Acesso**: Apenas admin
- **Parâmetros**: `adminBarberId` (ID do admin)

### POST /api/users
- **Descrição**: Criar novo usuário
- **Acesso**: Apenas admin
- **Body**: `{ adminBarberId, name, email, phone, password, role }`

### PUT /api/users/[id]
- **Descrição**: Atualizar usuário
- **Acesso**: Apenas admin
- **Body**: `{ adminBarberId, name, email, phone, role, isActive }`

### DELETE /api/users/[id]
- **Descrição**: Desativar usuário (soft delete)
- **Acesso**: Apenas admin
- **Parâmetros**: `adminBarberId` (ID do admin)

### POST /api/users/[id]/reset-password
- **Descrição**: Resetar senha de usuário
- **Acesso**: Apenas admin
- **Body**: `{ adminBarberId, newPassword }`

## Segurança Implementada

### Validações
- ✅ Verificação de role em todas as APIs administrativas
- ✅ Validação de senha (mínimo 6 caracteres)
- ✅ Verificação de email único
- ✅ Proteção contra desativação da própria conta
- ✅ Verificação de usuário ativo no login

### Permissões
- ✅ Apenas admins podem acessar `/users`
- ✅ Apenas admins podem criar/editar usuários
- ✅ Apenas admins podem resetar senhas
- ✅ Funcionários não veem menu "Usuários"

## Interface do Usuário

### Página de Usuários (`/users`)
- **Lista de usuários** com informações completas
- **Badges** para role e status
- **Botões de ação**:
  - ✏️ Editar usuário
  - 🔒 Resetar senha
  - ✅/❌ Ativar/Desativar

### Dialogs
- **Criar usuário**: Formulário completo
- **Editar usuário**: Formulário pré-preenchido
- **Resetar senha**: Campo de nova senha

### Feedback
- **Toasts** para todas as ações
- **Validações** em tempo real
- **Mensagens de erro** específicas

## Fluxo de Trabalho

### Para Administradores
1. **Login** com credenciais de admin
2. **Acessar** página "Usuários" no menu
3. **Gerenciar** usuários conforme necessário
4. **Criar** novos usuários quando necessário
5. **Resetar** senhas quando solicitado

### Para Funcionários
1. **Login** com credenciais de funcionário
2. **Acessar** funcionalidades operacionais
3. **Alterar** própria senha se necessário
4. **Não ter acesso** a funcionalidades administrativas

## Próximas Melhorias Sugeridas

1. **Auditoria**: Log de todas as ações administrativas
2. **Notificações**: Email quando senha é resetada
3. **Política de senhas**: Regras mais rigorosas
4. **Sessões**: Controle de sessões ativas
5. **Backup**: Exportação de dados de usuários

---

**Nota**: Execute o script SQL manualmente no seu banco de dados antes de usar as funcionalidades de gerenciamento de usuários.
