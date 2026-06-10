import React from 'react';
import { User } from '../utils/api';

interface HomePageProps {
  user: User;
  onNavigate: (page: 'home' | 'spin' | 'slots') => void;
}

export default function HomePage({ user, onNavigate }: HomePageProps) {
  return (
    <div className="flex flex-col items-center gap-6 pt-6">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          LuckyTap Casino
        </h1>
        <p className="text-gray-400 text-sm mt-1">Spin & Win Big!</p>
      </div>

      <div className="glass-card w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Balance</span>
          <span className="text-2xl font-extrabold text-secondary">
            {user.balance.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Daily Spins</span>
          <span className="text-xl font-bold text-primary">
            {user.spins_remaining}/3
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Earned</span>
          <span className="text-lg font-semibold text-green-400">
            +{user.total_earned.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <button
          onClick={() => onNavigate('spin')}
          className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all active:scale-95"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
            🎡
          </div>
          <span className="font-bold">Turn to Earn</span>
          <span className="text-xs text-gray-400">Spin daily wheel</span>
        </button>

        <button
          onClick={() => onNavigate('slots')}
          className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-white/10 transition-all active:scale-95"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center text-3xl">
            🎰
          </div>
          <span className="font-bold">Slots</span>
          <span className="text-xs text-gray-400">Play slot machine</span>
        </button>
      </div>

      <div className="w-full max-w-sm glass-card p-3 text-center cursor-pointer hover:bg-white/5 transition">
        <div className="h-16 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded flex items-center justify-center border border-dashed border-gray-600">
          <span className="text-gray-500 text-sm">— Ad Banner —</span>
        </div>
      </div>

      <div className="glass-card w-full max-w-sm p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Total Wagered</span>
            <p className="font-bold">{user.total_wagered.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Joined</span>
            <p className="font-bold text-xs">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
