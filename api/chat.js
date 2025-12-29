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
    
    // INSTRUÇÃO ESTRATÉGICA PARA CONVERSA SUAVE
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional empático.
    DIRETRIZES DE CONVERSA:
    1. PRIORIDADE TOTAL À EMPATIA: Inicie 100% focado na dor ou no desabafo da pessoa. Use frases como "Sinto muito que você esteja passando por isso" ou "Deve ser muito difícil carregar esse peso".
    2. LINGUAGEM HUMANA: Não cite versículos ou termos de igreja logo de cara, a menos que a pessoa peça. Fale como um amigo ouvinte.
    3. LINGUAGEM NEUTRA: Não use "amigo/amiga" para não errar o gênero. Use "pessoa querida" ou "você".
    4. TRANSIÇÃO SUAVE: Somente após acolher o sentimento, mencione que há uma esperança baseada na Bíblia Batista, mas de forma leve.
    5. ORAÇÃO COM PERMISSÃO: Sempre pergunte antes de orar: "Eu costumo falar com Deus sobre o que sinto. Você aceitaria que eu fizesse uma breve oração por você agora, ou prefere apenas continuar conversando?".
    6. SEM JULGAMENTOS: Este é um porto seguro.
    
    Usuário disse: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.8, // Aumentado para uma conversa mais variada e menos robótica
            topP: 0.9 
        }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "Sinto muito, tive um problema técnico. Pode me contar de novo o que está sentindo?" });
  }
};
