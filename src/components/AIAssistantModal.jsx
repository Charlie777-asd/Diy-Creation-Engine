import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, ChefHat, Wrench, Zap } from 'lucide-react';
import { aiService } from '../services/aiService';

const QUICK_PROMPTS = {
  recipe: [
    { emoji: '🥚', text: 'Egg substitutes?', label: 'Egg substitutes' },
    { emoji: '🌾', text: 'Make it gluten-free?', label: 'Gluten-free' },
    { emoji: '🥗', text: 'Best side dish ideas?', label: 'Side dishes' },
    { emoji: '🌿', text: 'Vegan swaps?', label: 'Vegan swaps' },
  ],
  thing: [
    { emoji: '🛡️', text: 'Wood carving safety tips?', label: 'Safety tips' },
    { emoji: '🧲', text: 'Best adhesive options?', label: 'Adhesive guide' },
    { emoji: '🎨', text: 'How to paint plastic?', label: 'Paint plastic' },
    { emoji: '🔩', text: 'Joining without screws?', label: 'No-screw joints' },
  ],
};

export default function AIAssistantModal({ onClose, context = 'thing' }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! I'm your AI assistant. Ask me anything about cooking, kitchen swaps, crafting techniques, or material safety!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;
    if (!textToSend) setInputMessage('');

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const currentContextData = context === 'recipe' 
        ? { ingredientsText: 'pizza dough, cheese, tomato sauce' } 
        : { materialsText: 'wood, metal, plastic' };

      const response = await aiService.getChatResponse(query, messages, context, currentContextData);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I'm having trouble right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const moduleColor = context === 'recipe' ? 'text-orange-500' : 'text-violet-500';
  const moduleBg   = context === 'recipe' ? 'bg-orange-950 border-orange-900' : 'bg-[#1a1008] border-[#3d2510]';
  const ModuleIcon = context === 'recipe' ? ChefHat : Wrench;

  const prompts = QUICK_PROMPTS[context] || QUICK_PROMPTS.recipe;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Lato, sans-serif' }}>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative flex flex-col w-full max-w-lg h-[600px] max-h-[90vh] bg-[#0c0806] border border-[#5c4020] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-up">
        
        {/* Header */}
        <div className="p-4 border-b border-[#3d2510] flex items-center justify-between gap-3 bg-[#120a05]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8b6914] to-[#5c4020] flex items-center justify-center shadow-lg border border-[#c9a84c]/30">
              <Bot className="h-6 w-6 text-[#f2e8d0]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#d8c4a0] text-sm flex items-center gap-1.5" style={{ fontFamily: 'Cinzel, serif' }}>
                AI Assistant
                <Sparkles className="h-3 w-3 text-[#c9a84c]" />
              </h3>
              <p className="text-[9px] font-bold text-[#8a7355] uppercase tracking-widest">
                Moondream Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8a7355] hover:text-[#d8c4a0] hover:bg-[#2a1a0e] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Context strip */}
        <div className={`px-4 py-2 border-b flex items-center justify-between ${moduleBg}`}>
          <div className="flex items-center gap-2">
            <ModuleIcon className={`h-3.5 w-3.5 ${moduleColor}`} />
            <span className={`text-[10px] font-bold ${moduleColor}`}>
              {context === 'recipe' ? 'Recipe Maker Context' : 'Thing Maker Context'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-[#c9a84c]">
            <Zap className="h-3 w-3" />
            Live
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0a0502] to-[#120a05]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-[#8b6914] to-[#5c4020] text-[#0a0502] font-bold rounded-br-sm shadow-md'
                  : 'bg-[#1a1008] text-[#d8c4a0] border border-[#3d2510] rounded-bl-sm shadow-sm'
              }`}>
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                ))}
              </div>
              <span className="text-[9px] text-[#8a7355] font-bold mt-1.5 px-2">{msg.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="bg-[#1a1008] border border-[#3d2510] rounded-2xl rounded-bl-sm px-4 py-4 shadow-sm flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-3 border-t border-[#3d2510] bg-[#120a05] flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.text)}
              className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-[#1a1008] border border-[#5c4020] rounded-lg text-[#c4a882] hover:text-[#f2e8d0] hover:border-[#c9a84c] transition-all whitespace-nowrap"
            >
              <span className="text-sm">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#0a0502] flex items-end gap-3 flex-shrink-0 border-t border-[#3d2510]">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            rows={1}
            className="flex-1 max-h-24 min-h-[44px] px-4 py-3 border border-[#5c4020] rounded-xl text-xs text-[#d8c4a0] placeholder:text-[#8a7355] bg-[#120a05] focus:bg-[#1a1008] focus:outline-none focus:border-[#c9a84c] transition-all resize-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="h-11 w-11 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#8b6914] to-[#5c4020] flex items-center justify-center text-[#0a0502] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
