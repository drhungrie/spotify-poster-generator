"use client";

import { AlbumData } from "./PosterCanvas";
import ColorSwatches from "./ColorSwatches";
import TrackList from "./TrackList";

interface PosterInfoProps {
  album: AlbumData;
}

// Helper: format release date from "2025-07-11" to "11 July 2025"
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Helper: calculate font size based on text length
// Prevents long album titles from overflowing
function getTitleFontSize(name: string): string {
  if (name.length > 30) return "52px";
  if (name.length > 20) return "62px";
  return "72px";
}

export default function PosterInfo({ album }: PosterInfoProps) {
  // Determine text colors based on isDark
  const bgColor = album.isDark
    ? adjustColor(album.dominantHex, -60) // darken dominant color
    : adjustColor(album.dominantHex, 180); // lighten for light albums

  const textPrimary = album.isDark ? "#ffffff" : "#0a0a0a";
  const textSecondary = album.isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";
  const textMuted = album.isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";

  return (
    <div
      style={{
        width: "1080px",
        height: "540px",
        backgroundColor: bgColor,
        padding: "36px 48px 36px 48px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top row: album title + color swatches */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "24px",
        }}
      >
        {/* Left: title + artists + date */}
        <div style={{ flex: 1 }}>
          {/* Album title — dynamically sized */}
          <div
            style={{
              fontSize: getTitleFontSize(album.name),
              fontWeight: 800,
              color: textPrimary,
              lineHeight: 1.05,
              letterSpacing: "-1px",
              marginBottom: "8px",
            }}
          >
            {album.name}
          </div>

          {/* Primary artist — large and bold */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: textPrimary,
              lineHeight: 1.2,
              marginBottom: "4px",
            }}
          >
            {album.primaryArtist}
          </div>

          {/* Featured artists — smaller, muted */}
          {album.featuredArtists.length > 0 && (
            <div
              style={{
                fontSize: "24px",
                fontWeight: 500,
                color: textSecondary,
                lineHeight: 1.2,
                marginBottom: "6px",
              }}
            >
              feat. {album.featuredArtists.join(", ")}
            </div>
          )}

          {/* Release date */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: textMuted,
            }}
          >
            {formatDate(album.releaseDate)}
          </div>
        </div>

        {/* Right: color swatches + duration */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <ColorSwatches colors={album.colors} />
          <div
            style={{
              fontSize: "18px",
              fontWeight: 400,
              color: textMuted,
              whiteSpace: "nowrap",
            }}
          >
            {album.duration}
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <TrackList
        tracks={album.tracks}
        textColor={textPrimary}
        mutedColor={textSecondary}
      />
    </div>
  );
}

// Adjusts a hex color's lightness
// positive delta = lighter, negative delta = darker
function adjustColor(hex: string, delta: number): string {
  const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + delta));
  const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + delta));
  const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + delta));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}