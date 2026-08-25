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
    await editMemory(id, editText);
    setEditingId(null);
    loadData();
  };

  const handleDelete = async (id) => {
    setMemories(memories.filter((m) => m.id !== id));
    await deleteMemory(id);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white font-sans">
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
        <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Add Preference or Hard Exclusion
        </h3>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Acoustic guitar focus, No Heavy Metal"
            value={newFact}
            onChange={(e) => setNewFact(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-green-500"
          />
          <select
            value={prefType}
            onChange={(e) => setPrefType(e.target.value)}
            className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
          >
            <option value="PREFERS">PREFERS</option>
            <option value="EXCLUDES">EXCLUDES</option>
          </select>
          <button type="submit" className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2 rounded-lg text-sm transition">
            Save
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold">Active Remembered Preferences ({memories.length})</h3>
        {memories.length === 0 ? (
          <p className="text-gray-500 text-sm bg-gray-900 p-6 rounded-xl border border-gray-800 text-center">
            No active preferences stored yet.
          </p>
        ) : (
          memories.map((mem) => (
            <div key={mem.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
              <div className="space-y-1">
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                  mem.type === 'EXCLUDES' ? 'bg-red-900/60 text-red-300' : 'bg-green-900/60 text-green-300'
                }`}>
                  {mem.type}
                </span>
                
                {editingId === mem.id ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="bg-gray-800 border border-green-500 px-2 py-1 rounded text-sm text-white"
                    />
                    <button onClick={() => handleSaveEdit(mem.id)} className="bg-green-500 text-black px-3 py-1 rounded text-xs font-bold">
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-medium mt-1">{mem.fact}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Confidence: {(mem.confidence * 100).toFixed(0)}%
                  </span>
                  <span>|</span>
                  <span>ID: {mem.id}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingId(mem.id); setEditText(mem.fact); }}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="p-2 bg-red-900/40 hover:bg-red-800 text-red-300 rounded-lg transition"
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