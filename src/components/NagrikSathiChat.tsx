import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export const NagrikSathiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      text: "Namaste! I am **NagrikSathi**, your AI civic companion. 🌟 I can help you file reports, check ward details, explain our XP rewards, or recommend community initiatives. How can I help you improve our neighborhood today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true); // show notification badge initially

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      // Send chat history to server-side Gemini chatbot endpoint
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const err = await response.json();
        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          text: `Sorry, I encountered an issue: ${err.error || "Please verify your server setup."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        text: "I'm having trouble connecting to the civic servers right now. Please try again soon!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  // Helper to render simple formatting like bold and bullet points
  const formatMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-extrabold text-slate-950 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      
      if (part.includes("\n- ") || part.includes("\n* ")) {
        const lines = part.split(/\n[-*] /g);
        return (
          <span key={i}>
            {lines[0]}
            <ul className="list-disc list-inside my-1.5 ml-2 space-y-1">
              {lines.slice(1).map((line, li) => (
                <li key={li}>{line}</li>
              ))}
            </ul>
          </span>
        );
      }

      return part.split("\n").map((line, j) => (
        <React.Fragment key={`${i}-${j}`}>
          {line}
          {j < part.split("\n").length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <>
      {/* Floating Action Button & Panel */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[520px] h-[75vh]"
              id="nagrik-sathi-chatbox"
            >
              {/* Header */}
              <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Bot size={18} className="text-white animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black tracking-tight">NagrikSathi</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="text-[10px] text-indigo-100 font-medium flex items-center gap-1">
                      <Sparkles size={10} /> AI Civic Companion
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleChat}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/30">
                        <Bot size={12} />
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div
                        className={`p-3 rounded-2xl text-left leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                            : "bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-tl-none shadow-2xs"
                        }`}
                      >
                        {formatMessageText(msg.text)}
                      </div>
                      <p className={`text-[9px] text-slate-400 ${msg.role === "user" ? "text-right" : "text-left ml-1"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2 max-w-[85%] mr-auto">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200/30">
                      <Bot size={12} />
                    </div>
                    <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask NagrikSathi about reporting, rewards..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-slate-50 dark:bg-slate-850 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-xl transition-all cursor-pointer shadow-xs shrink-0 flex items-center justify-center"
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Toggle Button */}
        <motion.button
          onClick={toggleChat}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-4 rounded-full shadow-xl cursor-pointer relative z-50 flex items-center justify-center transition-colors border ${
            isOpen
              ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none"
          }`}
          id="nagrik-sathi-chat-fab"
        >
          {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
          
          {/* Unread message indicator badge */}
          {hasNewMessage && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] text-white font-black items-center justify-center">1</span>
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
};
