import { useState } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { complaintApi } from "../../feature/api/complaintApi";

type Message = {
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export const Chatbot = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            text: "Hello! I'm your medical system assistant. I can help you with appointments, prescriptions, billing, and technical support. How can I assist you today?",
            sender: "bot",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState<string>("");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [chatWithBotApi] = complaintApi.useChatWithBotMutation();

    const sendMessage = async (): Promise<void> => {
        if (!input.trim()) return;

        const userMessage: Message = {
            text: input.trim(),
            sender: "user",
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await chatWithBotApi(input).unwrap();

            setTimeout(() => {
                const botMessage: Message = {
                    text: response.reply,
                    sender: "bot",
                    timestamp: new Date()
                };

                setMessages((prev) => [...prev, botMessage]);
                setIsTyping(false);
            }, 500);
        } catch (error) {
        setMessages((prev) => [
            ...prev,
            {
                text: "I'm experiencing technical difficulties. Please contact our support team directly for assistance.",
                sender: "bot",
                timestamp: new Date()
            }
        ]);
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <>
        {/* Floating Chat Button with Pulse Animation */}
        <div className="fixed bottom-6 right-6 z-50">
            <div
            className={`absolute inset-0 bg-blue-800 rounded-full animate-ping ${
                isOpen ? "hidden" : ""
            }`}
            ></div>
            <button
            className="relative bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-800/25 hover:scale-105 transition-all duration-300 border-2 border-blue-700"
            onClick={() => setIsOpen(!isOpen)}
            >
            {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>

        {/* Modern Chat Window */}
        {isOpen && (
            <div className="fixed bottom-24 right-6 z-40 bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-2xl w-96 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                    <Bot size={20} />
                    </div>
                    <div>
                    <h3 className="font-semibold text-lg">Medical Assistant</h3>
                    <p className="text-blue-100 text-sm opacity-90">
                        Always here to help
                    </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
                >
                    <X size={20} />
                </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.map((msg, i) => (
                <div
                    key={i}
                    className={`flex items-start gap-3 ${
                    msg.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                >
                    {/* Avatar */}
                    <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.sender === "user"
                        ? "bg-blue-800 text-white"
                        : "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                    }`}
                    >
                    {msg.sender === "user" ? (
                        <User size={16} />
                    ) : (
                        <Bot size={16} />
                    )}
                    </div>

                    {/* Message Bubble */}
                    <div
                    className={`flex flex-col ${
                        msg.sender === "user" ? "items-end" : "items-start"
                    } max-w-[80%]`}
                    >
                    <div
                        className={`p-3 rounded-2xl shadow-sm ${
                        msg.sender === "user"
                            ? "bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-br-sm"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                        }`}
                    >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 px-2">
                        {formatTime(msg.timestamp)}
                    </span>
                    </div>
                </div>
                ))}

                {/* Auto-scroll to bottom */}
                <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })} />

                {/* Typing Indicator */}
                {isTyping && (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm p-3 shadow-sm">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                        ></div>
                    </div>
                    </div>
                </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur rounded-b-2xl">
                <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                    <input
                    className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-800 focus:border-transparent outline-none bg-white/90 backdrop-blur text-sm placeholder-gray-500 transition-all duration-200"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isTyping}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Sparkles size={16} className="text-blue-800/50" />
                    </div>
                </div>
                <button
                    className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-blue-800/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                >
                    <Send size={18} />
                </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                For medical emergencies, please call 911 immediately
                </p>
            </div>
            </div>
        )}

        {/* Overlay for mobile */}
        {isOpen && (
            <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsOpen(false)}
            ></div>
        )}
        </>
    );
};
