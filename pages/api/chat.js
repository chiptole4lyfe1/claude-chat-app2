export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { apiKey, message, messages } = req.body

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' })
    }

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Format previous messages for the Anthropic API
    const formattedMessages = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))

    // Add the new user message
    const finalMessages = [
      ...formattedMessages.slice(0, -1),
      { role: 'user', content: message }
    ]

    // Call the Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4000,
        messages: finalMessages,
        temperature: 0.7,
        stream: false,
        system: "You are Claude, a helpful AI assistant. Use extended thinking to provide detailed, thoughtful, and accurate responses.",
        extended_thinking: true
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API Error:', errorData)
      return res.status(response.status).json({ 
        error: `Anthropic API Error: ${errorData.error?.message || 'Unknown error'}`
      })
    }

    const data = await response.json()
    
    return res.status(200).json({ response: data.content[0].text })
  } catch (error) {
    console.error('Error processing request:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
