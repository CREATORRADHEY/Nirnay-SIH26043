"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronUp, Check } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/language-context";

export const FloatingLanguageWidget: React.FC = () => {
  const { language, setLanguage, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40" ref={widgetRef}>
      {isOpen && (
        <div className="mb-2.5 w-48 rounded-2xl bg-stone-900/95 backdrop-blur text-stone-100 shadow-2xl border-2 border-amber-500/80 py-2 p-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 right-0 absolute">
          <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-stone-800 mb-1 flex items-center justify-between">
            <span>🌐 Choose Language</span>
            <span className="text-stone-400 font-normal">8 Available</span>
          </div>
          <div className="max-h-60 overflow-y-auto py-0.5 space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-600 text-white font-bold"
                      : "hover:bg-stone-800 text-stone-300 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                    <span className="text-[10px] text-stone-400 font-mono">({lang.label})</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-stone-900/90 hover:bg-stone-900 backdrop-blur text-stone-100 shadow-xl border border-stone-700 hover:border-amber-500 text-xs font-bold transition-all cursor-pointer group active:scale-95"
        aria-label="Toggle Language Switcher"
        title="Change Platform Language / भाषा बदलें"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
        <span className="flex items-center gap-1">
          <span>{currentLanguageOption.flag}</span>
          <span>{currentLanguageOption.nativeLabel}</span>
        </span>
        <ChevronUp className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
};
