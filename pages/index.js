import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const savedApiKey = localStorage.getItem('anthropicApiKey')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const handleApiKeySubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('anthropicApiKey', apiKey)
  }

  const handleMessageSubmit = async (e) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          message: userMessage,
          messages: messages,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, there was an error processing your request. Please check your API key and try again."
      }])
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container">
      <Head>
        <title>Claude 3.7 Chat with Extended Thinking</title>
        <meta name="description" content="Chat with Claude 3.7 Sonnet with extended thinking mode enabled" />
      </Head>

      <main>
        <h1>Claude 3.7 Chat with Extended Thinking</h1>
        
        {!apiKey ? (
          <div className="api-key-container">
            <form onSubmit={handleApiKeySubmit}>
              <label htmlFor="api-key">Enter your Anthropic API Key:</label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                required
              />
              <button type="submit">Save API Key</button>
              <p className="info-text">
                Your API key is stored only in your browser's local storage and is never sent to our servers.
              </p>
            </form>
          </div>
        ) : (
          <>
            <div className="api-key-container">
              <p>API Key: <span>••••••••{apiKey.slice(-4)}</span></p>
              <button onClick={() => setApiKey('')}>Change API Key</button>
            </div>
            
            <div className="chat-container">
              <div className="messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                    {message.content}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="message assistant-message thinking">
                    Claude is thinking...
                  </div>
                )}
              </div>
              
              <form className="message-input" onSubmit={handleMessageSubmit}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>Send</button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
