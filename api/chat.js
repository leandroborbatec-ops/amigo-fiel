module.exports = async (req, res) => {
  // Configuração de CORS para permitir que o seu index.html na Vercel fale com esta API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Busca o modelo disponível automaticamente para evitar erros de conexão
    const responseModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const dataModels = await responseModels.json();
    const modeloDisponivel = dataModels.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    // INSTRUÇÃO ESTRATÉGICA PARA RESPOSTAS CURTAS E HUMANAS
    const instrucaoEstrategica = `Você é o 'Amigo Fiel', suporte emocional.
    SUA MISSÃO: Ouvir e acolher pessoas em crise com amor e brevidade.
    
    REGRAS CRÍTICAS:
    1. RESPOSTAS MUITO CURTAS: Use no máximo 2 ou 3 frases curtas por mensagem. 
    2. NÃO DÊ LIÇÃO DE MORAL: Se a pessoa estiver mal, apenas acolha com frases como "Sinto muito que esteja passando por isso".
    3. BÍBLIA COM MODERAÇÃO: Não cite versículos longos agora. Use princípios de esperança da Bíblia Batista apenas se for natural.
    4. PERMISSÃO PARA ORAR: Sempre pergunte: "Você aceita que eu faça uma oração curta por você agora?".
    5. FOCO NO USUÁRIO: Não fale de si mesmo, foque na dor de quem escreve.
    
    Mensagem do usuário: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.7, // Mantém a resposta natural e humana
            maxOutputTokens: 120, // TRAVA FÍSICA para impedir textos longos e cansativos
            topP: 0.9
        }
      })
    });

    const chatData = await chatResponse.json();
    
    // Verifica se a resposta da IA é válida antes de enviar
    if (chatData && chatData.candidates && chatData.candidates[0].content) {
        const textoResposta = chatData.candidates[0].content.parts[0].text;
        res.status(200).json({ resposta: textoResposta });
    } else {
        throw new Error("Resposta inválida da IA");
    }

  } catch (error) {
    // Resposta de erro curta e acolhedora em caso de falha técnica ou falta de créditos
    res.status(200).json({ 
        resposta: "Pessoa querida, tive um pequeno problema técnico agora, mas continuo aqui ouvindo você. Pode repetir o que me disse?" 
    });
  }
};
