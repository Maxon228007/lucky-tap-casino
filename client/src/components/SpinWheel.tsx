import React, { useState, useRef, useEffect } from 'react';

const SEGMENTS = [
  { label: '1', value: 1, color: '#8774E1' },
  { label: '2', value: 2, color: '#FFD700' },
  { label: '5', value: 5, color: '#FF6B6B' },
  { label: '10', value: 10, color: '#4CAF50' },
  { label: '20', value: 20, color: '#FF9800' },
  { label: '50', value: 50, color: '#E040FB' },
  { label: '100', value: 100, color: '#00BCD4' },
  { label: '500', value: 500, color: '#F44336' },
];

interface SpinWheelProps {
  onSpinComplete: (reward: number) => void;
  disabled?: boolean;
  spinning: boolean;
  onSpinStart: () => void;
}

export default function SpinWheel({ onSpinComplete, disabled, spinning, onSpinStart }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [displayedReward, setDisplayedReward] = useState<number | null>(null);

  const handleSpin = () => {
    if (disabled || spinning) return;

    onSpinStart();

    const segmentAngle = 360 / SEGMENTS.length;
    const targetSegment = Math.floor(Math.random() * SEGMENTS.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const targetRotation = rotation + (extraSpins * 360) + (targetSegment * segmentAngle) + (segmentAngle / 2);

    setRotation(targetRotation);

    setTimeout(() => {
      const reward = SEGMENTS[targetSegment].value;
      setDisplayedReward(reward);
      setTimeout(() => {
        onSpinComplete(reward);
        setDisplayedReward(null);
      }, 1500);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div
          className="spin-wheel"
          style={{
            width: 280,
            height: 280,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {SEGMENTS.map((seg, i) => {
            const angle = (360 / SEGMENTS.length) * i - 90;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  width: 0,
                  height: 0,
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <div
                  className="absolute flex items-center justify-center text-white font-bold"
                  style={{
                    width: 120,
                    height: 30,
                    transformOrigin: '0 50%',
                    transform: `rotate(${360 / SEGMENTS.length / 2}deg)`,
                    marginLeft: 20,
                    marginTop: -15,
                  }}
                >
                  <span
                    className="text-lg font-extrabold drop-shadow-lg"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    {seg.label}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="absolute inset-0 rounded-full border-4 border-primary/30" />

          <div
            className="absolute top-1/2 left-1/2 w-0 h-0 z-10"
            style={{
              marginLeft: -10,
              marginTop: -140,
            }}
          >
            <div
              className="w-5 h-8"
              style={{
                clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                background: '#FFD700',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={disabled || spinning}
          className="spin-button absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
          }}
        >
          {spinning ? '...' : 'SPIN'}
        </button>
      </div>

      {displayedReward !== null && (
        <div className="animate-bounce-in text-center">
          <div className="text-3xl font-extrabold text-secondary mb-1">
            +{displayedReward} coins!
          </div>
          <div className="text-sm text-gray-400">Reward claimed</div>
        </div>
      )}
    </div>
  );
}
