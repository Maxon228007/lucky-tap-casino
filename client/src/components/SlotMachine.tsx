import React, { useState, useCallback } from 'react';

interface SlotSymbol {
  name: string;
  id: number;
}

interface SlotMachineProps {
  onSpin: (bet: number) => Promise<{ reels: SlotSymbol[]; winAmount: number; balance: number }>;
  balance: number;
}

const BET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function SlotMachine({ onSpin, balance }: SlotMachineProps) {
  const [reels, setReels] = useState<SlotSymbol[]>([
    { name: '🍒', id: 0 },
    { name: '🍒', id: 0 },
    { name: '🍒', id: 0 },
  ]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [animatingReels, setAnimatingReels] = useState<boolean[]>([false, false, false]);

  const allSymbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐', '👑'];

  const handleSpin = useCallback(async () => {
    if (spinning || balance < bet) return;

    setSpinning(true);
    setWinAmount(null);
    setMessage(null);

    setAnimatingReels([true, true, true]);

    const intervalId = setInterval(() => {
      setReels([
        { name: allSymbols[Math.floor(Math.random() * allSymbols.length)], id: 0 },
        { name: allSymbols[Math.floor(Math.random() * allSymbols.length)], id: 1 },
        { name: allSymbols[Math.floor(Math.random() * allSymbols.length)], id: 2 },
      ]);
    }, 100);

    try {
      const result = await onSpin(bet);

      clearInterval(intervalId);

      setTimeout(() => {
        setReels(result.reels);
        setAnimatingReels([false, false, false]);

        setTimeout(() => {
          if (result.winAmount > 0) {
            setWinAmount(result.winAmount);
            setMessage(`🎉 You won ${result.winAmount} coins!`);
          } else {
            setMessage('😔 No win this time. Try again!');
          }

          setTimeout(() => {
            setMessage(null);
            setWinAmount(null);
          }, 2500);
        }, 300);
      }, 500);
    } catch (err: any) {
      clearInterval(intervalId);
      setAnimatingReels([false, false, false]);
      setMessage(err.message || 'Error spinning');
    } finally {
      setSpinning(false);
    }

    return () => clearInterval(intervalId);
  }, [spinning, balance, bet, onSpin, allSymbols]);

  const getWinColor = () => {
    if (winAmount === null) return '';
    if (winAmount >= 100) return 'text-yellow-300';
    if (winAmount >= 50) return 'text-green-400';
    if (winAmount > 0) return 'text-blue-300';
    return '';
  };

  const isSameReel = (reel: SlotSymbol[]) => {
    return reel[0].name === reel[1].name && reel[1].name === reel[2].name;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 slot-reel p-4">
        {reels.map((symbol, i) => (
          <div
            key={i}
            className={`w-20 h-20 flex items-center justify-center text-4xl bg-dark-600 rounded-lg transition-all duration-50 ${
              animatingReels[i] ? 'scale-105 opacity-80' : ''
            } ${!spinning && isSameReel(reels) ? 'ring-2 ring-secondary' : ''}`}
          >
            {symbol.name}
          </div>
        ))}
      </div>

      {message && (
        <div className={`text-lg font-bold animate-bounce-in ${getWinColor()}`}>
          {message}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {BET_AMOUNTS.map(amount => (
          <button
            key={amount}
            onClick={() => setBet(amount)}
            disabled={spinning}
            className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition-all ${
              bet === amount
                ? 'bg-primary text-white'
                : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
            } ${balance < amount ? 'opacity-40' : ''}`}
          >
            {amount}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 w-full max-w-xs">
        <div className="flex-1 text-center text-sm text-gray-400">
          Bet: <span className="text-secondary font-bold">{bet}</span>
        </div>
        <button
          onClick={handleSpin}
          disabled={spinning || balance < bet}
          className="btn-primary flex-1 text-lg"
        >
          {spinning ? 'SPINNING...' : '🎰 SPIN'}
        </button>
      </div>

      {!spinning && reels[0].name === reels[1].name && reels[1].name === reels[2].name && (
        <div className="text-center text-sm text-gray-400 mt-1">
          Matched: <span className="text-secondary font-bold">{reels[0].name}</span>
        </div>
      )}
    </div>
  );
}
