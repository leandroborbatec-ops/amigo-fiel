module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Tentativa com o modelo "gemini-pro" na versão v1 estável (já que a v1beta está falhando)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: mensagem }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Se falhar, tentamos o ID absoluto que costuma destravar contas novas
      const retry = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
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
    res.status(500).json({ resposta: "Sincronizando com o Google... Tente novamente em 1 min: " + error.message });
  }
};
