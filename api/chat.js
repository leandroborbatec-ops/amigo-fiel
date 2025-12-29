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
    
    // INSTRUÇÃO PARA RESPOSTAS CURTAS E ACOLHEDORAS
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', suporte emocional da Igreja Batista.
    REGRAS DE OURO:
    1. RESPOSTAS CURTAS: No máximo 3 frases pequenas por vez. Seja breve para não cansar quem sofre.
    2. EMPATIA IMEDIATA: Comece validando o sentimento.
    3. SUAVE NA BÍBLIA: Não despeje textos bíblicos. Cite apenas um princípio por vez, se couber.
    4. PERMISSÃO: Antes de orar ou dar conselho longo, pergunte se a pessoa aceita.
    
    Contexto: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.7,
            maxOutputTokens: 150 // LIMITA FISICAMENTE O TAMANHO DA RESPOSTA
        }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "Estou aqui com você. Pode falar mais sobre isso?" });
  }
};
