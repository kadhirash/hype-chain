'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/src/contexts/WalletContext';

export default function Navigation() {
  const pathname = usePathname();
  const { address, isConnected, connect, disconnect } = useWallet();

  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(path + '/') || pathname.includes(path);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-black border-b border-cyan-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Brand and Navigation Links - Grouped together */}
          <div className="flex items-center" style={{ paddingLeft: '0.8rem' }}>
            {/* Logo */}
            <Link href="/" className="group flex-shrink-0 py-2.5">
              <div className="text-2xl md:text-3xl font-black text-white group-hover:scale-110 transition-transform">
                Hype<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Chain</span>
              </div>
            </Link>
            
            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-4" style={{ marginLeft: 'calc(-100% - 2px)', paddingLeft: '1.25rem' }}>
            <Link
              href="/explore"
              className={`pr-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                isActive('/explore')
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/create"
              className={`px-5 py-2.5 rounded-lg font-bold transition-all duration-200 ${
                isActive('/create')
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white hover:from-cyan-500 hover:to-blue-600 hover:scale-105'
              }`}
            >
              Create
            </Link>
            <Link
              href="/profile"
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 text-white shadow-lg ${
                isActive('/profile')
                  ? ''
                  : 'hover:scale-105'
              }`}
              style={isActive('/profile')
                ? { background: 'linear-gradient(to right, #6366f1, #8b5cf6)', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.5)' }
                : { background: 'transparent', color: '#d1d5db' }}
              onMouseEnter={(e) => {
                if (!isActive('/profile')) {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/profile')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#d1d5db';
                }
              }}
            >
              Profile
            </Link>
            <Link
              href="/leaderboard"
              className={`px-5 py-2.5 rounded-lg font-bold transition-all duration-200 text-white shadow-lg ${
                isActive('/leaderboard')
                  ? ''
                  : 'hover:scale-105'
              }`}
              style={isActive('/leaderboard')
                ? { background: 'linear-gradient(to right, #10b981, #0d9488)', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.5)' }
                : { background: 'linear-gradient(to right, rgba(16, 185, 129, 0.8), rgba(13, 148, 136, 0.8))' }}
              onMouseEnter={(e) => {
                if (!isActive('/leaderboard')) {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgba(16, 185, 129, 0.9), rgba(13, 148, 136, 0.9))';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/leaderboard')) {
                  e.currentTarget.style.background = 'linear-gradient(to right, rgba(16, 185, 129, 0.8), rgba(13, 148, 136, 0.8))';
                }
              }}
            >
              Leaderboard
            </Link>
            <Link
              href="/analytics"
              className={`px-5 py-2.5 rounded-lg font-bold transition-all duration-200 ${
                isActive('/analytics')
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-gradient-to-r from-purple-500/80 to-pink-600/80 text-white hover:from-purple-500 hover:to-pink-600 hover:scale-105'
              }`}
            >
              Analytics
            </Link>
            </div>
          </div>

          {/* Desktop Wallet Connection - Only show on desktop */}
          <div className="hidden lg:flex items-center">
            {isConnected && address ? (
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="px-4 py-2.5 bg-white/10 rounded-lg border border-cyan-500/30 text-cyan-300 font-mono text-sm whitespace-nowrap">
                  {truncateAddress(address)}
                </div>
                <button
                  onClick={disconnect}
                  className="px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 text-gray-300 hover:text-white hover:bg-red-500/20 border border-red-500/30 whitespace-nowrap"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="px-8 py-3 rounded-lg font-bold transition-all duration-200 bg-white/10 hover:bg-white/20 text-white border border-cyan-500/30 hover:border-cyan-500/60 whitespace-nowrap flex-shrink-0"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Wallet Connection - Only show on mobile */}
          <div className="lg:hidden flex items-center gap-2">
            {isConnected && address ? (
              <>
                <div className="px-3 py-2 bg-white/10 rounded-lg border border-cyan-500/30 text-cyan-300 font-mono text-xs">
                  {truncateAddress(address)}
                </div>
                <button
                  onClick={disconnect}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-red-500/20 border border-red-500/30"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-cyan-500/30"
              >
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden mt-3 flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <Link
            href="/explore"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap flex-shrink-0 ${
              isActive('/explore')
                ? 'bg-cyan-500 text-white'
                : 'text-gray-300 bg-white/10'
            }`}
          >
            Explore
          </Link>
          <Link
            href="/create"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap flex-shrink-0 ${
              isActive('/create')
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-white/10 text-gray-300'
            }`}
          >
            Create
          </Link>
          <Link
            href="/profile"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap flex-shrink-0 text-white ${
              isActive('/profile')
                ? ''
                : 'bg-white/10 text-gray-300'
            }`}
            style={isActive('/profile')
              ? { background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }
              : {}}
          >
            Profile
          </Link>
              <Link
                href="/leaderboard"
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap flex-shrink-0 text-white ${
                  isActive('/leaderboard')
                    ? ''
                    : 'bg-white/10 text-gray-300'
                }`}
                style={isActive('/leaderboard')
                  ? { background: 'linear-gradient(to right, #10b981, #0d9488)' }
                  : {}}
              >
                Leaderboard
              </Link>
              <Link
                href="/analytics"
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all text-xs whitespace-nowrap flex-shrink-0 ${
                  isActive('/analytics')
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                Analytics
              </Link>
        </div>
      </div>
    </nav>
  );
}

