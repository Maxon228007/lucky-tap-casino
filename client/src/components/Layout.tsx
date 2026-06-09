import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  balance: number;
  userName?: string;
}

export default function Layout({ children, balance, userName }: LayoutProps) {
  return (
    <div className="flex flex-col h-full bg-dark-900">
      <header className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
            {userName ? userName[0].toUpperCase() : '?'}
          </div>
          <span className="text-sm font-medium truncate max-w-[100px]">
            {userName || 'Player'}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-dark-700 rounded-full px-3 py-1.5">
          <div className="coin w-5 h-5 text-[10px] font-bold">$</div>
          <span className="font-bold text-sm text-secondary">
            {balance.toLocaleString()}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {children}
      </main>
    </div>
  );
}
