"use client";

import React, { useState } from "react";

export interface NirnayLogoProps {
  variant?: "dark" | "light" | "auto";
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  subtitle?: string;
  iconOnly?: boolean;
  className?: string;
}

export const NirnayLogo: React.FC<NirnayLogoProps> = ({
  variant = "auto",
  size = "md",
  showSubtitle = true,
  subtitle,
  iconOnly = false,
  className = "",
}) => {
  const [imgSrc, setImgSrc] = useState<string>("/logo-icon.png");
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  const sizeClasses = {
    sm: {
      img: "w-7 h-7",
      title: "text-base",
      subtitle: "text-[9px]",
    },
    md: {
      img: "w-9 h-9",
      title: "text-lg",
      subtitle: "text-[10px]",
    },
    lg: {
      img: "w-11 h-11",
      title: "text-xl",
      subtitle: "text-[11px]",
    },
  }[size];

  const textColor =
    variant === "dark"
      ? "text-stone-100"
      : variant === "light"
      ? "text-stone-900"
      : "text-current";

  const subtitleColor =
    variant === "dark"
      ? "text-amber-400 bg-stone-800/80 border-stone-700"
      : "text-amber-700 bg-amber-50 border-amber-200/80";

  const handleImageError = () => {
    if (imgSrc === "/logo-icon.png") {
      setImgSrc("/logo.png");
    } else if (imgSrc === "/logo.png") {
      setImgSrc("/icon.png");
    } else {
      setImgFailed(true);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {!imgFailed ? (
        <img
          src={imgSrc}
          onError={handleImageError}
          alt="NIRNAY Logo"
          className={`${sizeClasses.img} object-contain shrink-0 rounded-lg shadow-2xs transition-transform hover:scale-105`}
        />
      ) : (
        <div
          className={`${sizeClasses.img} rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white font-serif font-black flex items-center justify-center text-xs shadow-xs shrink-0`}
        >
          N
        </div>
      )}

      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-serif font-extrabold tracking-wide ${sizeClasses.title} ${textColor}`}>
              NIRNAY
            </span>
            {showSubtitle && subtitle && (
              <span
                className={`font-mono ${sizeClasses.subtitle} px-1.5 py-0.5 rounded border font-semibold hidden sm:inline-block ${subtitleColor}`}
              >
                {subtitle}
              </span>
            )}
          </div>
          {showSubtitle && !subtitle && (
            <span
              className={`font-mono text-[9px] font-bold tracking-wider uppercase mt-0.5 text-stone-500 dark:text-stone-400`}
            >
              PEOPLE • IDEAS • IMPACT
            </span>
          )}
        </div>
      )}
    </div>
  );
};
