module.exports = async (req, res) => {
  // Configurações de acesso (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Busca automática de modelos para evitar erro de "not found"
    const responseModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const dataModels = await responseModels.json();

    if (dataModels.error) throw new Error(dataModels.error.message);

    const modeloDisponivel = dataModels.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    if (!modeloDisponivel) throw new Error("Nenhum modelo disponível no momento.");

    // 2. Instrução Estratégica: Empatia para crentes e não crentes
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional empático.
    DIRETRIZES DE CONVERSA:
    - Inicie focado 100% na dor do usuário. Use linguagem acolhedora e comum (evite termos religiosos técnicos agora).
    - Mostre que você é um porto seguro para desabafos, sem julgamentos.
    - Após acolher e validar o sentimento, se sentir abertura, ofereça uma palavra de esperança baseada na sabedoria bíblica cristã batista.
    - Pergunte gentilmente: 'Eu costumo falar com Deus sobre o que sinto. Você aceitaria que eu fizesse uma breve oração por você agora, ou prefere apenas continuar conversando?'
    - Respeite o livre arbítrio: se a pessoa disser não, continue o apoio emocional sem insistir no tema religioso.

    Usuário disse: ${mensagem}`;

    // 3. Chamada para o Chat usando o modelo que o Google liberou
    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    console.error("Erro no servidor:", error.message);
    res.status(500).json({ 
      resposta: "Estou aqui ouvindo você. Tente enviar sua mensagem novamente, por favor." 
    });
  }
};
