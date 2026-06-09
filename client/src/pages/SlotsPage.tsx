import React from 'react';
import SlotMachine from '../components/SlotMachine';

interface SlotsPageProps {
  balance: number;
  onSpin: (bet: number) => Promise<{ reels: { name: string; id: number }[]; winAmount: number; balance: number }>;
  onBack: () => void;
}

export default function SlotsPage({ balance, onSpin, onBack }: SlotsPageProps) {
  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          ← Back
        </button>
        <h2 className="text-xl font-bold">Slot Machine</h2>
        <div className="text-sm text-gray-400">
          <span className="text-secondary font-bold">{balance.toLocaleString()}</span>
        </div>
      </div>

      <SlotMachine balance={balance} onSpin={onSpin} />

      <div className="glass-card w-full max-w-sm p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Paytable</h3>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { symbol: '🍒', payout: '2x', desc: 'Three match' },
            { symbol: '🍋', payout: '3x', desc: 'Three match' },
            { symbol: '🍊', payout: '5x', desc: 'Three match' },
            { symbol: '🍇', payout: '8x', desc: 'Three match' },
            { symbol: '💎', payout: '15x', desc: 'Three match' },
            { symbol: '7️⃣', payout: '25x', desc: 'Three match' },
            { symbol: '⭐', payout: '50x', desc: 'Three match' },
            { symbol: '👑', payout: '100x', desc: 'Jackpot!' },
          ].map((item) => (
            <div key={item.symbol} className="bg-dark-700 rounded-lg p-2">
              <div className="text-2xl">{item.symbol}</div>
              <div className="font-bold text-secondary">{item.payout}</div>
              <div className="text-[9px] text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
