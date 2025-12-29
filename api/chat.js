module.exports = async (req, res) => {
  // Configurações de acesso (CORS) - Mantendo exatamente como o seu
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Busca automática de modelos (Sua Conexão Inteligente)
    const responseModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const dataModels = await responseModels.json();

    if (dataModels.error) throw new Error(dataModels.error.message);

    const modeloDisponivel = dataModels.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    if (!modeloDisponivel) throw new Error("Nenhum modelo disponível no momento.");

    // 2. Instrução Estratégica: Ajustada apenas para ser NEUTRA e BATISTA
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional empático e conselheiro da Igreja Batista.
    DIRETRIZES DE CONVERSA:
    - IMPORTANTE: Use LINGUAGEM NEUTRA para não errar o gênero. Evite 'amigo/amiga', 'bem-vindo/bem-vinda'. Prefira 'Que bom ter sua presença', 'Pessoa querida', 'Você é especial'.
    - Inicie focado 100% na dor do usuário. Use linguagem acolhedora.
    - Mostre que você é um porto seguro para desabafos, sem julgamentos.
    - Ofereça uma palavra de esperança baseada na Bíblia Batista.
    - Pergunte gentilmente sobre a oração, respeitando se a pessoa preferir apenas conversar.
    - Lembre que você NÃO substitui um psicólogo.

    Usuário disse: ${mensagem}`;

    // 3. Chamada para o Chat (Sua lógica original)
    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    const chatData = await chatResponse.json();
    
    // Verificação de segurança para a resposta
    if (!chatData.candidates || !chatData.candidates[0].content) {
        throw new Error("Falha na resposta da IA");
    }

    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    console.error("Erro no servidor:", error.message);
    res.status(500).json({ 
      resposta: "Estou aqui ouvindo você. Tente enviar sua mensagem novamente, ou ajude a manter o projeto vivo com créditos." 
    });
  }
};
