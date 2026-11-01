import React, { useState } from 'react';
import { sendChat } from '../services/api';
import { Activity, Database, Play, Terminal } from 'lucide-react';

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
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 text-white lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="space-y-5">
        <header className="border-b border-gray-800 pb-5">
          <p className="signal-kicker mb-2 text-[10px] uppercase text-cyan-300">Generation / 02</p>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-white">
            <Terminal className="h-5 w-5 text-lime-300" /> Trace Console
          </h1>
          <p className="mt-1 text-sm text-gray-400">Run a prompt and inspect which memories enter the response.</p>
        </header>
        <form onSubmit={handleChatSubmit} className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Recommend 3 tracks for late night study, no metal"
            className="min-h-36 w-full resize-y rounded-md border border-gray-700 bg-gray-900 p-4 text-sm leading-6 text-gray-100 placeholder:text-gray-600 focus:border-cyan-300"
            rows={5}
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-lime-300 px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-lime-200 disabled:cursor-wait disabled:opacity-50"
          >
            <Play className="h-4 w-4" /> {loading ? "Evaluating context..." : "Run request"}
          </button>
        </form>

        {result?.reply && (
          <div className="border-l-2 border-lime-300 bg-gray-900/70 p-4">
            <p className="signal-kicker mb-2 text-[10px] uppercase text-lime-200">AI response</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-200">{result.reply}</p>
          </div>
        )}
      </section>

      <section className="min-w-0 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-5">
          <div>
            <p className="signal-kicker mb-2 text-[10px] uppercase text-cyan-300">Observability / 03</p>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Database className="h-4 w-4 text-cyan-300" /> Retrieved context
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Activity className="h-3.5 w-3.5" /> {result ? "Trace captured" : "Waiting for request"}
          </span>
        </div>
        {result ? (
          <pre className="signal-mono max-h-[540px] overflow-auto border border-gray-800 bg-[#0a0e12] p-4 text-xs leading-5 text-cyan-100">
            {JSON.stringify(result.trace, null, 2)}
          </pre>
        ) : (
          <p className="border border-dashed border-gray-700 bg-gray-900/40 p-8 text-center text-sm leading-6 text-gray-500">
            The request trace will appear here with retrieved memories and the context sent to the model.
          </p>
        )}
      </section>
    </div>
  );
}