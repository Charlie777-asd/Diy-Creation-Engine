import React from 'react';
import { X } from 'lucide-react';

export default function SmallWindowModal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-xl border border-[#5c4020] bg-gradient-to-b from-[#1a1008] to-[#0a0502] p-5 shadow-[0_0_30px_rgba(200,168,76,0.15)] animate-fade-up">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 text-[#8a7355] hover:text-[#c9a84c] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-bold tracking-widest text-[#c9a84c] uppercase mb-4 border-b border-[#3d2510] pb-2">
          {title}
        </h3>
        <div className="max-h-64 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
