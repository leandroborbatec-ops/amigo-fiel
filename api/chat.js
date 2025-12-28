const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    if (!mensagem) throw new Error("Mensagem vazia");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Versão simplificada da chamada
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Você é o 'Amigo Fiel', um assistente empático. Responda brevemente: ${mensagem}` }] }],
    });

    const response = await result.response;
    res.status(200).json({ resposta: response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ resposta: "Tive um problema técnico interno, mas ainda estou aqui para te ouvir." });
  }
};
