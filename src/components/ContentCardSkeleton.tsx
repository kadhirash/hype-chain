export default function ContentCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl overflow-hidden border border-cyan-500/20 animate-pulse">
      {/* Media Preview Skeleton */}
      <div className="aspect-video bg-gradient-to-br from-cyan-900/50 to-blue-900/30" />
      
      {/* Content Skeleton */}
      <div className="p-6">
        <div className="h-6 bg-white/10 rounded-lg mb-3 w-3/4" />
        <div className="h-4 bg-white/5 rounded-lg mb-4 w-1/2" />
        
        {/* Stats Skeleton */}
        <div className="flex gap-4 mb-4">
          <div className="h-4 bg-white/5 rounded w-16" />
          <div className="h-4 bg-white/5 rounded w-16" />
          <div className="h-4 bg-white/5 rounded w-20" />
        </div>
        
        {/* Button Skeleton */}
        <div className="h-10 bg-white/10 rounded-lg w-full" />
      </div>
    </div>
  );
}

