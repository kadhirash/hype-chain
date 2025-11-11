'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ExplorePage() {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="group bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200 hover:transform hover:scale-105"
              >
                {/* Media Preview */}
                <div className="aspect-video bg-black/50 relative overflow-hidden">
                  {item.media_url && (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-cyan-400 font-bold text-xl">{item.total_shares || 0}</p>
                      <p className="text-gray-400 text-xs">Shares</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-blue-400 font-bold text-xl">{item.total_engagements || 0}</p>
                      <p className="text-gray-400 text-xs">Engages</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-green-400 font-bold text-xl">{item.total_revenue_lamports || 0}</p>
                      <p className="text-gray-400 text-xs">Revenue</p>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-2">
                    <p className="text-gray-400 text-xs mb-1">Creator</p>
                    <p className="text-white font-mono text-xs truncate">
                      {item.creator_wallet}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

