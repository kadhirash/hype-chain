'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Activity = {
  type: 'share' | 'engagement';
  id: string;
  wallet: string;
  contentId: string;
  contentTitle: string;
  timestamp: string;
  depth?: number;
  engagementType?: string;
};

export default function LiveFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/activity/recent?limit=10');
      if (!response.ok) throw new Error('Failed to fetch activities');
      
      const data = await response.json();
      setActivities(data.activities || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    
    // Poll for new activities every 5 seconds
    const interval = setInterval(loadActivities, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Force re-render every second to update counter
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Show more activities to ensure scrolling is needed
  const displayActivities = activities.slice(0, 20);

  const formatWallet = (wallet: string) => {
    if (!wallet || wallet === 'Unknown') return 'Unknown';
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getLastUpdatedTime = () => {
    return lastUpdated.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
  };

  const getTimeSinceUpdate = () => {
    // Use tick to force re-render every second
    const _ = tick;
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    return seconds;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          </div>
          <h3 className="text-xl font-bold text-white">Live Activity</h3>
        </div>
        <p className="text-gray-400 text-sm">Loading recent activity...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20" data-tick={tick}>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          </div>
          <h3 className="text-xl font-bold text-white">Live Activity</h3>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Powered by Somnia Data Streams</span>
          <span className="font-mono text-cyan-400">
            Updated: {lastUpdated.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              timeZoneName: 'short'
            })} ({Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago)
          </span>
        </div>
      </div>

      {activities.length === 0 ? (
        <p className="text-gray-400 text-sm">No recent activity</p>
      ) : (
        <div className="space-y-3 force-scrollbar" style={{ height: '400px', overflowY: 'scroll' }}>
          {displayActivities.map((activity, index) => (
            <Link
              key={`${activity.type}-${activity.id}-${index}`}
              href={`/content/${activity.contentId}`}
              className="block group"
            >
              <div className="bg-black/30 hover:bg-black/50 rounded-lg p-3 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'share' 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {activity.type === 'share' ? '🔗' : '👁️'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white font-mono text-sm break-all">
                        {formatWallet(activity.wallet)}
                      </span>
                      <span className="text-gray-400 text-xs whitespace-nowrap">
                        {activity.type === 'share' 
                          ? `shared${activity.depth ? ` (depth ${activity.depth})` : ''}` 
                          : activity.engagementType || 'engaged'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm truncate group-hover:text-cyan-300 transition break-words">
                      {activity.contentTitle}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

