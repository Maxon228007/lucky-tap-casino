import React, { useState } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SpinPage from './pages/SpinPage';
import SlotsPage from './pages/SlotsPage';
import { useUser } from './hooks/useUser';

type Page = 'home' | 'spin' | 'slots';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const { user, loading, error, claimSpin, playSlots, refreshUser } = useUser();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading LuckyTap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-900 p-4">
        <div className="glass-card p-6 text-center max-w-sm">
          <p className="text-accent font-bold mb-2">Connection Error</p>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleClaimSpin = async () => {
    const result = await claimSpin();
    await refreshUser();
    return result;
  };

  const handleSlotsSpin = async (bet: number) => {
    const result = await playSlots(bet);
    return result;
  };

  const userName = user.first_name || user.username || 'Player';

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage user={user} onNavigate={(p) => setPage(p)} />;
      case 'spin':
        return (
          <SpinPage
            spinsRemaining={user.spins_remaining}
            onClaim={handleClaimSpin}
            onBack={() => setPage('home')}
          />
        );
      case 'slots':
        return (
          <SlotsPage
            balance={user.balance}
            onSpin={handleSlotsSpin}
            onBack={() => setPage('home')}
          />
        );
    }
  };

  return (
    <Layout balance={user.balance} userName={userName}>
      {renderPage()}
    </Layout>
  );
}
