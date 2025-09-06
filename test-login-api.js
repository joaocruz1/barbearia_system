// Teste da API de login para verificar se está retornando o nome do barbeiro
const testLogin = async () => {
  console.log("=== TESTE DA API DE LOGIN ===")
  
  const testData = {
    barberId: "4684fd88-1307-45a1-918c-cf74879d90c9", // Faguinho
    password: "123456", // Senha de teste
    locationId: "8cecb648-ad70-433a-9841-1717e2b0fac1" // Rua 13 - Ouro Fino
  }
  
  console.log("Dados de teste:", { ...testData, password: "***" })
  
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    })
    
    console.log("Status da resposta:", response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log("Resposta da API:", data)
      
      if (data.barber && data.barber.name) {
        console.log("✅ Nome do barbeiro retornado corretamente:", data.barber.name)
      } else {
        console.log("❌ Nome do barbeiro não encontrado na resposta")
      }
      
      if (data.location && data.location.name) {
        console.log("✅ Nome da localidade retornado corretamente:", data.location.name)
      } else {
        console.log("❌ Nome da localidade não encontrado na resposta")
      }
    } else {
      const errorData = await response.json()
      console.log("❌ Erro na API:", errorData)
    }
  } catch (error) {
    console.log("❌ Erro de conexão:", error)
  }
  
  console.log("=== FIM DO TESTE ===")
}

// Executar o teste se estivermos no navegador
if (typeof window !== 'undefined') {
  // Aguardar um pouco para a página carregar
  setTimeout(testLogin, 2000)
} else {
  console.log("Este teste deve ser executado no navegador")
}
