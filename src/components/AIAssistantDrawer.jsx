import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ChefHat, Wrench, Zap } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useLanguage } from '../utils/LanguageContext';

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

export default function AIAssistantDrawer({ activeModule, currentContext, isOpen: controlledIsOpen, onClose, hideFab }) {
  const { t } = useLanguage();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const handleClose = () => {
    if (onClose) onClose();
    if (controlledIsOpen === undefined) setInternalIsOpen(false);
  };
  
  const handleOpen = () => {
    if (controlledIsOpen === undefined) setInternalIsOpen(true);
  };

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: t('aiGreeting'),
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
      const response = await aiService.getChatResponse(query, messages, activeModule, currentContext);
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

  const moduleColor = activeModule === 'recipe' ? 'text-[#c9a84c]' : 'text-[#8b6914]';
  const moduleBg   = activeModule === 'recipe' ? 'bg-[#1a1008] border-[#3d2510]' : 'bg-[#120a05] border-[#2a1a0e]';
  const ModuleIcon = activeModule === 'recipe' ? ChefHat : Wrench;

  const prompts = QUICK_PROMPTS[activeModule] || QUICK_PROMPTS.recipe;

  return (
    <>
      {/* ── FAB ─────────────────────────── */}
      {!hideFab && (
        <button
          id="ai-assistant-fab"
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-30 h-14 w-14 rounded-2xl bg-gradient-to-br from-[#8b6914] to-[#5c4020] border border-[#c9a84c] text-white flex items-center justify-center shadow-2xl shadow-[#8b6914]/40 hover:scale-110 active:scale-95 transition-all duration-200"
          title="Open AI Assistant"
        >
          <MessageSquare className="h-6 w-6 text-[#f2e8d0]" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#c9a84c] border-2 border-[#1a1008] animate-pulse" />
        </button>
      )}

      {/* ── Overlay ─────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#000000]/70 backdrop-blur-md"
          onClick={handleClose}
        />
      )}

      {/* ── Drawer Panel ────────────────── */}
      <div className={`fixed z-50 glass-glow flex flex-col transition-all duration-300 ease-in-out
        lg:top-0 lg:right-0 lg:bottom-auto lg:left-auto lg:h-full lg:w-[400px] lg:border-l lg:border-[#8b6914] lg:rounded-none
        bottom-0 left-0 w-full h-[88vh] rounded-t-3xl border-t border-[#8b6914] shadow-[0_0_50px_rgba(0,0,0,0.9)]
        ${isOpen
          ? 'translate-x-0 translate-y-0'
          : 'lg:translate-x-full translate-x-0 translate-y-full lg:translate-y-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#3d2510] bg-[#1a1008] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8b6914] to-[#3d2510] border border-[#c9a84c] flex items-center justify-center shadow-lg shadow-[#8b6914]/40">
              <Bot className="h-6 w-6 text-[#f2e8d0]" />
            </div>
            <div>
              <h3 className="font-bold text-gradient-brass text-md flex items-center gap-1.5 tracking-wide" style={{ fontFamily: 'Cinzel, serif' }}>
                AI Assistant
                <Sparkles className="h-4 w-4 text-[#c9a84c] animate-pulse" />
              </h3>
              <p className="text-[10px] font-bold text-[#8a7355] uppercase tracking-widest mt-0.5">
                Ollama — Local Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-[#8a7355] hover:text-[#d4c49a] hover:bg-[#251808] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Context strip */}
        <div className={`px-4 py-2.5 border-b flex items-center justify-between ${moduleBg}`}>
          <div className="flex items-center gap-1.5">
            <ModuleIcon className={`h-3.5 w-3.5 ${moduleColor}`} />
            <span className={`text-[10px] font-bold ${moduleColor}`}>
              {activeModule === 'recipe'
                ? (currentContext.ingredientsText ? `Ingredients: ${currentContext.ingredientsText.slice(0, 28)}…` : 'Recipe Maker — No ingredients yet')
                : `Thing Maker — ${currentContext.selectedToolsCount || 0} tools selected`}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-bold text-[#c9a84c]">
            <Zap className="h-3 w-3" />
            Live Context
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f0a07]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-3 text-[11px] font-medium leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-[#8b6914] to-[#5c4020] text-[#f2e8d0] shadow-md shadow-[#8b6914]/20 rounded-br-sm border border-[#c9a84c]/50'
                  : 'bg-[#1a1008] text-[#d4c49a] border border-[#3d2510] shadow-sm rounded-bl-sm'
              }`}>
                {msg.text.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>{line}</p>
                ))}
              </div>
              <span className="text-[8px] text-[#8a7355] font-bold mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="bg-[#1a1008] border border-[#3d2510] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 bg-[#8b6914] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-[#8b6914] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-[#8b6914] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-3 py-2 border-t border-[#3d2510] bg-[#120a05] flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.text)}
              className="flex-shrink-0 flex items-center gap-1 text-[9px] font-bold px-2.5 py-1.5 bg-[#1a1008] border border-[#3d2510] rounded-xl text-[#8a7355] hover:text-[#d4c49a] hover:border-[#8b6914] hover:bg-[#251808] shadow-sm whitespace-nowrap transition-all"
            >
              <span>{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[#3d2510] bg-[#1a1008] flex items-end gap-2 flex-shrink-0">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('typeMessage')}
            rows={1}
            className="flex-1 max-h-24 min-h-[40px] px-3 py-2.5 border border-[#3d2510] rounded-xl text-[11px] font-medium text-[#d4c49a] placeholder:text-[#8a7355] bg-[#0f0a07] focus:bg-[#120a05] focus:ring-1 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all resize-none outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#8b6914] to-[#5c4020] border border-[#c9a84c]/50 flex items-center justify-center text-[#f2e8d0] shadow-md shadow-[#8b6914]/20 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
