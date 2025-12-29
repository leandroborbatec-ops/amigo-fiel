module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Fixamos o modelo 1.5-flash que é o mais rápido e estável para evitar as frases cortadas que você viu anteriormente
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional humano da Igreja Batista.
    
    SUA MISSÃO: Ouvir com o coração e responder de forma curta e acolhedora.
    
    DIRETRIZES DE OURO:
    1. CONTEXTO REAL: Se o usuário disser "bom dia" ou "boa noite", responda de forma calorosa. Se ele expressar dor ou clicar em um sentimento, mude o tom para acolhimento profundo imediatamente.
    2. EMPATIA SEMPRE: Comece validando o que a pessoa sente. Ex: "Sinto muito por esse peso no seu coração" ou "Que bom te ver por aqui hoje".
    3. LINGUAGEM HUMANA: Use "você" ou "pessoa querida". Escreva no máximo 3 frases completas. NUNCA corte o texto no meio de uma palavra.
    4. ESPERANÇA: Após acolher, ofereça uma palavra de esperança leve e pergunte: "Você aceitaria que eu fizesse uma breve oração por você agora?".
    
    Mensagem do usuário para responder: ${mensagem}`;

    const chatResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.8, // Aumentado para a resposta ser menos "robô" e mais "amigo"
            maxOutputTokens: 500, // Espaço de sobra para não haver cortes
            topP: 0.9
        }
      })
    });

    const chatData = await chatResponse.json();
    
    if (chatData.candidates && chatData.candidates[0].content) {
        const textoResposta = chatData.candidates[0].content.parts[0].text;
        res.status(200).json({ resposta: textoResposta });
    } else {
        throw new Error("Erro na IA");
    }

  } catch (error) {
    // Resposta de segurança mais humana se a conexão falhar
    res.status(200).json({ 
        resposta: "Pessoa querida, estou aqui com você. Meu sistema oscilou um pouco, mas meu coração continua pronto para te ouvir. Como você está se sentindo?" 
    });
  }
};
