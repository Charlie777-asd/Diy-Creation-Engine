import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  Loader2,
  Video,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  Leaf,
  Wrench,
  Palette,
  Atom,
  ChefHat,
  Hammer,
  BookOpen,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { useLocation, useNavigate } from 'react-router-dom';

const QUICK_PROMPTS = [
  { icon: ChefHat, text: 'How to make ramen from scratch?' },
  { icon: Lightbulb, text: 'Give me a creative DIY project idea' },
  { icon: Leaf, text: 'What are the healthiest breakfast options?' },
  { icon: Wrench, text: 'How do I fix a leaky faucet?' },
  { icon: Palette, text: 'How do I start watercolor painting?' },
  { icon: Atom, text: 'Explain quantum computing simply' },
];

function parseMarkdown(text) {
  if (!text) return null;
  const parts = [];
  let rest = text;
  let key = 0;

  // Split on newlines and handle bold, lists, etc.
  const lines = rest.split('\n');
  for (const line of lines) {
    if (!line.trim()) {
      parts.push(<div key={key++} className="h-2" />);
      continue;
    }
    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      const lineContent = renderInline(numMatch[2], key);
      parts.push(
        <div key={key++} className="flex items-start gap-2 my-1">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#8b6914]/30 text-[#c9a84c] text-[10px] font-bold flex items-center justify-center mt-0.5">{numMatch[1]}</span>
          <span className="text-sm leading-relaxed flex-1">{lineContent}</span>
        </div>
      );
      continue;
    }
    // Bullet list
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      const content = line.trim().replace(/^[-•]\s+/, '');
      parts.push(
        <div key={key++} className="flex items-start gap-2 my-0.5">
          <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-[#c9a84c] opacity-70" />
          <span className="text-sm leading-relaxed flex-1">{renderInline(content, key++)}</span>
        </div>
      );
      continue;
    }
    // Pro tip / italics line
    if (line.trim().startsWith('*') && line.trim().endsWith('*') && !line.trim().startsWith('**')) {
      parts.push(
        <div key={key++} className="flex items-start gap-2 my-1 italic text-[#c9a84c] text-xs opacity-90">
          <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{line.trim().replace(/^\*/, '').replace(/\*$/, '')}</span>
        </div>
      );
      continue;
    }
    parts.push(<p key={key++} className="text-sm leading-relaxed mb-1">{renderInline(line, key++)}</p>);
  }
  return parts;
}

function renderInline(text, baseKey) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return <strong key={`${baseKey}-${i}`} className="font-bold text-[#f2e8d0]">{seg.slice(2, -2)}</strong>;
    }
    return <span key={`${baseKey}-${i}`}>{seg}</span>;
  });
}

function detectVideoTopic(text) {
  const match = text.match(/\[SUGGEST_VIDEOS:\s*([^\]]+)\]/i);
  if (match) return match[1].trim();
  const patterns = [
    /how to (make|cook|build|create|fix|draw|paint|install)\s+([^.!?\n]+)/i,
    /recipe for\s+([^.!?\n]+)/i,
    /diy\s+([^.!?\n]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].replace(/\[SUGGEST_VIDEOS:\s*/i, '').trim();
  }
  return null;
}

function cleanText(text) {
  return text.replace(/\[SUGGEST_VIDEOS:\s*[^\]]+\]/gi, '').trim();
}

function MessageBubble({ msg, onRegenerate, isLast }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);
  const isBot = msg.sender === 'assistant';
  const videoTopic = isBot ? detectVideoTopic(msg.text) : null;
  const displayText = isBot ? cleanText(msg.text) : msg.text;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-end gap-3 animate-fade-up ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mb-1 relative"
          style={{ background: 'linear-gradient(135deg, #3d2510, #1a1008)', border: '1.5px solid #c9a84c', boxShadow: '0 0 12px rgba(200,168,76,0.3)' }}>
          <Bot className="h-4 w-4 text-[#c9a84c]" />
          <div className="absolute inset-0 rounded-full animate-soft-pulse opacity-30" style={{ background: 'radial-gradient(circle, rgba(200,168,76,0.4), transparent)' }} />
        </div>
      )}

      <div className="max-w-[88%] sm:max-w-[75%] space-y-2">
        <div
          className="rounded-2xl px-4 py-3 relative"
          style={{
            background: isBot
              ? 'linear-gradient(135deg, rgba(37,24,8,0.95), rgba(20,13,5,0.98))'
              : 'linear-gradient(135deg, rgba(139,105,20,0.3), rgba(201,168,76,0.2))',
            border: isBot
              ? '1px solid rgba(139,105,20,0.35)'
              : '1px solid rgba(200,168,76,0.5)',
            boxShadow: isBot ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {isBot ? (
            <div className="text-[#c4a882] space-y-0.5">
              {parseMarkdown(displayText)}
            </div>
          ) : (
            <p className="text-sm text-[#f2e8d0] leading-relaxed">{displayText}</p>
          )}
        </div>

        {/* Message actions */}
        {isBot && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-[9px] text-[#5c4020]">{msg.time}</span>
            <div className="flex items-center gap-1">
              <button onClick={handleCopy} className="p-1 rounded text-[#5c4020] hover:text-[#c9a84c] transition-colors" title="Copy">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
              <button onClick={() => setLiked(true)} className={`p-1 rounded transition-colors ${liked === true ? 'text-[#4ade80]' : 'text-[#5c4020] hover:text-[#4ade80]'}`} title="Good response">
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button onClick={() => setLiked(false)} className={`p-1 rounded transition-colors ${liked === false ? 'text-[#f87171]' : 'text-[#5c4020] hover:text-[#f87171]'}`} title="Bad response">
                <ThumbsDown className="h-3 w-3" />
              </button>
              {isLast && (
                <button onClick={onRegenerate} className="p-1 rounded text-[#5c4020] hover:text-[#c9a84c] transition-colors" title="Regenerate">
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
            {/* Video suggestion button */}
            {videoTopic && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoTopic)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:-translate-y-0.5"
                style={{
                  background: 'rgba(255,0,0,0.12)',
                  border: '1px solid rgba(255,80,80,0.4)',
                  color: '#ff8080',
                  boxShadow: '0 0 12px rgba(255,0,0,0.1)',
                }}
              >
                <Video className="h-3 w-3" />
                Get Videos
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        )}
        {!isBot && (
          <div className="flex justify-end px-1">
            <span className="text-[9px] text-[#5c4020]">{msg.time}</span>
          </div>
        )}
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mb-1 text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #8b6914, #c9a84c)', color: '#0a0502' }}>
          U
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 justify-start animate-fade-in">
      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #3d2510, #1a1008)', border: '1.5px solid #c9a84c', boxShadow: '0 0 12px rgba(200,168,76,0.3)' }}>
        <Bot className="h-4 w-4 text-[#c9a84c]" />
      </div>
      <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(37,24,8,0.95)', border: '1px solid rgba(139,105,20,0.35)' }}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-soft-pulse"
              style={{ background: '#c9a84c', animationDelay: `${i * 0.2}s`, opacity: 0.7 }}
            />
          ))}
          <span className="ml-2 text-[10px] text-[#8a7355] uppercase tracking-wider animate-flicker">Thinking...</span>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hey! I'm your **Creaforge Assistant** - your all-in-one AI companion.\n\nAsk me *anything*: recipes, DIY projects, science, history, coding, creative ideas, or just have a chat.\n\n*What would you like to explore today?*",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false);
  const lastUserMsgRef = useRef('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (query) => {
    if (!query.trim() || isTyping) return;
    lastUserMsgRef.current = query.trim();
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    try {
      const response = await aiService.getChatResponse(query.trim(), messages, 'general', {});
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I'm having a moment. Try again in a second and I'll be right back.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, messages]);

  useEffect(() => {
    if (hasProcessedInitialPrompt) return;
    const searchParams = new URLSearchParams(location.search);
    const initialPrompt = searchParams.get('prompt');
    if (!initialPrompt) return;
    setHasProcessedInitialPrompt(true);
    sendMessage(initialPrompt.trim());
  }, [location.search, hasProcessedInitialPrompt, sendMessage]);

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : inputMessage;
    if (typeof textToSend !== 'string') setInputMessage('');
    await sendMessage(query);
  };

  const handleRegenerate = () => {
    if (lastUserMsgRef.current) {
      setMessages(prev => prev.slice(0, -1)); // remove last assistant message
      sendMessage(lastUserMsgRef.current);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="flex flex-1 w-full"
      style={{ background: 'linear-gradient(135deg, #080503 0%, #0a0605 50%, #060402 100%)' }}
    >
      {/* ── Left: Sidebar ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-[#2a1a0e] overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #100a05 0%, #050301 100%)' }}>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />
        <div className="p-5 border-b border-[#2a1a0e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center relative flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3d2510, #1a1008)', border: '1.5px solid #c9a84c', boxShadow: '0 0 16px rgba(200,168,76,0.25)' }}>
              <Bot className="h-5 w-5 text-[#c9a84c]" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4ade80] border border-[#050301]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#f2e8d0]" style={{ fontFamily: 'Cinzel, serif' }}>Creaforge AI</p>
              <p className="text-[9px] text-[#4ade80] font-semibold">Assistant ready</p>
            </div>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c4020] mb-3">Quick Questions</p>
          <div className="space-y-1.5">
            {QUICK_PROMPTS.map((qp, i) => {
              const Icon = qp.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp.text)}
                  disabled={isTyping}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[10px] transition-all hover:translate-x-1 disabled:opacity-40 group flex items-start gap-2"
                  style={{
                    background: 'rgba(37,24,8,0.6)',
                    border: '1px solid rgba(60,40,20,0.6)',
                    color: '#c4a882',
                  }}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[#c9a84c] group-hover:scale-110 transition-transform" />
                  <span className="leading-snug">{qp.text}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#2a1a0e]">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5c4020] mb-3">Go To</p>
            <div className="space-y-1.5">
              {[
                { icon: Hammer, label: 'Thing Maker', path: '/thing-maker' },
                { icon: ChefHat, label: 'Recipe Maker', path: '/recipe-maker' },
                { icon: BookOpen, label: 'Collections', path: '/collections' },
              ].map(link => {
                const Icon = link.icon;
                return (
                  <button key={link.path} onClick={() => navigate(link.path)}
                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] flex items-center gap-2 transition-all hover:translate-x-1"
                    style={{ background: 'rgba(37,24,8,0.4)', border: '1px solid rgba(40,25,10,0.6)', color: '#8a7355' }}>
                    <Icon className="h-3.5 w-3.5 text-[#8a7355]" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ─────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(60,40,20,0.5)', background: 'rgba(15,10,6,0.8)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#4ade80] animate-soft-pulse" />
            <div>
              <h1 className="text-sm font-bold text-[#e8d9b8]" style={{ fontFamily: 'Cinzel, serif' }}>Creaforge Assistant</h1>
              <p className="text-[9px] text-[#8a7355] uppercase tracking-widest">Ask me anything</p>
            </div>
          </div>
          <button
            onClick={() => setMessages([{
              id: 'welcome',
              sender: 'assistant',
              text: "Fresh start! I'm ready for a new conversation. What would you like to explore?",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(37,24,8,0.8)', border: '1px solid rgba(60,40,20,0.7)', color: '#8a7355' }}
          >
            <RotateCcw className="h-3 w-3" /> New Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 sp-scroll">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onRegenerate={handleRegenerate}
              isLast={idx === messages.length - 1 && msg.sender === 'assistant'}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: 'rgba(60,40,20,0.5)', background: 'rgba(10,6,3,0.9)', backdropFilter: 'blur(20px)' }}>
          {/* Quick Prompts on mobile */}
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar lg:hidden">
            {QUICK_PROMPTS.slice(0, 3).map((qp, i) => {
              const Icon = qp.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSendMessage(qp.text)}
                  disabled={isTyping}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all inline-flex items-center gap-1.5"
                  style={{ background: 'rgba(37,24,8,0.8)', border: '1px solid rgba(60,40,20,0.8)', color: '#c4a882' }}
                >
                  <Icon className="h-3 w-3 text-[#c9a84c]" />
                  {qp.text.split(' ').slice(0, 3).join(' ')}...
                </button>
              );
            })}
          </div>

          <div className="relative flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={e => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything: recipes, DIY, science, history, code..."
                rows={1}
                className="w-full resize-none rounded-2xl px-4 py-3 pr-4 text-sm text-[#f2e8d0] placeholder:text-[#5c4020] focus:outline-none transition-all"
                style={{
                  background: 'rgba(25,15,8,0.95)',
                  border: '1.5px solid rgba(60,40,20,0.8)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
                  maxHeight: '120px',
                  lineHeight: '1.5',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(200,168,76,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(60,40,20,0.8)'}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: inputMessage.trim() && !isTyping
                  ? 'linear-gradient(135deg, #8b6914, #c9a84c)'
                  : 'rgba(37,24,8,0.6)',
                border: '1px solid rgba(139,105,20,0.5)',
                boxShadow: inputMessage.trim() && !isTyping ? '0 0 20px rgba(200,168,76,0.3)' : 'none',
                color: inputMessage.trim() && !isTyping ? '#0a0502' : '#5c4020',
              }}
            >
              {isTyping
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
            </button>
          </div>
          <p className="text-[9px] text-[#3d2510] text-center mt-2">Press Enter to send / Shift+Enter for a new line</p>
        </div>
      </div>
    </div>
  );
}
