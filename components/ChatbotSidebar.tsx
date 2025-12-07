"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2, AlertCircle } from "lucide-react";
import api from "@/services/api"; // Import konfigurasi API

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChatbotSidebar({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Halo! Saya AI Assistant Owner. Tanyakan tentang performa penjualan, revenue, atau produk terlaris Anda.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Tambahkan pesan User ke UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input; // Simpan input untuk dikirim
    setInput(""); // Kosongkan field input
    setIsTyping(true); // Tampilkan loading state

    try {
      // 2. Panggil API Backend (/api/chat)
      // Backend akan memproses pertanyaan -> query database -> rangkum dengan Gemini
      const response = await api.post("/chat", {
        question: currentInput,
        // Opsional: Anda bisa mengirim parameter start/end date jika ingin filter spesifik
        // start: "2024-01-01", 
        // end: "2024-12-31"
      });

      // 3. Ambil jawaban dari response Backend
      const aiAnswer = response.data.answer;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiAnswer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gagal menghubungi AI:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Maaf, saya mengalami kendala saat memproses data. Silakan coba lagi.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className={`
        flex flex-col h-full bg-white border-l border-gray-200 shadow-xl z-40
        transition-all duration-300 ease-in-out shrink-0
        ${isOpen ? "w-96 opacity-100" : "w-0 opacity-0 overflow-hidden"}
      `}
    >
      <div className="w-96 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold">AI Assistant</div>
              <div className="text-xs text-purple-100">Powered by Gemini</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-blue-600" : "bg-purple-600"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`flex-1 ${
                  message.role === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  {/* Render konten pesan */}
                  {message.content}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-xs text-gray-500">
                  Menganalisis data toko...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cth: Berapa revenue minggu ini?"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}