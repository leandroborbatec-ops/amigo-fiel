const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    // Usando a chave que já está na sua Vercel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Mudamos para gemini-pro que é o modelo mais estável para essa versão da API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(mensagem);
    const response = await result.response;
    
    res.status(200).json({ resposta: response.text() });
  } catch (error) {
    res.status(500).json({ resposta: "Erro na API: " + error.message });
  }
};
