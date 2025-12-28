module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensagem } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Voltando para o gemini-pro na versão v1, que é a mais estável
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: "Aja como o 'Amigo Fiel', um conselheiro evangélico batista. Use a Bíblia e ofereça uma oração. Pergunta: " + mensagem 
          }] 
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    res.status(200).json({ resposta: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ resposta: "O Google ainda está processando sua ativação: " + error.message });
  }
};
