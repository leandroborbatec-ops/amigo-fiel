// Este código fica escondido no servidor. Ninguém na internet consegue ler.
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Configuração de segurança para permitir que seu site acesse a IA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { mensagem } = req.body;

  try {
    // AQUI FICA A SUA CHAVE QUE VOCÊ COPIOU DO GOOGLE AI STUDIO
    // No servidor, chamamos isso de "Variável de Ambiente"
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Você é o 'Amigo Fiel', um assistente empático para uma igreja. Ouça desabafos com amor. Se detectar risco de vida, direcione para o CVV 188. Seja breve e acolhedor."
    });

    const result = await model.generateContent(mensagem);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ resposta: text });
  } catch (error) {
    res.status(500).json({ resposta: "Estou com uma pequena dificuldade técnica, mas sigo aqui para te ouvir." });
  }
};