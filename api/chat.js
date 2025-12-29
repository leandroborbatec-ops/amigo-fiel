module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const responseModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const dataModels = await responseModels.json();
    const modeloDisponivel = dataModels.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional.
    REGRAS DE RESPOSTA:
    1. Seja extremamente breve. Responda com no máximo 20 palavras.
    2. NUNCA corte a frase no meio. Termine sempre com um ponto final.
    3. Se o usuário disser "bom dia", responda apenas: "Bom dia! Que a graça e a paz do Senhor estejam com você. Como está seu coração?"
    
    Mensagem: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.7,
            maxOutputTokens: 800, // Aumentamos o limite para garantir que a frase termine
            topP: 0.8
        }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "Bom dia! A paz do Senhor. Como você se sente hoje?" });
  }
};
