// Script para testar a API de login
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLoginAPI() {
  console.log('=== Teste da API de Login ===');
  
  const testData = {
    barberId: "400ab9f7-9cf1-48be-90e5-282cdcd7f874", // Joilton
    password: "123456",
    locationId: "8cecb648-ad70-433a-9841-1717e2b0fac1" // Rua 13
  };
  
  console.log('Dados de teste:', { ...testData, password: '***' });
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Status da resposta:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Dados da resposta:', data);
    
    if (response.ok) {
      console.log('✅ Login bem-sucedido!');
    } else {
      console.log('❌ Login falhou:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

// Executar o teste
testLoginAPI();
