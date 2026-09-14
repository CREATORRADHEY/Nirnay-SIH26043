"use client";

import { useState } from "react";
import { ProductSidebar } from "./ProductSidebar";
import { ProductTopbar } from "./ProductTopbar";

interface ProductShellProps {
  children: React.ReactNode;
  isDemo?: boolean;
}

export function ProductShell({ children, isDemo = true }: ProductShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <ProductSidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ProductTopbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          isDemo={isDemo}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
