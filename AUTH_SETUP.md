# Configuração de Autenticação - Sistema Barbearia

## Resumo das Alterações

✅ **Schema Prisma atualizado**: Adicionado campo `password` ao modelo `Barber`
✅ **Dependências instaladas**: bcrypt para hash de senhas
✅ **Scripts criados**: Para configuração e geração de senhas

## Passos para Implementar

### 1. Atualizar o Banco de Dados

Execute o script SQL para adicionar a coluna de senha:

```sql
-- Execute este script no seu banco de dados PostgreSQL
-- Arquivo: scripts/add-password-column.sql
```

### 2. Senha Inicial

- **Senha padrão para todos os barbeiros**: `123456`
- **Hash gerado**: `$2b$10$FU2.T1CJn9wrAw9LVuCx1O24ryp7qSkyzjw9xJC.Cnn3h/xyA7HLS`

### 3. Próximos Passos (Após aplicar no banco)

1. **Atualizar a API de login** para verificar senhas
2. **Implementar endpoint de alteração de senha**
3. **Adicionar validação de senha no frontend**

## Scripts Disponíveis

### Gerar novo hash de senha:
```bash
node scripts/setup-authentication.js
```

### Verificar senha (para desenvolvimento):
```javascript
const { verifyPassword } = require('./scripts/setup-authentication.js');
const isValid = await verifyPassword('123456', hash);
```

## Estrutura do Banco

### Tabela `barbers` atualizada:
```sql
CREATE TABLE barbers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  password VARCHAR(255) NOT NULL, -- NOVA COLUNA
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Segurança

- ✅ Senhas são hasheadas com bcrypt (salt rounds: 10)
- ✅ Hash único para cada senha
- ⚠️ **IMPORTANTE**: Altere a senha padrão após o primeiro login
- ⚠️ **IMPORTANTE**: Implemente rate limiting na API de login

## Próximas Implementações Necessárias

1. **API de Login** (`/api/auth/login`)
2. **API de Alteração de Senha** (`/api/auth/change-password`)
3. **Middleware de Autenticação**
4. **Validação de Sessão**
5. **Logout**

---

**Nota**: Execute o script SQL manualmente no seu banco de dados antes de continuar com as implementações da API.
