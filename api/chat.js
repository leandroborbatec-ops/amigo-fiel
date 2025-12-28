module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Tentativa com o ID técnico completo: models/gemini-1.5-flash-001
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: mensagem }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Se falhar de novo, tentaremos o modelo "gemini-1.0-pro" que é o nome raiz da v1
      const retryResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: mensagem }] }]
        })
      });
      const retryData = await retryResponse.json();
      
      if (retryData.error) throw new Error(retryData.error.message);
      
      return res.status(200).json({ resposta: retryData.candidates[0].content.parts[0].text });
    }

    const textoResposta = data.candidates[0].content.parts[0].text;
    res.status(200).json({ resposta: textoResposta });

  } catch (error) {
    res.status(500).json({ resposta: "Erro final de modelo: " + error.message });
  }
};
