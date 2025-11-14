'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LiveFeed from '@/src/components/LiveFeed';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import ContentCardSkeleton from '@/src/components/ContentCardSkeleton';
import { ContentListResponse } from '@/src/types/api';
import { Content } from '@/src/lib/supabase';

export default function ExplorePage() {
  const router = useRouter();
  const [content, setContent] = useState<ContentListResponse['content']>([]);
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
      
      const data: ContentListResponse = await response.json();
      setContent(data.content || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition mb-8 inline-block">
            ← Back to Home
          </Link>

          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-3">
              Explore Viral Chains
            </h1>
            <p className="text-xl text-gray-300">
              Discover trending content and see viral attribution in action
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Live Feed Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-4">
                <LiveFeed />
              </div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ContentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition mb-8 inline-block">
          ← Back to Home
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-3">
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
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-3xl p-16 border border-cyan-500/20 text-center animate-fade-in">
            <div className="text-7xl mb-6 animate-bounce">🎨</div>
            <h3 className="text-4xl font-bold text-white mb-4">
              No Content Yet
            </h3>
            <p className="text-xl text-gray-300 mb-10 max-w-md mx-auto">
              Be the first to create viral content and start building your viral chain!
            </p>
            <Link
              href="/create"
              className="inline-block px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
            >
              Create Content
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Live Feed Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-4">
                <LiveFeed />
              </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {content.map((item, index) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="group bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
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

                  {/* Share Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/content/${item.id}`);
                    }}
                    className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white rounded-lg font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-green-500/50 text-center"
                  >
                    🚀 Share & Earn
                  </button>
                </div>
              </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

