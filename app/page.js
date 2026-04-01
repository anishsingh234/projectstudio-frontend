import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center w-full">
        
        {/* Left Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
            Gemini-powered
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter leading-tight">
              Build faster with<br />your AI copilot.
            </h1>
            <p className="text-xl text-white/70 max-w-lg">
              Chat with context, generate ideas, and ship projects — all in one calm workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link 
              href="/projects" 
              className="px-8 py-3.5 bg-white text-black rounded-2xl font-medium hover:bg-white/90 transition"
            >
              Start a project →
            </Link>
            
            <Link 
              href="/projects" 
              className="px-6 py-3.5 text-white/70 hover:text-white border border-white/20 rounded-2xl transition"
            >
              View projects
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/60 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-9 w-9 rounded-full border-2 border-zinc-950 bg-zinc-800"
                />
              ))}
            </div>
            <span>Teams get started in &lt; 5 minutes</span>
          </div>
        </div>

        {/* Right Panel - Minimal Dashboard */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 bg-zinc-950/70 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm text-white/60">Live Overview</p>
              <p className="text-2xl font-semibold tracking-tight">Projects Pulse</p>
            </div>
            <div className="px-4 py-1.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Synced now
            </div>
          </div>

          <div className="space-y-3">
            {[
              { title: "Design System", status: "Active", color: "emerald" },
              { title: "Growth Experiments", status: "Planning", color: "amber" },
              { title: "Image Playground", status: "Research", color: "sky" },
            ].map((project, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition border border-white/5"
              >
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-sm text-white/60 mt-0.5">{project.status}</p>
                </div>
                <div className={`px-4 py-1 rounded-full text-xs bg-${project.color}-500/10 text-${project.color}-400 border border-${project.color}-500/20`}>
                  On track
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs text-white/60">Avg response</p>
              <p className="text-3xl font-semibold mt-2">1.2s</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs text-white/60">Images generated</p>
              <p className="text-3xl font-semibold mt-2">128</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}