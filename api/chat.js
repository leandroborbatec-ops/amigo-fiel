module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Fixamos o modelo gemini-1.5-flash que é o mais estável para evitar os cortes que você viu
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', suporte emocional da Igreja Batista.
    
    DIRETRIZES RÍGIDAS DE ATENDIMENTO:
    1. PRIORIDADE TOTAL À EMPATIA: Inicie 100% focado na dor. Use frases como "Sinto muito que você esteja passando por isso".
    2. LINGUAGEM HUMANA E NEUTRA: Não use "amigo/amiga" nem cite versículos de imediato. Use "você".
    3. BREVIDADE ABSOLUTA: Responda em NO MÁXIMO 2 frases curtas. 
    4. NUNCA CORTE O TEXTO: Termine sempre com ponto final ou interrogação.
    5. ORAÇÃO COM PERMISSÃO: Sempre pergunte: "Você aceitaria que eu fizesse uma breve oração por você agora?".
    
    Mensagem do usuário: ${mensagem}`;

    const chatResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.5, // Menor temperatura = resposta mais direta e menos chances de erro
            maxOutputTokens: 1000, // Aumentamos muito para o Google não ter desculpa para cortar
            topP: 0.8
        }
      })
    });

    const chatData = await chatResponse.json();
    
    if (chatData.candidates && chatData.candidates[0].content) {
        const textoResposta = chatData.candidates[0].content.parts[0].text;
        res.status(200).json({ resposta: textoResposta });
    } else {
        throw new Error("Resposta vazia");
    }

  } catch (error) {
    res.status(200).json({ resposta: "Sinto muito que esteja passando por isso. Estou aqui para te ouvir. Como posso te apoiar agora?" });
  }
};
