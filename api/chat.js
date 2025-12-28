module.exports = async (req, res) => {
  // Configuração de cabeçalhos para evitar bloqueios de segurança (CORS)
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

    // Identidade do Amigo Fiel: Base Bíblica Evangélica Batista
    const promptSistema = `Você é o 'Amigo Fiel', um assistente de apoio espiritual cristão evangélico batista. 
    Diretrizes:
    1. Responda sempre com base na Bíblia Sagrada.
    2. Identifique a dor do usuário e ofereça conforto e um versículo bíblico.
    3. SEMPRE pergunte: 'Posso fazer uma breve oração por você sobre isso agora?'
    4. Se ele aceitar, escreva uma oração curta, focada na soberania de Deus e na paz de Cristo.
    5. Mantenha um tom acolhedor, empático e de fé.`;

    // Chamada otimizada para o modelo que funcionou no seu teste (gemini-1.5-flash)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { 
            role: "user", 
            parts: [{ text: promptSistema + "\n\nPergunta do usuário: " + mensagem }] 
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Extração da resposta final
    const textoResposta = data.candidates[0].content.parts[0].text;
    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    console.error("Erro detalhado:", error.message);
    // Mensagem amigável para o usuário final
    res.status(500).json({ 
      resposta: "O Amigo Fiel está em oração no momento (erro de conexão). Por favor, aguarde 30 segundos e tente enviar sua mensagem novamente." 
    });
  }
};
