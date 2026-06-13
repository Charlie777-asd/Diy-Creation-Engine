import React from 'react';
import { Bot, Wrench, ChefHat, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex-1 w-full bg-[#0e0a06] overflow-y-auto">
      {/* ── Header ── */}
      <div className="w-full bg-gradient-to-b from-[#1a1008] to-[#0e0a06] border-b border-[#3d2510] pt-16 pb-20 px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#8b6914]/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#5c4020]/10 to-transparent rounded-tr-full pointer-events-none" />
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#e8d9b8] mb-6" style={{ fontFamily: 'Cinzel, serif' }}>
          The Mechanism of Creaforge
        </h1>
        <p className="text-[#c4a882] max-w-2xl mx-auto leading-relaxed text-lg font-light">
          A revolutionary engine blending local artificial intelligence with your innate creativity. Whether you are building from scraps or cooking from pantry staples, we turn possibilities into blueprints.
        </p>
      </div>

      {/* ── How It Works ── */}
      <div className="max-w-6xl mx-auto py-20 px-8 space-y-32">
        
        {/* Thing Maker section */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1a1008] to-[#120a05] border border-[#5c4020] flex items-center justify-center shadow-lg shadow-[#5c4020]/20">
              <Wrench className="h-6 w-6 text-[#c9a84c]" />
            </div>
            <h2 className="text-3xl font-bold text-[#e8d9b8]" style={{ fontFamily: 'Playfair Display, serif' }}>
              The Thing Maker
            </h2>
            <p className="text-[#8a7355] leading-relaxed text-sm md:text-base">
              Got a pile of cardboard, old PVC pipes, and a glue gun? The Thing Maker evaluates your available materials and generates a detailed, step-by-step DIY project blueprint. We prioritize upcycling and sustainability, providing safety guidelines and exact measurements to ensure your build is a success.
            </p>
            <ul className="space-y-3 text-[#c4a882] text-sm">
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> Choose from over 100+ materials and tools.</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> AI vision detects items directly from a photo.</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> Get connected to relevant YouTube tutorials instantly.</li>
            </ul>
          </div>
          <div className="flex-1 w-full">
            <div className="rounded-xl border border-[#3d2510] bg-[#120a05] p-2 shadow-[0_0_30px_rgba(139,105,20,0.1)] relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#8b6914] to-[#5c4020] opacity-20 blur rounded-xl"></div>
              <img src="/thing-maker-lamp.png" alt="Thing Maker Interface" className="w-full h-auto rounded-lg relative z-10 border border-[#2a1a0e]" />
            </div>
          </div>
        </div>

        {/* Recipe Maker section */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1a1008] to-[#120a05] border border-[#5c4020] flex items-center justify-center shadow-lg shadow-[#5c4020]/20">
              <ChefHat className="h-6 w-6 text-[#c9a84c]" />
            </div>
            <h2 className="text-3xl font-bold text-[#e8d9b8]" style={{ fontFamily: 'Playfair Display, serif' }}>
              The Recipe Maker
            </h2>
            <p className="text-[#8a7355] leading-relaxed text-sm md:text-base">
              Tired of the same old meals? Tell us what is in your fridge, and our culinary automaton will forge a brand new recipe. It adapts to your dietary preferences, calculates nutritional information, and perfectly times your cooking steps to ensure a flawless dish.
            </p>
            <ul className="space-y-3 text-[#c4a882] text-sm">
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> Converts random ingredients into gourmet meals.</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> Automated dietary substitution suggestions.</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> Calculates Prep, Cook times, and health scores.</li>
            </ul>
          </div>
          <div className="flex-1 w-full">
            <div className="rounded-xl border border-[#3d2510] bg-[#120a05] p-6 shadow-[0_0_30px_rgba(139,105,20,0.1)] relative overflow-hidden flex items-center justify-center min-h-[300px]">
              <div className="absolute -inset-1 bg-gradient-to-l from-[#8b6914] to-[#5c4020] opacity-20 blur rounded-xl"></div>
              <div className="relative z-10 text-center">
                 <ChefHat className="h-20 w-20 text-[#5c4020] mx-auto mb-4 opacity-50" />
                 <p className="text-[#8a7355] font-bold tracking-widest uppercase text-xs">AI Culinary Forge</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant section */}
        <div className="flex flex-col md:flex-row items-center gap-12 pb-20">
          <div className="flex-1 space-y-6">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1a1008] to-[#120a05] border border-[#5c4020] flex items-center justify-center shadow-lg shadow-[#5c4020]/20">
              <Bot className="h-6 w-6 text-[#c9a84c]" />
            </div>
            <h2 className="text-3xl font-bold text-[#e8d9b8]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your Personal Automaton
            </h2>
            <p className="text-[#8a7355] leading-relaxed text-sm md:text-base">
              Our AI Assistant is always present, either in the corner of your screen or in its dedicated console page. Powered entirely by local models (like Ollama), your data stays on your machine. Ask it to troubleshoot a project, find a substitute for eggs, or explain how a tool works.
            </p>
            <ul className="space-y-3 text-[#c4a882] text-sm">
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> Context-aware: it knows what you're currently building.</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> 100% private local intelligence.</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#8b6914]" /> Accessible via global drawer or dedicated full-page console.</li>
            </ul>
          </div>
          <div className="flex-1 w-full">
            <div className="rounded-xl border border-[#3d2510] bg-[#120a05] p-2 shadow-[0_0_30px_rgba(139,105,20,0.1)] relative">
               <div className="absolute inset-0 bg-gradient-to-br from-[#1a1008] to-[#0a0604] z-0 rounded-xl" />
               <img src="/steampunk-robot.png" alt="AI Automaton" className="w-full h-auto rounded-lg relative z-10 opacity-70 mix-blend-screen" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
