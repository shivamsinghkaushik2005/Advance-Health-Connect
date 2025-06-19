import React, { useState } from 'react';
import './Chatbot.css';

const chatbotReplies = {
  fever: "You may have an infection. Please consult a general physician.",
  headache: "You might need to consult a neurologist.",
  cough: "You should consult a pulmonologist.",
  diabetes: "Please connect with an endocrinologist.",
  default: "Sorry, I couldn’t understand. Please describe your symptoms clearly.",
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = { sender: "user", text: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  try {
    const res = await fetch("http://localhost:5000/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const botMessage = { sender: "bot", text: data.reply };

    setMessages((prev) => [...prev, botMessage]);
  } catch (err) {
    const errorMessage = {
      sender: "bot",
      text: "❌ AI Error: Unable to fetch reply.",
    };
    setMessages((prev) => [...prev, errorMessage]);
  }
};

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">🤖 HealthBot</div>
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your symptom..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>
    </div>
  );
}

export default Chatbot;
