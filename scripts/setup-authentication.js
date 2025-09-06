const bcrypt = require('bcrypt');

// Função para gerar hash de senha
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Função para verificar senha
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Exemplo de uso
async function main() {
  const senhaInicial = '123456';
  
  console.log('=== Configuração de Autenticação ===');
  console.log(`Senha inicial para todos os barbeiros: ${senhaInicial}`);
  
  const hash = await hashPassword(senhaInicial);
  console.log(`Hash da senha: ${hash}`);
  
  // Verificar se o hash está correto
  const isValid = await verifyPassword(senhaInicial, hash);
  console.log(`Hash válido: ${isValid}`);
  
  console.log('\n=== Instruções ===');
  console.log('1. Execute o script SQL: add-password-column.sql');
  console.log('2. Use a senha "123456" para fazer login');
  console.log('3. Recomenda-se alterar a senha após o primeiro login');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { hashPassword, verifyPassword };
