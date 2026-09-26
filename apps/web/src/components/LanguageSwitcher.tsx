"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/language-context";

export interface LanguageSwitcherProps {
  variant?: "dark" | "light" | "compact";
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "light",
  className = "",
}) => {
  const { language, setLanguage, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonStyle =
    variant === "dark"
      ? "bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700"
      : variant === "compact"
      ? "bg-transparent hover:bg-stone-100 text-stone-700 border-stone-300"
      : "bg-white hover:bg-stone-50 text-stone-800 border-stone-300 shadow-2xs";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${buttonStyle}`}
        aria-expanded={isOpen}
        aria-label="Select Language"
        title="Switch Language / भाषा बदलें"
      >
        <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="font-medium flex items-center gap-1">
          <span>{currentLanguageOption.flag}</span>
          <span className="hidden sm:inline">{currentLanguageOption.nativeLabel}</span>
        </span>
        <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white text-stone-900 shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50/80 border-b border-stone-100 mb-1">
            🌐 Select Language
          </div>
          <div className="max-h-60 overflow-y-auto py-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as LanguageCode);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-50 text-amber-900 font-bold"
                      : "hover:bg-stone-100 text-stone-700 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                    <span className="text-[10px] text-stone-400 font-mono">({lang.label})</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
