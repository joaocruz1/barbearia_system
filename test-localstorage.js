// Teste do localStorage para verificar se o nome do barbeiro está sendo salvo
console.log("=== TESTE DO LOCALSTORAGE ===")

// Simular os dados que deveriam estar no localStorage
const testData = {
  barberId: "4684fd88-1307-45a1-918c-cf74879d90c9",
  barberName: "Faguinho",
  barberLocation: "8cecb648-ad70-433a-9841-1717e2b0fac1"
}

console.log("Dados de teste:", testData)

// Verificar se o localStorage está disponível
if (typeof localStorage !== 'undefined') {
  console.log("localStorage está disponível")
  
  // Salvar dados de teste
  localStorage.setItem("barberId", testData.barberId)
  localStorage.setItem("barberName", testData.barberName)
  localStorage.setItem("barberLocation", testData.barberLocation)
  
  // Verificar se foram salvos
  console.log("Dados salvos no localStorage:")
  console.log("- barberId:", localStorage.getItem("barberId"))
  console.log("- barberName:", localStorage.getItem("barberName"))
  console.log("- barberLocation:", localStorage.getItem("barberLocation"))
  
  // Limpar dados de teste
  localStorage.removeItem("barberId")
  localStorage.removeItem("barberName")
  localStorage.removeItem("barberLocation")
  
  console.log("Dados de teste removidos")
} else {
  console.log("localStorage não está disponível")
}

console.log("=== FIM DO TESTE ===")
