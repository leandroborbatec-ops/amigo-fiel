module.exports = async (req, res) => {
  // Configuração de CORS para permitir que seu site acesse a API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Prompt de Sistema com a doutrina Batista
    const promptSistema = `Você é o 'Amigo Fiel', um assistente de apoio emocional e espiritual cristão de linha evangélica batista. 
    Suas diretrizes são:
    1. Seja extremamente acolhedor, empático e nunca julgue.
    2. Baseie seus conselhos na Bíblia Sagrada.
    3. Ao identificar um problema ou dor, ofereça uma palavra de esperança bíblica.
    4. Sempre pergunte se o usuário gostaria de uma oração específica sobre o que ele relatou.
    5. Se ele aceitar, escreva uma oração fervorosa, curta e centrada na soberania de Deus.`;

    // Chamada para a API do Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: promptSistema }] },
          { role: "model", parts: [{ text: "Entendido. Sou o Amigo Fiel, pronto para oferecer apoio bíblico e oração. Como posso ajudar agora?" }] },
          { role: "user", parts: [{ text: mensagem }] }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const textoResposta = data.candidates[0].content.parts[0].text;
    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    console.error("Erro na API:", error);
    res.status(500).json({ 
      resposta: "O Amigo Fiel está em oração no momento (erro de conexão). Por favor, tente novamente em um minuto." 
    });
  }
};
