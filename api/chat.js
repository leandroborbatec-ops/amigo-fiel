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
    
    // INSTRUÇÃO QUE VOCÊ ENVIOU + AJUSTE PARA CUMPRIMENTOS
    const instrucaoEstrategica = `Você é o 'Amigo Fiel'.
    
    CONTEXTO ESPECIAL: Se o usuário apenas te cumprimentar (oi, bom dia, etc), responda de forma calorosa e pergunte como está o coração dele.
    
    DIRETRIZES DE CONVERSA:
    1. PRIORIDADE TOTAL À EMPATIA: Inicie 100% focado na dor ou no desabafo. Use frases como "Sinto muito que você esteja passando por isso".
    2. LINGUAGEM HUMANA: Não cite versículos logo de cara. Fale como um amigo ouvinte.
    3. LINGUAGEM NEUTRA: Não use "amigo/amiga". Use  "você".
    4. BREVIDADE: Responda em no máximo 3 frases COMPLETAS. Nunca corte o texto pela metade.
    5. TRANSIÇÃO SUAVE: Somente após acolher, mencione a esperança na Bíblia evangélica NVI.
    6. ORAÇÃO COM PERMISSÃO: Sempre pergunte: "Você aceitaria que eu fizesse uma breve oração por você agora?".
    
    Usuário disse: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.8, 
            topP: 0.9,
            maxOutputTokens: 800 // Aumentado para garantir que a frase NUNCA seja cortada
        }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "Pessoa querida, tive um probleminha técnico, mas estou aqui. Como está seu coração agora?" });
  }
};
