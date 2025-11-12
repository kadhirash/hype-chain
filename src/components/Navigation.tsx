'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/src/contexts/WalletContext';

export default function Navigation() {
  const pathname = usePathname();
  const { address, isConnected, connect, disconnect } = useWallet();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-black border-b border-cyan-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl font-black text-white group-hover:scale-110 transition-transform">
              Hype<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Chain</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/explore"
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                isActive('/explore')
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/create"
              className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-200 ${
                isActive('/create')
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white hover:from-cyan-500 hover:to-blue-600 hover:scale-105'
              }`}
            >
              Create
            </Link>
            <Link
              href="/profile"
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                isActive('/profile')
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Profile
            </Link>

            {/* Wallet Connection */}
            {isConnected && address ? (
              <div className="flex items-center gap-4">
                <div className="px-5 py-2.5 bg-white/10 rounded-lg border border-cyan-500/30 text-cyan-300 font-mono text-sm">
                  {truncateAddress(address)}
                </div>
                <button
                  onClick={disconnect}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 text-gray-300 hover:text-white hover:bg-red-500/20 border border-red-500/30"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="px-8 py-3 rounded-lg font-bold transition-all duration-200 bg-white/10 hover:bg-white/20 text-white border border-cyan-500/30 hover:border-cyan-500/60"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

