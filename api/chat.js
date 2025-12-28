module.exports = async (req, res) => {
  // Configuração de CORS para permitir acesso do seu site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Chave API não configurada na Vercel.");
    }

    // Instrução baseada na Bíblia evangélica (Doutrina Batista)
    const promptSistema = `Você é o 'Amigo Fiel', um conselheiro cristão evangélico batista. 
    1. Responda sempre com base na Bíblia Sagrada.
    2. Identifique o problema do usuário e ofereça conforto espiritual.
    3. Sempre pergunte: 'Posso fazer uma breve oração por você sobre isso agora?'
    4. Se ele aceitar, escreva uma oração curta e centrada na vontade de Deus.`;

    // Usando o ID técnico 001 para evitar o erro de "modelo não encontrado"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { 
            role: "user", 
            parts: [{ text: promptSistema + "\n\nUsuário diz: " + mensagem }] 
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const textoResposta = data.candidates[0].content.parts[0].text;
    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    console.error("Erro:", error.message);
    res.status(500).json({ 
      resposta: "O Amigo Fiel está em oração. Tente novamente em instantes. (Detalhe: " + error.message + ")" 
    });
  }
};
