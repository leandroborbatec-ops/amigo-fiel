module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Usando o ID técnico completo que o Google é obrigado a reconhecer
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: mensagem }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Se o 1.5 falhar, tenta o 1.0 que é o mais básico de todos
      const retry = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: mensagem }] }] })
      });
      const retryData = await retry.json();
      if (retryData.error) throw new Error(retryData.error.message);
      return res.status(200).json({ resposta: retryData.candidates[0].content.parts[0].text });
    }

    res.status(200).json({ resposta: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ resposta: "Erro de permissão Google: " + error.message });
  }
};
