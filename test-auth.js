const bcrypt = require('bcrypt');

// Teste da autenticação
async function testAuth() {
  console.log('=== Teste de Autenticação ===');
  
  // Senha que você está usando
  const testPassword = '123456';
  
  // Hash que está no banco (do script anterior)
  const storedHash = '$2b$10$FU2.T1CJn9wrAw9LVuCx1O24ryp7qSkyzjw9xJC.Cnn3h/xyA7HLS';
  
  console.log('Testando senha:', testPassword);
  console.log('Hash armazenado:', storedHash);
  
  // Verificar se a senha está correta
  const isValid = await bcrypt.compare(testPassword, storedHash);
  console.log('Senha válida:', isValid);
  
  // Gerar um novo hash para comparação
  const newHash = await bcrypt.hash(testPassword, 10);
  console.log('Novo hash gerado:', newHash);
  
  // Verificar se o novo hash também funciona
  const isNewHashValid = await bcrypt.compare(testPassword, newHash);
  console.log('Novo hash válido:', isNewHashValid);
  
  console.log('\n=== Instruções ===');
  console.log('1. Se "Senha válida" for false, o hash no banco está incorreto');
  console.log('2. Execute o script SQL novamente com o hash correto');
  console.log('3. Se "Senha válida" for true, o problema está no frontend');
}

testAuth().catch(console.error);
