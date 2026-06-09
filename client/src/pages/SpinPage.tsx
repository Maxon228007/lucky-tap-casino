import React, { useState } from 'react';
import SpinWheel from '../components/SpinWheel';

interface SpinPageProps {
  spinsRemaining: number;
  onClaim: () => Promise<{ reward: number; spinsRemaining: number; balance: number }>;
  onBack: () => void;
}

export default function SpinPage({ spinsRemaining, onClaim, onBack }: SpinPageProps) {
  const [spinning, setSpinning] = useState(false);

  const handleSpinStart = () => {
    setSpinning(true);
  };

  const handleSpinComplete = async (reward: number) => {
    try {
      await onClaim();
    } catch (err: any) {
      console.error(err);
    }
    setSpinning(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          ← Back
        </button>
        <h2 className="text-xl font-bold">Turn to Earn</h2>
        <div className="text-sm text-gray-400">
          <span className="text-primary font-bold">{spinsRemaining}</span>/3
        </div>
      </div>

      <div className="glass-card w-full max-w-sm p-4 text-center">
        <p className="text-sm text-gray-400 mb-1">
          Spin the wheel to earn coins!
        </p>
        <p className="text-xs text-gray-500">
          {spinsRemaining > 0
            ? `You have ${spinsRemaining} spins left today`
            : 'No spins left. Come back tomorrow!'}
        </p>
      </div>

      <SpinWheel
        onSpinComplete={handleSpinComplete}
        disabled={spinsRemaining <= 0}
        spinning={spinning}
        onSpinStart={handleSpinStart}
      />

      <div className="glass-card w-full max-w-sm p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Prize Table</h3>
        <div className="grid grid-cols-4 gap-2 text-center text-sm">
          {[
            { value: 1, color: 'text-primary' },
            { value: 2, color: 'text-secondary' },
            { value: 5, color: 'text-red-400' },
            { value: 10, color: 'text-green-400' },
            { value: 20, color: 'text-orange-400' },
            { value: 50, color: 'text-purple-400' },
            { value: 100, color: 'text-cyan-400' },
            { value: 500, color: 'text-red-500' },
          ].map((prize) => (
            <div key={prize.value} className="bg-dark-700 rounded-lg p-2">
              <div className={`font-bold ${prize.color}`}>{prize.value}</div>
              <div className="text-[10px] text-gray-500">coins</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
