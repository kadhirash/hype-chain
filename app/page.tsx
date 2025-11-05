export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-gradient">
            HypeChain
          </h1>
          <p className="text-2xl text-gray-300">
            Proof-of-Hype: On-Chain Viral Attribution
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Reward the entire share chain, not just the creator. 
            Track every view, share, and engagement in real-time on Somnia.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-2">Create Content</h3>
              <p className="text-gray-400">Mint your content as an NFT on Somnia</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold mb-2">Share & Earn</h3>
              <p className="text-gray-400">Get a unique link and earn from every click</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Real-Time Tracking</h3>
              <p className="text-gray-400">Watch your viral tree grow instantly</p>
            </div>
          </div>

          <div className="mt-12 space-x-4">
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition">
              Connect Wallet
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-lg transition border border-white/20">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

