module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // 1. Pergunta ao Google qual modelo está liberado para você hoje
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    const modeloDisponivel = data.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    if (!modeloDisponivel) throw new Error("Nenhum modelo disponível para esta chave ainda.");

    const { mensagem } = req.body;

    // 2. Definimos a instrução Batista e a sugestão de oração
    const instrucaoBiblica = `Aja como o 'Amigo Fiel', um conselheiro cristão evangélico batista. 
    Baseie-se na Bíblia, dê conforto e SEMPRE ofereça uma oração sobre o problema relatado. 
    Pergunta do usuário: ${mensagem}`;

    // 3. Usa o modelo que o Google liberou (modeloDisponivel.name)
    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: instrucaoBiblica }] }] })
    });

    const chatData = await chatResponse.json();
    res.status(200).json({ resposta: chatData.candidates[0].content.parts[0].text });

  } catch (error) {
    res.status(500).json({ resposta: "O Google está estabilizando sua conexão. Tente novamente: " + error.message });
  }
};
