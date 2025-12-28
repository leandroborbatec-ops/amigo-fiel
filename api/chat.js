module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Tentando o gemini-pro na v1beta (muitas vezes é o único ativo no início)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: mensagem }] }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    res.status(200).json({ resposta: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ resposta: "Google em sincronização: " + error.message });
  }
};
