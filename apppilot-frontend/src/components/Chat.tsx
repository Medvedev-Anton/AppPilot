import { useState } from "react";
import { sendMessage } from "../api/chat.ts";
import ProjectView from "./ProjectView.tsx";

interface Message {
  role: "user" | "assistant";
  text?: string;
  projects?: Array<{
    project: {
      projectName: string;
      description?: string;
      files: Array<{ path: string; content: string }>;
    };
  }>;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      text: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(userMessage.text!);

      let botMessage: Message;
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
          text: "Готово",
          projects: Array.isArray(res) ? res : [res],
        };
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "Ошибка соединения",
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
            <h2>AppPilot</h2>
            <p>Создайте проект с помощью AI</p>
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
            placeholder="Опишите проект..."
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
