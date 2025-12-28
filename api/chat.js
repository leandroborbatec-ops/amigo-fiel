module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const modeloDisponivel = data.models.find(m => m.supportedGenerationMethods.includes("generateContent"));

    const { mensagem } = req.body;

    // Nova instrução: Acolhimento primeiro, religião depois (Estratégia Amigo Fiel)
    const instrucaoEstrategica = `Você é o 'Amigo Fiel'. Sua missão é acolher pessoas em sofrimento (crentes e não crentes).
    1. No início da conversa, foque APENAS em ouvir e dar empatia humana. Não use termos religiosos difíceis.
    2. Mostre que você entende a dor dela. Muitas dessas pessoas não gostam de igreja, então seja um amigo primeiro.
    3. Após acolher bem, pergunte de forma muito gentil: 'Sabe, eu acredito muito no poder da conversa com Deus. Você me permitiria fazer uma breve oração por você agora, ou prefere apenas continuar conversando?'
    4. Se ela aceitar, faça uma oração curta e amorosa baseada na fé cristã batista. Se ela não quiser, continue o apoio emocional normalmente sem julgar.
    
    Mensagem do usuário: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: instrucaoEstrategica }] }] })
    });

    const chatData = await chatResponse.json();
    res.status(200).json({ resposta: chatData.candidates[0].content.parts[0].text });

  } catch (error) {
    res.status(500).json({ resposta: "Estou aqui ouvindo você. Tente enviar novamente: " + error.message });
  }
};
