module.exports = async (req, res) => {
  // Configuração de cabeçalhos para permitir acesso do seu site (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde rapidamente a requisições de verificação do navegador
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Chave API não configurada no servidor.");
    }

    // Chamada direta para a API estável v1 usando o modelo gemini-pro
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: mensagem }] }]
      })
    });

    const data = await response.json();

    // Verifica se o Google retornou algum erro específico
    if (data.error) {
      throw new Error(data.error.message);
    }

    // Extrai o texto da resposta da IA
    const textoResposta = data.candidates[0].content.parts[0].text;
    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    // Retorna o erro detalhado para ajudar no teste
    res.status(500).json({ resposta: "Erro técnico: " + error.message });
  }
};
