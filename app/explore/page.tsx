'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ExplorePage() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/content?limit=50');
      if (!response.ok) throw new Error('Failed to load content');
      
      const data = await response.json();
      setContent(data.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading viral content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Explore Viral Chains
          </h1>
          <p className="text-xl text-gray-300">
            Discover trending content and see viral attribution in action
          </p>
        </div>

        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-200 text-lg">{error}</p>
          </div>
        ) : content.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              No Content Yet
            </h3>
            <p className="text-xl text-gray-400 mb-8">
              Be the first to create viral content!
            </p>
            <Link
              href="/create"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
            >
              Create Content
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="group bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200 hover:transform hover:scale-[1.02]"
              >
                {/* Media Preview */}
                <div className="aspect-video bg-gradient-to-br from-cyan-900/50 to-blue-900/30 relative overflow-hidden flex items-center justify-center">
                  {item.media_url ? (
                    <>
                      <img
                        src={item.media_url.includes('picsum.photos') ? `${item.media_url}?random=${item.id}` : item.media_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0 z-10"
                        onError={(e) => {
                          e.currentTarget.classList.add('hidden');
                        }}
                      />
                      {/* Fallback pattern if image fails */}
                      <div className="absolute inset-0 z-0 flex items-center justify-center">
                        <div className="text-cyan-400/30 text-9xl font-black">?</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-cyan-400/30 text-9xl font-black">?</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-20" />
                  <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-30">
                    <h3 className="text-white font-bold text-xl line-clamp-2 drop-shadow-lg">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-black/40 rounded-lg p-3 text-center border border-cyan-500/10">
                      <p className="text-cyan-400 font-bold text-2xl">{item.total_shares || 0}</p>
                      <p className="text-gray-400 text-xs mt-1">Shares</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 text-center border border-blue-500/10">
                      <p className="text-blue-400 font-bold text-2xl">{item.total_engagements || 0}</p>
                      <p className="text-gray-400 text-xs mt-1">Engages</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-3 text-center border border-green-500/10">
                      <p className="text-green-400 font-bold text-lg">{formatNumber(item.total_revenue_lamports || 0)}</p>
                      <p className="text-gray-400 text-xs mt-1">Revenue</p>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-lg p-3 border border-white/10">
                    <p className="text-gray-400 text-xs mb-1.5">Creator</p>
                    <p className="text-white font-mono text-xs truncate">
                      {item.creator_wallet}
                    </p>
                  </div>

                  {item.deleted_shares > 0 && (
                    <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2">
                      <span className="text-red-400 text-xs font-semibold">
                        {item.deleted_shares} deleted share{item.deleted_shares !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

