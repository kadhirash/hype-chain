import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-20">
          <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/20 rounded-full border border-cyan-500/30">
            <span className="text-cyan-300 text-sm font-semibold">Built on Somnia</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tight">
            Hype<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Chain</span>
          </h1>
          <p className="text-3xl text-gray-300 font-light">
            Proof-of-Hype: Reward the Entire Viral Chain
          </p>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/30 backdrop-blur-xl rounded-3xl px-8 py-10 md:px-12 md:py-12 border border-cyan-500/20 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Reward Everyone Who Makes Content Go Viral
            </h2>
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              Traditional platforms only reward creators. HypeChain tracks the entire viral chain 
              and rewards everyone who shared, from the original creator to the person who made it explode.
            </p>
            <div className="flex gap-4 flex-wrap items-center justify-between">
              <Link
                href="/create"
                className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 hover:scale-105 text-center"
              >
                Create Content
              </Link>
              <Link
                href="/explore"
                className="inline-block px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-lg transition-all duration-200 border border-white/30 hover:border-white/50 text-center"
              >
                Explore Viral Chains
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200 hover:transform hover:scale-105">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-3">1. Create</h3>
              <p className="text-gray-300 leading-relaxed">
                Upload your content and get tracked on-chain. Receive your unique shareable link.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200 hover:transform hover:scale-105">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-2xl font-bold text-white mb-3">2. Share</h3>
              <p className="text-gray-300 leading-relaxed">
                Share your link. Every share creates a parent-child relationship in the viral tree.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200 hover:transform hover:scale-105">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-white mb-3">3. Earn</h3>
              <p className="text-gray-300 leading-relaxed">
                When content generates revenue, everyone in the viral chain gets rewarded based on their contribution.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">
            Built on Somnia
          </h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start gap-4">
              <span className="text-cyan-400 font-bold text-xl">✓</span>
              <p className="text-lg">
                <strong className="text-white">Smart Contracts:</strong> Deployed on Somnia Dream Testnet for transparent viral attribution
              </p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-cyan-400 font-bold text-xl">✓</span>
              <p className="text-lg">
                <strong className="text-white">Data Streams:</strong> Real-time event tracking shows viral chains as they happen
              </p>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-cyan-400 font-bold text-xl">✓</span>
              <p className="text-lg">
                <strong className="text-white">High Performance:</strong> Sub-second finality for instant share tracking
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-400">
          <p>Built for Somnia Data Streams Hackathon</p>
          <p className="mt-2">
            <a
              href="https://github.com/kadhirash/hype-chain"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-white transition"
            >
              View on GitHub →
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

