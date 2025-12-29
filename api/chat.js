module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Usando o modelo estável para evitar cortes
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional humano da Igreja Batista.
    
    SUA MISSÃO: Responder de forma inteligente e breve ao que o usuário diz.
    
    REGRAS DE OURO:
    1. ANALISE O CONTEXTO: Se o usuário disser "bom dia", responda com paz. Se o usuário clicar em um sentimento ou desabafar, use EMPATIA IMEDIATA.
    2. EMPATIA PARA DOR: Se houver tristeza ou dor, diga: "Sinto muito que você esteja passando por isso".
    3. CELEBRE A GRATIDÃO: Se o usuário estiver grato, alegre-se com ele em uma frase curta.
    4. LINGUAGEM HUMANA: Use "você" ou "pessoa querida". No máximo 2 ou 3 frases completas.
    5. ORAÇÃO: Sempre termine oferecendo: "Você aceitaria que eu fizesse uma breve oração por você agora?".
    
    Mensagem do usuário: ${mensagem}`;

    const chatResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.7, // Aumentado para ela deixar de ser um robô repetitivo
            maxOutputTokens: 500,
            topP: 0.8
        }
      })
    });

    const chatData = await chatResponse.json();
    
    if (chatData.candidates && chatData.candidates[0].content) {
        const textoResposta = chatData.candidates[0].content.parts[0].text;
        res.status(200).json({ resposta: textoResposta });
    } else {
        throw new Error();
    }

  } catch (error) {
    res.status(200).json({ resposta: "Estou aqui para te ouvir. Como está seu coração neste momento?" });
  }
};
