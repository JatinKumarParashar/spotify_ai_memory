import React, { useState, useEffect } from 'react';
import { getMemories, addMemory, editMemory, deleteMemory } from '../services/api';
import { Trash2, Edit2, ShieldCheck, Sparkles } from 'lucide-react';

export default function MemoryControls({ userId }) {
  const [memories, setMemories] = useState([]);
  const [newFact, setNewFact] = useState('');
  const [prefType, setPrefType] = useState('PREFERS');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const loadData = async () => {
    try {
      const res = await getMemories(userId);
      setMemories(res.data);
    } catch (err) {
      console.error("Failed to load user memories:", err);
    }
  };

  useEffect(() => { loadData(); }, [userId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    await addMemory({ userId, fact: newFact, prefType, confidence: 1.0 });
    setNewFact('');
    loadData();
  };

  const handleSaveEdit = async (id) => {
    await editMemory(id, editText, userId);
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    setMemories(memories.filter((m) => m.id !== id));
    await deleteMemory(id, userId);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 text-white">
      <header className="border-b border-gray-800 pb-5">
        <p className="signal-kicker mb-2 text-[10px] uppercase text-lime-300">Memory registry / 01</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Memory Controls</h1>
            <p className="mt-1 text-sm text-gray-400">Manage the preferences and exclusions used for personalization.</p>
          </div>
          <span className="signal-mono text-xs text-gray-500">{memories.length.toString().padStart(2, '0')} ACTIVE</span>
        </div>
      </header>

      <section className="border-b border-gray-800 pb-7">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-100">
          <Sparkles className="h-4 w-4 text-lime-300" /> Add a memory
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px_auto]">
          <input
            type="text"
            placeholder="e.g. Prefers acoustic guitar"
            value={newFact}
            onChange={(e) => setNewFact(e.target.value)}
            className="min-w-0 rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-lime-300"
          />
          <select
            value={prefType}
            onChange={(e) => setPrefType(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-200 focus:border-cyan-300"
          >
            <option value="PREFERS">PREFERS</option>
            <option value="EXCLUDES">EXCLUDES</option>
          </select>
          <button type="submit" className="rounded-md bg-lime-300 px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-lime-200">
            Save memory
          </button>
        </form>
      </section>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-100">Active memories</h2>
          <span className="text-xs text-gray-500">Preferences and exclusions currently in use</span>
        </div>
        {memories.length === 0 ? (
          <p className="border-y border-gray-800 py-8 text-center text-sm text-gray-500">
            No active memories yet. Add a preference above to get started.
          </p>
        ) : (
          memories.map((mem) => (
            <div key={mem.id} className="grid gap-4 border-b border-gray-800 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0 space-y-2">
                <span className={`signal-mono inline-flex rounded border px-2 py-1 text-[10px] font-semibold ${
                  mem.type === 'EXCLUDES' ? 'border-red-400/20 bg-red-400/5 text-red-300' : 'border-lime-300/20 bg-lime-300/5 text-lime-200'
                }`}>
                  {mem.type}
                </span>
                
                {editingId === mem.id ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-cyan-300/50 bg-gray-900 px-3 py-2 text-sm text-white sm:max-w-lg"
                    />
                    <button onClick={() => handleSaveEdit(mem.id)} className="rounded-md bg-lime-300 px-3 py-2 text-xs font-semibold text-gray-950">
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="break-words text-sm font-medium text-gray-100">{mem.fact}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" /> Confidence {(mem.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="signal-mono text-[10px] text-gray-600">ID {mem.id}</span>
                </div>
              </div>

              <div className="flex gap-2 sm:justify-end">
                <button
                  onClick={() => { setEditingId(mem.id); setEditText(mem.fact); }}
                  title="Edit memory"
                  aria-label="Edit memory"
                  className="rounded-md border border-gray-700 p-2 text-gray-400 transition hover:border-cyan-300/40 hover:text-cyan-200"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(mem.id)}
                  title="Delete memory"
                  aria-label="Delete memory"
                  className="rounded-md border border-gray-700 p-2 text-gray-400 transition hover:border-red-400/40 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}