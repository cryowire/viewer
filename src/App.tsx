import { useState, useCallback, useEffect } from "react";
import { load } from "js-yaml";
import type { CooldownData } from "./types";
import { CooldownView } from "./components/CooldownView";

const DEFAULT_URL =
  "https://raw.githubusercontent.com/cryo-wiring/spec/refs/heads/main/examples/cooldown.yaml";

function parseYaml(text: string): CooldownData {
  const parsed = load(text) as CooldownData;
  if (!parsed?.metadata?.cooldown_id || !parsed?.control) {
    throw new Error("Invalid cooldown.yaml: missing required fields (metadata, control)");
  }
  return parsed;
}

function getInitialUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("url") || DEFAULT_URL;
}

export function App() {
  const [url, setUrl] = useState(getInitialUrl);
  const [data, setData] = useState<CooldownData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUrl = useCallback(async (targetUrl: string) => {
    setError("");
    setLoading(true);
    setData(null);
    try {
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      setData(parseYaml(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (url.trim()) fetchUrl(url.trim());
    },
    [url, fetchUrl],
  );

  const handleFile = useCallback((file: File) => {
    setError("");
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setData(parseYaml(e.target?.result as string));
        setUrl(file.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse file");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  useEffect(() => {
    fetchUrl(getInitialUrl());
  }, [fetchUrl]);

  return (
    <div
      className="min-h-screen antialiased"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-cryo-500/50 backdrop-blur-xl" style={{ backgroundColor: "rgba(22,28,40,0.95)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2 sm:py-0 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="cryo-wiring"
                className="h-12 object-contain"
                style={{ clipPath: "inset(15% 10% 15% 10%)", margin: "-0.25rem 0" }}
              />
              <span className="font-semibold text-sm tracking-tight text-cryo-50">
                cryo-wiring
              </span>
            </div>

            {/* URL bar */}
            <form onSubmit={handleSubmit} className="flex-1 min-w-0 flex items-center gap-2">
              <div className="flex-1 min-w-0 relative">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL to cooldown.yaml or drop a file"
                  className="w-full px-3 py-1.5 text-xs font-mono border border-cryo-500/60 rounded-lg bg-cryo-900/60 text-cryo-200 placeholder:text-cryo-300/40 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="btn-primary inline-flex items-center gap-1.5 shrink-0 disabled:opacity-40"
              >
                {loading ? (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                <span className="hidden sm:inline">Explore</span>
              </button>
              <label className="btn inline-flex items-center gap-1.5 shrink-0 cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden sm:inline">File</span>
                <input
                  type="file"
                  accept=".yaml,.yml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {error && (
          <div
            className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400"
            style={{ animation: "slideUp 200ms ease-out" }}
          >
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-cryo-300 gap-4">
            <svg className="animate-spin w-8 h-8 text-accent/60" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading cooldown data...</span>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-cryo-300 gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="cryo-wiring"
              className="w-20 h-20 object-contain opacity-40 mb-2"
            />
            <span className="text-sm">
              Enter a URL or drop a{" "}
              <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs font-mono">
                cooldown.yaml
              </code>{" "}
              file
            </span>
          </div>
        )}

        {data && <CooldownView data={data} />}
      </main>
    </div>
  );
}
