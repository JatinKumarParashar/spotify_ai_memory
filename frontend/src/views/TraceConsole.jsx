import React, { useState } from 'react';
import { sendChat } from '../services/api';
import { Terminal, Database, Play } from 'lucide-react';

export default function TraceConsole({ userId }) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await sendChat(userId, prompt);
      setResult(res.data);
    } catch (err) {
      console.error("Chat request failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-white font-sans">
      <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-green-400 flex items-center gap-2">
          <Terminal className="w-5 h-5" /> AI DJ Prompt Sandbox
        </h2>
        <form onSubmit={handleChatSubmit} className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Recommend 3 tracks for late night study, no metal"
            className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-green-500"
            rows="3"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold py-2.5 rounded-lg text-sm flex justify-center items-center gap-2 transition"
          >
            <Play className="w-4 h-4" /> {loading ? "Evaluating Memory Context..." : "Send Request"}
          </button>
        </form>

        {result?.reply && (
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="text-xs font-bold text-gray-400 mb-1">AI DJ RESPONSE:</h4>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{result.reply}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
          <Database className="w-5 h-5" /> Retrieved Context & Trace
        </h2>
        {result ? (
          <pre className="bg-black p-4 rounded-lg text-green-300 font-mono text-xs overflow-x-auto max-h-[380px]">
            {JSON.stringify(result.trace, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500 text-sm bg-gray-950 p-8 rounded-lg border border-gray-800 text-center">
            Execute a prompt to inspect live graph exclusions and injected JSON context blocks.
          </p>
        )}
      </div>
    </div>
  );
}