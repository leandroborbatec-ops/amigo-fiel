module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Modelo estável para evitar cortes de frase
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', suporte emocional da Igreja Batista.
    
    INSTRUÇÕES DE INTELIGÊNCIA:
    1. ANALISE O SENTIMENTO: Se o usuário disser "boa noite" ou "bom dia", deseje paz. Se ele disser que está triste, mude o tom imediatamente para acolhimento profundo.
    2. EMPATIA REAL: Comece sempre validando a dor: "Sinto muito que você esteja se sentindo assim".
    3. RESPOSTAS COMPLETAS: Use no máximo 3 frases, mas NUNCA deixe a última frase incompleta.
    4. LINGUAGEM HUMANA: Use "pessoa querida" ou "você". Fale como alguém que realmente se importa.
    5. ORAÇÃO: Sempre pergunte ao final: "Você aceitaria que eu fizesse uma breve oração por você agora?".
    
    Mensagem do usuário: ${mensagem}`;

    const chatResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.8, // Permite que a IA seja mais humana e menos repetitiva
            maxOutputTokens: 600,
            topP: 0.9
        }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "Sinto muito que esteja sendo difícil. Estou aqui com você. Como está seu coração agora?" });
  }
};
