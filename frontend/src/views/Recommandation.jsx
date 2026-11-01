import React, { useEffect, useState } from "react";
import { AlertCircle, ExternalLink, Headphones, Music2, RefreshCw, Sparkles } from "lucide-react";
import { getMemories } from "../services/api";

const Recommandation = ({ userId }) => {
  const [memories, setMemories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const fetchMemories = async () => {
      setLoading(true);
      setError("");

      if (!userId) {
        setMemories([]);
        setError("Your account could not be identified. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await getMemories(userId);
        if (isCurrent) setMemories(response.data);
      } catch (error) {
        if (isCurrent) {
          setError(error.response?.data?.error || error.message || "Unable to fetch memories.");
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchMemories();
    return () => {
      isCurrent = false;
    };
  }, [userId, reloadKey]);

  const preferences = memories.filter((memory) => memory.type !== "EXCLUDES");
  const exclusions = memories.filter((memory) => memory.type === "EXCLUDES");

  return (
    <section className="mx-auto max-w-5xl space-y-8 px-6 text-white">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <p className="signal-kicker mb-2 flex items-center gap-2 text-[10px] uppercase text-lime-300">
              <Sparkles className="h-4 w-4" /> Personalized for you
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Your listening profile</h1>
            <p className="mt-1 text-sm text-gray-400">
              Explore Spotify using the preferences you’ve saved.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading}
            title="Refresh preferences"
            aria-label="Refresh preferences"
            className="rounded-md border border-gray-700 bg-gray-900 p-2 text-gray-300 transition hover:border-cyan-300/50 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </header>

        {error && (
          <div role="alert" className="flex items-start gap-3 border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 border-y border-gray-800 py-6 text-sm text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin text-cyan-300" /> Loading your preferences...
          </div>
        ) : !error && memories.length === 0 ? (
          <div className="border-y border-gray-800 px-6 py-10 text-center">
            <Headphones className="mx-auto mb-3 h-8 w-8 text-cyan-300" />
            <h2 className="text-base font-semibold text-white">Your profile is ready to grow</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-400">
              Add a preference in Listener Controls to see personalized Spotify searches here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-gray-100">Explore your preferences</h2>
                <span className="signal-mono text-[10px] text-gray-500">{preferences.length.toString().padStart(2, "0")} SAVED</span>
              </div>
              {preferences.length === 0 ? (
                <p className="border-y border-gray-800 py-4 text-sm text-gray-400">
                  No positive preferences saved yet.
                </p>
              ) : (
                <ul className="divide-y divide-gray-800 border-y border-gray-800">
                  {preferences.map((memory) => (
                    <li key={memory.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/5 text-cyan-200">
                          <Music2 className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="break-words text-sm font-medium text-white">{memory.fact}</p>
                          <p className="signal-kicker mt-1 text-[9px] uppercase text-gray-500">{memory.type || "LISTENING PREFERENCE"}</p>
                        </div>
                      </div>
                      <a
                        href={`https://open.spotify.com/search/${encodeURIComponent(memory.fact)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-md bg-lime-300 px-3 py-2 text-xs font-semibold text-gray-950 transition hover:bg-lime-200"
                      >
                        Play on Spotify <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {exclusions.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-400">Excluded from suggestions</h2>
                <ul className="flex flex-wrap gap-2">
                  {exclusions.map((memory) => (
                    <li key={memory.id} className="rounded-md border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-sm text-amber-100">
                      {memory.fact}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </section>
  );
};

export default Recommandation;
