export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { mensagem } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo econômico para poupar créditos
        messages: [
          {
            role: "system",
            content: "Você é o 'Amigo Fiel', um conselheiro espiritual da Igreja Batista. Use a Bíblia Batista como base. IMPORTANTE: Use linguagem neutra para não errar o gênero (ex: use 'Que bom ter sua presença' em vez de 'Bem-vindo' ou 'Amigo'). Se o usuário disser que sente raiva, ansiedade ou tristeza, ofereça conforto bíblico sem julgamentos. Lembre sempre que você NÃO substitui um psicólogo."
          },
          { role: "user", content: mensagem }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    // Verifica se a API retornou erro de créditos
    if (data.error) {
      return res.status(500).json({ resposta: "Estou em oração, mas meus créditos de IA acabaram. Ajude a manter o projeto vivo clicando no botão de doação abaixo." });
    }

    res.status(200).json({ resposta: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ resposta: "Houve um erro na conexão. Tente novamente em instantes." });
  }
}
