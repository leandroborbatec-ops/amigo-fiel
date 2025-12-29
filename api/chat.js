module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Fixamos o modelo gemini-1.5-flash para maior estabilidade e evitar cortes
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const instrucaoEstrategica = `Você é o 'Amigo Fiel'.
    
    LÓGICA DE RESPOSTA:
    1. SE FOR SAUDAÇÃO (Ex: bom dia, oi, olá): Responda apenas com: "Bom dia! Que a graça e a paz do Senhor estejam com você. Como está seu coração hoje?"
    
    2. SE FOR DESABAFO OU DOR (Siga estas 6 regras):
       - PRIORIDADE TOTAL À EMPATIA: Inicie focado na dor. Use "Sinto muito que você esteja passando por isso".
       - LINGUAGEM HUMANA: Fale como um amigo ouvinte, sem versículos imediatos.
       - LINGUAGEM NEUTRA: Use "você", nunca "amigo/amiga".
       - BREVIDADE: No máximo 2 ou 3 frases curtas e COMPLETAS.
       - TRANSIÇÃO: Mencione a esperança bíblica Evangélica NVI suavemente após acolher.
       - ORAÇÃO: Pergunte: "Você aceitaria que eu fizesse uma breve oração por você agora?".
    
    Mensagem do usuário: ${mensagem}`;

    const chatResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.4, // Reduzido para evitar respostas confusas
            maxOutputTokens: 800, // Espaço de sobra para o ponto final aparecer
            topP: 0.8
        }
      })
    });

    const chatData = await chatResponse.json();
    
    if (chatData.candidates && chatData.candidates[0].content) {
        const textoResposta = chatData.candidates[0].content.parts[0].text;
        res.status(200).json({ resposta: textoResposta });
    } else {
        throw new Error("Erro na resposta");
    }

  } catch (error) {
    res.status(200).json({ resposta: "Bom dia! Que a paz do Senhor esteja com você. Como está seu coração hoje?" });
  }
};

