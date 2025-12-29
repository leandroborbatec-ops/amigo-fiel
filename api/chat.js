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
    const modeloDisponivel = dataModels.models.find(m => m.supportedGenerationMethods.includes("generateContent"));
    
    // CONSOLIDADO: 6 REGRAS DE OURO + CORREÇÃO DE CORTE DE FRASE
    const instrucaoEstrategica = `Você é o 'Amigo Fiel'.
    
    DIRETRIZES DE ATENDIMENTO:
    1. PRIORIDADE TOTAL À EMPATIA: Inicie 100% focado na dor ou no desabafo. Use: "Sinto muito que você esteja passando por isso".
    2. LINGUAGEM HUMANA: Não cite versículos logo de cara. Fale como um amigo ouvinte.
    3. LINGUAGEM NEUTRA: Não use "amigo/amiga". Use "você".
    4. BREVIDADE E CONCLUSÃO: Responda em no máximo 3 frases. SEMPRE termine a frase com ponto final. NUNCA corte o texto.
    5. TRANSIÇÃO SUAVE: Mencione esperança bíblica evangélica NVI apenas após acolher o sentimento.
    6. ORAÇÃO COM PERMISSÃO: Sempre pergunte: "Você aceitaria que eu fizesse uma breve oração por você agora?". 
        
    Mensagem do usuário: ${mensagem}`;

    const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modeloDisponivel.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instrucaoEstrategica }] }],
        generationConfig: { 
            temperature: 0.7,
            maxOutputTokens: 600, // Garantia para a frase não ser cortada
            topP: 0.8
        }
      })
    });

    const chatData = await chatResponse.json();
    const textoResposta = chatData.candidates[0].content.parts[0].text;

    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(200).json({ resposta: "Sinto muito que esteja passando por um momento difícil. Estou aqui para te ouvir. Como posso te apoiar agora?" });
  }
};
