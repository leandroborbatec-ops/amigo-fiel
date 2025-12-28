module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    // Pede ao Google a lista de modelos que VOCÊ pode usar
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    // Pega o nome do primeiro modelo disponível para você
    const modeloDisponivel = data.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    if (!modeloDisponivel) throw new Error("Nenhum modelo disponível para esta chave ainda.");

    const { mensagem } = req.body;
    // Faz a pergunta usando o modelo que o Google ACABOU de dizer que funciona
    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: mensagem }] }] })
    });

    const chatData = await chatResponse.json();
    res.status(200).json({ resposta: chatData.candidates[0].content.parts[0].text });

  } catch (error) {
    res.status(500).json({ resposta: "O Google ainda está processando sua ativação. Tente em 10 minutos. Erro: " + error.message });
  }
};
