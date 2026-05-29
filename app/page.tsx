"use client";

import { useState, useRef } from "react";
import { toPng, toJpeg } from "html-to-image";
import PosterCanvas, { AlbumData } from "../components/poster/PosterCanvas";
import PosterCanvasTwo from "../components/poster/PosterCanvasTwo";

interface SearchResult {
  id: string;
  name: string;
  artists: string[];
  releaseDate: string;
  imageUrl: string;
  totalTracks: number;
}

export default function Home() {
  const [template, setTemplate] = useState<1 | 2>(1);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [albumData, setAlbumData] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [error, setError] = useState("");

  const posterRef = useRef<HTMLDivElement>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setSearchResults([]);
    setAlbumData(null);

    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.albums);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectAlbum(album: SearchResult) {
    setLoadingAlbum(true);
    setError("");
    setSearchResults([]);

    try {
      const [albumRes, colorRes] = await Promise.all([
        fetch(`/api/spotify/album?id=${album.id}`),
        fetch(`/api/colors?url=${encodeURIComponent(album.imageUrl)}`),
      ]);

      const albumJson = await albumRes.json();
      const colorJson = await colorRes.json();

      if (albumJson.error) throw new Error(albumJson.error);
      if (colorJson.error) throw new Error(colorJson.error);

      setAlbumData({
        ...albumJson,
        colors: colorJson.colors,
        dominantHex: colorJson.dominantHex,
        isDark: colorJson.isDark,
      });
    } catch {
      setError("Failed to load album. Please try again.");
    } finally {
      setLoadingAlbum(false);
    }
  }

  async function handleExportPng() {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 1 });
      download(dataUrl, `${albumData?.name || "poster"}.png`);
    } catch {
      setError("Export failed. Please try again.");
    }
  }

  async function handleExportJpeg() {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toJpeg(posterRef.current, {
        pixelRatio: 1,
        quality: 0.95,
      });
      download(dataUrl, `${albumData?.name || "poster"}.jpg`);
    } catch {
      setError("Export failed. Please try again.");
    }
  }

  function download(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Header ── */}
      <div className="border-b border-white/10 px-4 md:px-8 py-4 md:py-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Album Poster Generator
        </h1>
        <p className="text-white/40 text-xs md:text-sm mt-1">
          Search any album and generate a downloadable poster
        </p>
      </div>

      {/* ── Main layout — vertical on mobile, horizontal on desktop ── */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-8 max-w-[1400px] mx-auto">

        {/* ── Controls panel ── */}
        <div className="w-full md:w-[380px] md:shrink-0 flex flex-col gap-4 md:gap-6">

          {/* Search bar */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
              Search Album
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Dark Side of the Moon"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-white text-black px-5 py-3 rounded-lg text-sm font-semibold hover:bg-white/90 disabled:opacity-40 transition shrink-0"
              >
                {loading ? "..." : "Search"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                Results
              </label>
              <div className="flex flex-col gap-2">
                {searchResults.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => handleSelectAlbum(album)}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 text-left transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={album.imageUrl}
                      alt={album.name}
                      className="w-12 h-12 rounded object-cover shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="text-sm font-semibold truncate">
                        {album.name}
                      </div>
                      <div className="text-xs text-white/40 truncate">
                        {album.artists.join(", ")} · {album.releaseDate.slice(0, 4)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loadingAlbum && (
            <div className="text-white/40 text-sm text-center py-8">
              Generating poster...
            </div>
          )}

          {/* Export buttons */}
          {albumData && !loadingAlbum && (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                Export
              </label>
              <button
                onClick={handleExportPng}
                className="w-full bg-white text-black py-3 rounded-lg text-sm font-semibold hover:bg-white/90 transition"
              >
                Download PNG
              </button>
              <button
                onClick={handleExportJpeg}
                className="w-full bg-white/10 text-white py-3 rounded-lg text-sm font-semibold hover:bg-white/20 border border-white/10 transition"
              >
                Download JPEG
              </button>
              <button
                onClick={() => { setAlbumData(null); setQuery(""); }}
                className="w-full text-white/30 py-2 text-sm hover:text-white/60 transition"
              >
                Start over
              </button>
            </div>
          )}
        </div>

        {/* ── Poster preview panel ── */}
        <div className="flex-1 flex flex-col items-center gap-4">

          {!albumData && !loadingAlbum && (
            <div className="text-white/20 text-sm mt-8 md:mt-32">
              Your poster preview will appear here
            </div>
          )}

          {albumData && (
            <div className="flex flex-col items-center gap-4 w-full">

              {/* Template toggle */}
              <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setTemplate(1)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    template === 1
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Template 1
                </button>
                <button
                  onClick={() => setTemplate(2)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    template === 2
                      ? "bg-white text-black"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  Template 2
                </button>
              </div>

              {/* 
                Poster preview wrapper
                The poster is always 1080px wide internally
                We scale it down to fit the screen width
                On mobile: fits within ~90% of screen width
                On desktop: scales to 45% of original size
              */}
              <div className="w-full overflow-hidden flex justify-center">
                <div
                  style={{
                    // Calculate scale based on container
                    // 1080px poster scaled to fit mobile screen
                    transform: "scale(var(--poster-scale, 0.45))",
                    transformOrigin: "top center",
                    width: "1080px",
                    height: "1620px",
                    // CSS variable set via style — overridden on mobile
                  }}
                  className="[--poster-scale:0.28] sm:[--poster-scale:0.35] md:[--poster-scale:0.45]"
                >
                  {template === 1 ? (
                    <PosterCanvas ref={posterRef} album={albumData} />
                  ) : (
                    <PosterCanvasTwo ref={posterRef} album={albumData} />
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </main>
  );
}