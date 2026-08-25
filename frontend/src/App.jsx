import React, { useState } from 'react';
import MemoryControls from './views/MemoryControls';
import TraceConsole from './views/TraceConsole';
import { Sliders, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('controls');
  const userId = 'user_demo_1';

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold text-lg text-green-400">Spotify AI Memory System</span>
          <span className="text-xs bg-gray-800 border border-gray-700 px-2.5 py-1 rounded text-gray-300">
            User: <strong className="text-white">{userId}</strong>
          </span>
        </div>

        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button
            onClick={() => setActiveTab('controls')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'controls' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Listener Controls
          </button>
          <button
            onClick={() => setActiveTab('trace')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'trace' ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Trace Console
          </button>
        </div>
      </header>

      <main className="py-6">
        {activeTab === 'controls' ? <MemoryControls userId={userId} /> : <TraceConsole userId={userId} />}
      </main>
    </div>
  );
}