'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContentDetailPage({ params }: { params: Promise<{ contentId: string }> }) {
  const [contentId, setContentId] = useState<string>('');
  const [content, setContent] = useState<any>(null);
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(p => {
      setContentId(p.contentId);
      loadContent(p.contentId);
    });
  }, [params]);

  const loadContent = async (id: string) => {
    try {
      const [contentRes, treeRes] = await Promise.all([
        fetch(`/api/content/${id}`),
        fetch(`/api/shares/${id}/tree`),
      ]);

      if (!contentRes.ok) throw new Error('Content not found');

      const contentData = await contentRes.json();
      const treeData = treeRes.ok ? await treeRes.json() : null;

      setContent(contentData);
      setTree(treeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const renderTreeNode = (node: any, level: number = 0) => {
    return (
      <div key={node.id} className="ml-8">
        <div className="flex items-center gap-3 py-2">
          <div className="text-2xl">{level === 0 ? '👤' : '🔗'}</div>
          <div className="flex-1 bg-white/10 rounded-lg p-3 border border-cyan-500/20">
            <p className="text-white font-mono text-sm truncate">
              {node.wallet_address}
            </p>
            <div className="flex gap-4 text-sm text-gray-400 mt-1">
              <span>Depth: {node.share_depth}</span>
              <span>Clicks: {node.click_count}</span>
              <span>Earnings: {node.earnings_lamports} lamports</span>
            </div>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="border-l-2 border-cyan-500/30 ml-4">
            {node.children.map((child: any) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading content...</div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition mb-4 inline-block">
          ← Back to Home
        </Link>

        {/* Content Header */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">
            {content.title}
          </h1>
          
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Total Shares</p>
              <p className="text-3xl font-bold text-cyan-400">{content.total_shares}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Engagements</p>
              <p className="text-3xl font-bold text-blue-400">{content.total_engagements}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-400">{content.total_revenue_lamports}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Max Depth</p>
              <p className="text-3xl font-bold text-purple-400">{tree?.maxDepth || 0}</p>
            </div>
          </div>

          <div className="bg-black/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Creator</p>
            <p className="text-white font-mono text-sm">{content.creator_wallet}</p>
          </div>
        </div>

        {/* Viral Tree */}
        {tree && tree.tree && tree.tree.length > 0 ? (
          <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">
              Viral Share Tree
            </h2>
            
            {tree.levelStats && (
              <div className="mb-6 flex gap-4 flex-wrap">
                {tree.levelStats.map((stat: any) => (
                  <div key={stat.level} className="bg-black/30 rounded-lg px-4 py-2">
                    <span className="text-gray-400 text-sm">Level {stat.level}: </span>
                    <span className="text-white font-semibold">{stat.shareCount} shares</span>
                  </div>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              {tree.tree.map((node: any) => renderTreeNode(node))}
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Shares Yet
            </h3>
            <p className="text-gray-400">
              Be the first to share this content and start the viral chain!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

