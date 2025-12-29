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
    
    // INSTRUÇÃO REFORMULADA PARA EVITAR CORTES
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional humano e breve.
    DIRETRIZES:
    1. Responda em no máximo 2 ou 3 frases completas.
    2. Nunca termine uma frase pela metade.
    3. Se o usuário der apenas um "bom dia", responda de forma calorosa e curta, perguntando como está o coração dele.
    4. Mantenha o tom de acolhimento da Bíblia evangélica nvi, mas de forma muito suave.
    
    Usuário: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.7,
            maxOutputTokens: 400, // Aumentamos aqui para que a frase não seja cortada no meio
            topP: 0.9 
        }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "Bom dia! Estou aqui para te ouvir. Como você está se sentindo hoje?" });
  }
};
