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

    if (dataModels.error) {
       return res.status(200).json({ resposta: "Desculpe, atingimos o limite de mensagens gratuitas. Por favor, ajude o projeto com uma doação para voltarmos a conversar!" });
    }

    const modeloDisponivel = dataModels.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    // Instrução curta para economizar processamento
    const instrucao = `Você é o Amigo Fiel SOS, suporte da Igreja Batista. Use linguagem neutra e bíblica. Responda com empatia a isto: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucao }] }]
      })
    });

    const chatData = await chatResponse.json();
    
    // Se a IA falhar (falta de crédito), envia a mensagem de doação
    if (!chatData.candidates) {
       return res.status(200).json({ resposta: "Nosso limite diário de atendimento gratuito foi atingido. Ajude a manter este ministério vivo com uma doação!" });
    }

    const textoResposta = chatData.candidates[0].content.parts[0].text;
    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "No momento estamos sem créditos para novas conversas. Por favor, tente novamente mais tarde ou colabore com o projeto." });
  }
};
