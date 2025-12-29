module.exports = async (req, res) => {
  // Configurações de acesso (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Busca automática de modelos
    const responseModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const dataModels = await responseModels.json();

    if (dataModels.error) throw new Error(dataModels.error.message);

    const modeloDisponivel = dataModels.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    if (!modeloDisponivel) throw new Error("Nenhum modelo disponível no momento.");

    // 2. Instrução Estratégica Atualizada (Fiel à Bíblia Batista e Gênero Neutro)
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', um suporte emocional empático baseado na Bíblia Batista.
    DIRETRIZES DE CONVERSA:
    - Use LINGUAGEM NEUTRA: Não use termos como 'amigo/amiga', 'bem-vindo/bem-vinda' ou adjetivos que definam gênero. Use 'Que bom ter sua presença', 'Pessoa querida', 'Você é especial'.
    - Inicie focado 100% na dor do usuário. Se ele enviou um sentimento (como raiva, ansiedade, tristeza), valide isso sem julgamentos.
    - Ofereça esperança baseada na teologia batista.
    - Pergunte gentilmente: 'Eu costumo falar com Deus sobre o que sinto. Você aceitaria que eu fizesse uma breve oração por você agora, ou prefere apenas continuar conversando?'
    - Lembre que você NÃO substitui um psicólogo.
    - Se a pessoa disser que quer uma célula, incentive-a a procurar o grupo local.

    Mensagem do Usuário: ${mensagem}`;

    // 3. Chamada para o Chat Gemini
    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    const chatData = await chatResponse.json();
    
    // Tratamento de erro de resposta da IA
    if (!chatData.candidates || !chatData.candidates[0].content) {
        throw new Error("Resposta da IA inválida.");
    }

    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    console.error("Erro no servidor:", error.message);
    res.status(500).json({ 
      resposta: "Estou aqui ouvindo você. Tente enviar sua mensagem novamente, ou ajude a manter o projeto vivo com créditos via doação." 
    });
  }
};
