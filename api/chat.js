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
    
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional empático.
    
    DIRETRIZES DE CONVERSA:
    1. PRIORIDADE TOTAL À EMPATIA: Inicie focado na dor ou desabafo. Use frases como "Sinto muito que você esteja passando por isso".
    2. BREVIDADE SEM CORTES: Escreva respostas curtas (máximo 3 frases), mas SEMPRE termine a frase com ponto final.
    3. LINGUAGEM HUMANA E NEUTRA: Não use termos de igreja logo de cara. Use "você".
    4. TRANSIÇÃO E ORAÇÃO: Após acolher, mencione a esperança na Bíblia evangélica nvi e pergunte: "Você aceitaria que eu fizesse uma breve oração por você agora?".
    
    Usuário disse: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.8, 
            topP: 0.9,
            // REMOVEMOS O LIMITE QUE CAUSAVA OS CORTES NAS IMAGENS
            maxOutputTokens: 2048 
        }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "Pessoa querida, tive um pequeno problema técnico, mas estou aqui para te ouvir. Como está seu coração?" });
  }
};
