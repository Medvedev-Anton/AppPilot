import { useState } from "react";
import { sendMessage } from "../api/chat";
import ProjectView from "./ProjectView";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      text: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(userMessage.text);

      // Проверяем, является ли ответ массивом проектов
      let botMessage;
      if (Array.isArray(res) && res.length > 0 && res[0].project) {
        botMessage = {
          role: "assistant",
          projects: res,
        };
      } else if (res.reply) {
        botMessage = {
          role: "assistant",
          text: res.reply,
        };
      } else {
        botMessage = {
          role: "assistant",
          text: "Проект создан",
          projects: Array.isArray(res) ? res : [res],
        };
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "Ошибка соединения с AppPilot Core",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">🚀</div>
            <h2>Добро пожаловать в AppPilot</h2>
            <p>Опишите приложение, которое хотите создать, и я помогу вам с кодом</p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            {m.text && <div className="message-content">{m.text}</div>}
            {m.projects && m.projects.map((projectData, idx) => (
              <ProjectView key={idx} project={projectData.project} />
            ))}
          </div>
        ))}
        
        {loading && (
          <div className="chat-message assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-wrapper">
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Опишите ваше приложение..."
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="send-button"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
