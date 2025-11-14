'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useWallet } from '@/src/contexts/WalletContext';
import { toast } from '@/src/components/Toast';
import { ContentDetailResponse, ViralTreeResponse, ShareResponse, RevenueResponse } from '@/src/types/api';
import { Content, Share } from '@/src/lib/supabase';
import { copyToClipboard } from '@/src/utils/clipboard';
import { isValidWalletAddress, getWalletAddressError } from '@/src/utils/validation';

export default function ContentDetailPage({ params }: { params: Promise<{ contentId: string }> }) {
  const { address, isConnected, connect } = useWallet();
  const [contentId, setContentId] = useState<string>('');
  const [content, setContent] = useState<Content | null>(null);
  const [stats, setStats] = useState<ContentDetailResponse['stats'] | null>(null);
  const [tree, setTree] = useState<ViralTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [newShare, setNewShare] = useState<Share | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState('');
  const [addingRevenue, setAddingRevenue] = useState(false);
  const [deletingShareId, setDeletingShareId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [deletingContent, setDeletingContent] = useState(false);
  const [confirmDeleteContent, setConfirmDeleteContent] = useState(false);
  const [copyingPageUrl, setCopyingPageUrl] = useState(false);
  const [copyingShareLink, setCopyingShareLink] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => {
      setContentId(p.contentId);
      loadContent(p.contentId);
    });
  }, [params]);

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    }
  }, [isConnected, address]);

  const loadContent = async (id: string) => {
    try {
      setImageLoadFailed(false); // Reset image state
      setImageLoaded(false);
      const [contentRes, treeRes] = await Promise.all([
        fetch(`/api/content/${id}`),
        fetch(`/api/shares/${id}/tree`),
      ]);

      if (!contentRes.ok) throw new Error('Content not found');

      const contentData: ContentDetailResponse = await contentRes.json();
      const treeData: ViralTreeResponse | null = treeRes.ok ? await treeRes.json() : null;

      setContent(contentData.content);
      setStats(contentData.stats);
      setTree(treeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPageUrl = async () => {
    if (!copyingPageUrl) {
      setCopyingPageUrl(true);
      const url = window.location.href;
      await copyToClipboard(url);
      setCopyingPageUrl(false);
    }
  };

  const handleCreateShare = async () => {
    if (!walletAddress) {
      toast.error('Please enter your wallet address');
      return;
    }
    
    if (!isValidWalletAddress(walletAddress)) {
      const error = getWalletAddressError(walletAddress);
      setWalletError(error);
      toast.error(error || 'Please enter a valid wallet address');
      return;
    }
    
    setWalletError(null);

    setCreating(true);
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          wallet_address: walletAddress,
          parent_share_id: tree?.creatorShare?.id || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create share');

      const data: ShareResponse = await response.json();
      setNewShare(data.share);
      
      // Optimistically update the stats
      if (stats) {
        setStats({
          ...stats,
          shares: (stats.shares || 0) + 1
        });
      }
      
      // Reload full content and tree to get latest data
      await loadContent(contentId);
      toast.success('Share created successfully!');
    } catch (err) {
      toast.error('Failed to create share. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (newShare?.share_url && !copyingShareLink) {
      setCopyingShareLink(true);
      await copyToClipboard(newShare.share_url);
      setCopyingShareLink(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const handleAddRevenue = async () => {
    const amount = parseInt(revenueAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setAddingRevenue(true);
    try {
      const response = await fetch('/api/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          amount_lamports: amount,
        }),
      });

      if (!response.ok) throw new Error('Failed to add revenue');

      const data: RevenueResponse = await response.json();
      toast.success(`Revenue distributed! ${data.distributions.length} sharers received payments.`);
      setRevenueAmount('');
      
      // Reload content and tree to show updated earnings
      await loadContent(contentId);
    } catch (err) {
      toast.error('Failed to add revenue. Please try again.');
    } finally {
      setAddingRevenue(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    setDeleting(true);
    setDeleteMessage(null);
    
    try {
      const response = await fetch(`/api/share/${shareId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteMessage({ type: 'error', text: data.error || 'Failed to delete share' });
        return;
      }

      setDeleteMessage({ type: 'success', text: 'Share deleted successfully! The viral chain structure is preserved.' });
      setDeletingShareId(null);
      
      // Reload content and tree to show updated state
      await loadContent(contentId);
      
      // Clear success message after 5 seconds
      setTimeout(() => setDeleteMessage(null), 5000);
    } catch (err) {
      setDeleteMessage({ type: 'error', text: 'Failed to delete share. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteContent = async () => {
    setDeletingContent(true);
    setDeleteMessage(null);
    
    try {
      const response = await fetch(`/api/content/${contentId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteMessage({ type: 'error', text: data.error || 'Failed to delete content' });
        return;
      }

      setDeleteMessage({ 
        type: 'success', 
        text: 'Content deleted successfully! Redirecting to explore page...' 
      });
      setConfirmDeleteContent(false);
      
      // Redirect to explore page after 2 seconds
      setTimeout(() => {
        window.location.href = '/explore';
      }, 2000);
    } catch (err) {
      setDeleteMessage({ type: 'error', text: 'Failed to delete content. Please try again.' });
    } finally {
      setDeletingContent(false);
    }
  };

  const isImageUrl = (url: string) => {
    if (!url) return false;
    // Check if URL ends with common image extensions or is from image hosting sites
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    const imageHosts = /picsum\.photos|imgur\.com|redd\.it/i;
    return imageExtensions.test(url) || imageHosts.test(url);
  };

  // Component to calculate dynamic chain height
  const ChainLink = ({ parentRef, childRef, childIndex, totalChildren }: { parentRef: React.RefObject<HTMLDivElement>, childRef: React.RefObject<HTMLDivElement>, childIndex: number, totalChildren: number }) => {
    const [chainHeight, setChainHeight] = useState<string>('1.5rem');
    const [hoverHeight, setHoverHeight] = useState<string>('1.5rem');
    const [chainCount, setChainCount] = useState<number>(4);
    const chainContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const calculateHeight = () => {
        if (parentRef.current && childRef.current) {
          const parentRect = parentRef.current.getBoundingClientRect();
          const childRect = childRef.current.getBoundingClientRect();
          
          // Calculate distance between parent bottom and child top
          const distance = childRect.top - parentRect.bottom;
          
          // Add some spacing for the horizontal connector
          const calculatedHeight = Math.max(1.5 * 16, distance - 8); // Minimum 1.5rem, subtract 8px for connector
          const calculatedHeightRem = `${calculatedHeight / 16}rem`;
          
          setChainHeight(calculatedHeightRem);
          
          // For hover height, use the calculated height or a reasonable max
          const hoverHeightPx = Math.min(calculatedHeight, 18 * 16); // Max 18rem
          setHoverHeight(`${hoverHeightPx / 16}rem`);
          
          // Calculate chain count based on height (roughly 1 chain per 16px)
          const count = Math.max(4, Math.ceil(calculatedHeight / 16));
          setChainCount(Math.min(count, 30)); // Cap at 30 chains
        }
      };

      // Wait for layout to complete before calculating
      const timeoutId = setTimeout(() => {
        calculateHeight();
      }, 0);
      
      // Recalculate on window resize
      window.addEventListener('resize', calculateHeight);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', calculateHeight);
      };
    }, [parentRef, childRef]);

    useEffect(() => {
      const parentCard = parentRef.current;
      const childCard = childRef.current;
      const chainContainer = chainContainerRef.current;
      
      if (!parentCard || !childCard || !chainContainer) return;

      const handleParentHover = () => {
        if (chainContainer) {
          chainContainer.style.height = hoverHeight;
        }
      };
      
      const handleParentLeave = () => {
        if (chainContainer) {
          chainContainer.style.height = '0px';
        }
      };
      
      const handleChildHover = () => {
        if (chainContainer) {
          chainContainer.style.height = hoverHeight;
        }
      };
      
      const handleChildLeave = () => {
        if (chainContainer) {
          chainContainer.style.height = '0px';
        }
      };

      parentCard.addEventListener('mouseenter', handleParentHover);
      parentCard.addEventListener('mouseleave', handleParentLeave);
      childCard.addEventListener('mouseenter', handleChildHover);
      childCard.addEventListener('mouseleave', handleChildLeave);

      return () => {
        parentCard.removeEventListener('mouseenter', handleParentHover);
        parentCard.removeEventListener('mouseleave', handleParentLeave);
        childCard.removeEventListener('mouseenter', handleChildHover);
        childCard.removeEventListener('mouseleave', handleChildLeave);
      };
    }, [parentRef, childRef, hoverHeight]);

    return (
      <>
        {/* Vertical line - hidden */}
        <div 
          className="absolute -left-6 bottom-full w-0.5 bg-transparent transition-all pointer-events-none" 
          style={{ height: chainHeight }}
        />
        
        {/* Horizontal line - hidden */}
        <div className="absolute -left-6 top-2 w-6 h-0.5 bg-transparent transition-all pointer-events-none" />
        
        {/* Vertical chains - grow on parent hover OR this child's hover */}
        <div 
          ref={chainContainerRef}
          className="absolute -left-7 bottom-full flex flex-col-reverse gap-0 overflow-hidden transition-all duration-500 h-0 pointer-events-none"
        >
          {Array.from({ length: chainCount }).map((_, i) => (
            <div
              key={i}
              className="text-cyan-400/70 text-base leading-tight transition-all duration-300 opacity-0 scale-50 group-hover/parentcard:opacity-100 group-hover/parentcard:scale-100 group-hover/thischild:opacity-100 group-hover/thischild:scale-100 group-hover/parentcard:text-cyan-300 group-hover/thischild:text-cyan-300 group-hover/parentcard:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover/thischild:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{
                transitionDelay: `${i * 30}ms`,
              }}
            >
              ⛓️
            </div>
          ))}
        </div>
      </>
    );
  };

  // Component for child node with ref
  const ChildNodeWithRef = ({ child, childIndex, parentRef, level, totalChildren }: { child: any, childIndex: number, parentRef: React.RefObject<HTMLDivElement>, level: number, totalChildren: number }) => {
    const childRef = useRef<HTMLDivElement>(null);
    
    return (
      <div className="relative group/thischild" ref={childRef}>
        <ChainLink 
          parentRef={parentRef} 
          childRef={childRef} 
          childIndex={childIndex} 
          totalChildren={totalChildren} 
        />
      
        {/* Horizontal chains - grow on parent hover OR this child's hover */}
        <div className="absolute -left-6 top-1 flex gap-0 overflow-hidden transition-all duration-500 w-0 group-hover/parentcard:w-6 group-hover/thischild:w-6 pointer-events-none">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="text-cyan-400/70 text-sm leading-none transition-all duration-300 opacity-0 scale-50 group-hover/parentcard:opacity-100 group-hover/parentcard:scale-100 group-hover/thischild:opacity-100 group-hover/thischild:scale-100 group-hover/parentcard:text-cyan-300 group-hover/thischild:text-cyan-300 group-hover/parentcard:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover/thischild:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{
                transitionDelay: `${childIndex === 1 ? 240 : 120}ms`,
              }}
            >
              ⛓️
            </div>
          ))}
        </div>
        
        <TreeNode node={child} level={level + 1} />
      </div>
    );
  };

  // TreeNode component - proper React component to use hooks
  const TreeNode = ({ node, level = 0 }: { node: any, level?: number }) => {
    const parentRef = useRef<HTMLDivElement>(null);
    
    return (
      <div className="relative group/parentcard" ref={parentRef}>
        <div className="flex items-center gap-3 py-3">
          {level === 0 && (
            <div className="text-2xl transition-transform group-hover/parentcard:scale-125 group-hover/parentcard:rotate-12 duration-300">
              👤
            </div>
          )}
          <div className={`flex-1 rounded-lg p-3 border transition-all duration-300 ${
            node.is_deleted
              ? 'bg-red-900/20 border-red-500/40 opacity-60'
              : 'bg-white/10 border-cyan-500/20 group-hover/parentcard:border-cyan-500/60 group-hover/parentcard:bg-white/20 group-hover/parentcard:shadow-lg group-hover/parentcard:shadow-cyan-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <p className={`font-mono text-sm truncate ${node.is_deleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                {node.is_deleted ? '[Deleted]' : node.wallet_address}
              </p>
              {node.is_deleted && (
                <span className="text-xs text-red-400 font-semibold px-2 py-0.5 bg-red-500/20 rounded">
                  Deleted
                </span>
              )}
            </div>
            {node.is_deleted && node.deleted_at && (
              <p className="text-xs text-red-400/70 mt-1">
                Deleted: {new Date(node.deleted_at).toLocaleString()}
              </p>
            )}
            <div className="flex gap-4 text-sm text-gray-400 mt-1">
              <span>Depth: {node.share_depth}</span>
              <span>Clicks: {node.click_count}</span>
              <span>Earnings: {formatNumber(node.earnings_lamports)} lamports</span>
            </div>
            {!node.is_deleted && isConnected && address && node.wallet_address.toLowerCase() === address.toLowerCase() && (
              <div className="mt-2 flex gap-2">
                {deletingShareId === node.id ? (
                  <>
                    <button
                      onClick={() => handleDeleteShare(node.id)}
                      disabled={deleting}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded font-semibold transition"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => setDeletingShareId(null)}
                      disabled={deleting}
                      className="px-3 py-1 text-xs bg-gray-500/20 hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded border border-gray-500/40 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeletingShareId(node.id)}
                    className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded border border-red-500/40 transition"
                  >
                    Delete My Share
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="ml-12 space-y-6 mt-6 relative">
            {node.children.map((child: any, childIndex: number) => (
              <ChildNodeWithRef 
                key={child.id}
                child={child}
                childIndex={childIndex}
                parentRef={parentRef}
                level={level}
                totalChildren={node.children.length}
              />
            ))}
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
        <div className="flex gap-4 mb-6">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
            ← Home
          </Link>
          <span className="text-gray-600">/</span>
          <Link href="/explore" className="text-cyan-400 hover:text-cyan-300 transition">
            Explore
          </Link>
        </div>

        {/* Delete Message Toast */}
        {deleteMessage && (
          <div className={`mb-6 rounded-xl p-4 border ${
            deleteMessage.type === 'success' 
              ? 'bg-green-500/20 border-green-500/50 text-green-200' 
              : 'bg-red-500/20 border-red-500/50 text-red-200'
          } flex items-center justify-between`}>
            <span>{deleteMessage.text}</span>
            <button 
              onClick={() => setDeleteMessage(null)}
              className="ml-4 text-gray-300 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Content Header */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-3xl overflow-hidden border border-cyan-500/20 mb-6">
          {/* Try to load image in background */}
          {content?.media_url && isImageUrl(content.media_url) && (
            <img
              src={content.media_url.includes('picsum.photos') ? `${content.media_url}?random=${content.id}` : content.media_url}
              alt=""
              className="hidden"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoadFailed(true)}
            />
          )}

          {/* Show successful image */}
          {imageLoaded && (
            <div className="aspect-video bg-gradient-to-br from-cyan-900/50 to-blue-900/30 relative overflow-hidden">
              <img
                src={content.media_url.includes('picsum.photos') ? `${content.media_url}?random=${content.id}` : content.media_url}
                alt={content.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                  {content.title}
                </h1>
              </div>
            </div>
          )}

          {/* Show title header by default (until image loads) */}
          {!imageLoaded && (
            <div className="relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(34, 211, 238, 0.15) 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }} />
              </div>
              <div className="relative p-16 border-b border-cyan-500/20">
                <h1 className="text-6xl font-bold text-white text-center">
                  {content?.title}
                </h1>
              </div>
            </div>
          )}

          <div className="p-8">
            
            <div className="grid md:grid-cols-5 gap-6 mb-6">
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Total Shares</p>
              <p className="text-3xl font-bold text-cyan-400">{stats?.shares || 0}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Active Shares</p>
              <p className="text-3xl font-bold text-green-400">{tree?.activeShares || 0}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Deleted Shares</p>
              <p className="text-3xl font-bold text-red-400">{tree?.deletedShares || 0}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-yellow-400">{formatNumber(content?.total_revenue_lamports || 0)}</p>
              <p className="text-xs text-gray-500">lamports</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Max Depth</p>
              <p className="text-3xl font-bold text-purple-400">{tree?.maxDepth || 0}</p>
            </div>
          </div>

            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Creator</p>
              <p className="text-white font-mono text-sm">{content?.creator_wallet}</p>
            </div>
          </div>
        </div>

        {/* Share Section - Moved Up */}
        <div className="bg-gradient-to-br from-green-900/30 to-cyan-900/20 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">🚀</div>
            <div>
              <h2 className="text-3xl font-bold text-white">Join the Viral Chain</h2>
              <p className="text-gray-300">Get your personalized share link and earn when it goes viral!</p>
            </div>
          </div>

          {!newShare ? (
            <div className="space-y-4">
              {/* Quick Copy */}
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Quick Share</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  />
                  <button
                    onClick={handleCopyPageUrl}
                    disabled={copyingPageUrl}
                    className="px-6 py-2.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                  >
                    {copyingPageUrl ? 'Copying...' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Get Personalized Link */}
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Get Your Personalized Link</p>
                <p className="text-gray-500 text-xs mb-3">
                  {isConnected && address ? 'Using connected wallet' : 'Enter your wallet to track earnings from your shares'}
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => {
                        const value = e.target.value;
                        setWalletAddress(value);
                        const error = getWalletAddressError(value);
                        setWalletError(error);
                      }}
                      placeholder="0x..."
                      readOnly={isConnected && !!address}
                      className={`flex-1 px-4 py-2.5 rounded-lg border text-white placeholder-gray-500 focus:outline-none ${
                        isConnected && address
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 cursor-not-allowed'
                          : walletError
                          ? 'bg-white/10 border-red-500/50 focus:ring-2 focus:ring-red-500'
                          : 'bg-white/10 border-white/20 focus:ring-2 focus:ring-green-500'
                      }`}
                    />
                    {!isConnected && (
                      <button
                        onClick={connect}
                        className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition whitespace-nowrap"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </div>
                  {walletError && (
                    <p className="text-red-400 text-sm">{walletError}</p>
                  )}
                  <button
                    onClick={handleCreateShare}
                    disabled={creating || !walletAddress || !!walletError}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-bold transition shadow-lg disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating Share...' : 'Get My Share Link'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-green-400 text-sm mb-2 font-semibold">✓ Your Share Link Created!</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={newShare.share_url}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                />
                <button
                  onClick={handleCopyShareLink}
                  disabled={copyingShareLink}
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                >
                  {copyingShareLink ? 'Copying...' : 'Copy Link'}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Share this link! When others click and share, you'll earn a portion of the revenue.
              </p>
            </div>
          )}
        </div>

        {/* Revenue Section (Creator Only) */}
        {isConnected && address && content?.creator_wallet?.toLowerCase() === address.toLowerCase() && (
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 mb-6">
            <h2 className="text-3xl font-bold text-white mb-4">Add Revenue</h2>
            <p className="text-gray-300 mb-6">
              Add revenue to this content and it will be automatically distributed across the entire viral chain based on contribution.
            </p>
            
            <div className="bg-black/30 rounded-xl p-6">
              <label htmlFor="revenue" className="block text-white font-semibold mb-2">
                Revenue Amount (lamports)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  id="revenue"
                  value={revenueAmount}
                  onChange={(e) => setRevenueAmount(e.target.value)}
                  placeholder="1000000"
                  min="1"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddRevenue}
                  disabled={addingRevenue || !revenueAmount}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-bold transition shadow-lg"
                >
                  {addingRevenue ? 'Distributing...' : 'Distribute Revenue'}
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Revenue will be split proportionally across all sharers, with earlier sharers earning more.
              </p>
            </div>
          </div>
        )}

        {/* Delete Content Section (Creator Only) */}
        {isConnected && address && content?.creator_wallet?.toLowerCase() === address.toLowerCase() && (
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/20 backdrop-blur-xl rounded-3xl p-8 border border-red-500/20 mb-6">
            <h2 className="text-3xl font-bold text-white mb-4">Delete Content</h2>
            <p className="text-gray-300 mb-6">
              {tree?.activeShares > 0 ? (
                <>
                  Cannot delete content while active shares exist. {tree.activeShares} sharer{tree.activeShares !== 1 ? 's are' : ' is'} still active and can earn revenue.
                  {tree?.deletedShares > 0 && (
                    <span className="block text-yellow-400 mt-2">
                      {tree.deletedShares} share{tree.deletedShares !== 1 ? 's are' : ' is'} deleted, but active shares remain.
                    </span>
                  )}
                </>
              ) : (
                <>
                  All shares have been deleted. You can now remove this content from the explore page.
                  <span className="block text-yellow-400 mt-2">
                    This action cannot be undone.
                  </span>
                </>
              )}
            </p>
            
            <div className="bg-black/30 rounded-xl p-6">
              {tree?.activeShares > 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    💡 You must delete all shares first before you can delete this content. This protects active sharers who deserve to earn revenue.
                  </p>
                </div>
              ) : !confirmDeleteContent ? (
                <button
                  onClick={() => setConfirmDeleteContent(true)}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/40 font-semibold transition"
                >
                  Delete This Content
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-200 font-semibold">⚠️ Are you sure?</p>
                    <p className="text-red-300 text-sm mt-1">
                      This content will be removed from the explore page. The viral chain data will be preserved for analytics.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteContent}
                      disabled={deletingContent}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition"
                    >
                      {deletingContent ? 'Deleting...' : 'Yes, Delete Content'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteContent(false)}
                      disabled={deletingContent}
                      className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg border border-gray-500/40 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
              {tree.tree.map((node: any) => (
                <TreeNode key={node.id} node={node} level={0} />
              ))}
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

