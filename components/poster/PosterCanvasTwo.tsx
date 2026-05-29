"use client";

import { forwardRef } from "react";
import { AlbumData } from "./PosterCanvas";

interface PosterCanvasTwoProps {
  album: AlbumData;
}

// Helper: format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).replace(/ /g, " ");
}

// Helper: dynamic font size for artist name
function getArtistFontSize(name: string): string {
  if (name.length > 20) return "64px";
  if (name.length > 12) return "80px";
  return "96px";
}

const PosterCanvasTwo = forwardRef<HTMLDivElement, PosterCanvasTwoProps>(
  ({ album }, ref) => {
    // Use the most vibrant extracted color as accent
    const accentColor = album.colors[1] || album.colors[0] || "#1DB954";

    // Info section background — very dark, slightly warm
    const infoBg = "#111111";
    const textPrimary = "#ffffff";
    const textMuted = "rgba(255,255,255,0.4)";
    const textSecondary = "rgba(255,255,255,0.75)";

    // Split tracks into two columns
    const midpoint = Math.ceil(album.tracks.length / 2);
    const leftTracks = album.tracks.slice(0, midpoint);
    const rightTracks = album.tracks.slice(midpoint);

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1620px",
          backgroundColor: infoBg,
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ── TOP: Album art with grain overlay ── */}
        <div
          style={{
            width: "1080px",
            height: "1000px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={album.imageUrl}
            alt="Album art"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            crossOrigin="anonymous"
          />

          {/* Gradient fade at bottom — blends image into info section */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "200px",
              background: `linear-gradient(to bottom, transparent, ${infoBg})`,
            }}
          />

          {/* Film grain overlay */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0.15,
              pointerEvents: "none",
            }}
          >
            <filter id="grain2">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain2)" />
          </svg>
        </div>

        {/* ── BOTTOM: Info section ── */}
        <div
          style={{
            width: "1080px",
            height: "620px",
            backgroundColor: infoBg,
            padding: "0 56px 48px 56px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            marginTop: "-40px", // overlap with gradient
          }}
        >

          {/* ── Row 1: Album title + artist ── */}
          <div style={{ marginBottom: "32px" }}>
            {/* Album title — smaller, muted, above artist */}
            <div
              style={{
                fontSize: "22px",
                fontWeight: 500,
                color: textMuted,
                letterSpacing: "0.05em",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              {album.name}
            </div>

            {/* Primary artist — large hero text */}
            <div
              style={{
                fontSize: getArtistFontSize(album.primaryArtist),
                fontWeight: 800,
                color: accentColor,
                lineHeight: 1.0,
                letterSpacing: "-2px",
              }}
            >
              {album.primaryArtist}
            </div>

            {/* Featured artists if any */}
            {album.featuredArtists.length > 0 && (
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 500,
                  color: textSecondary,
                  marginTop: "8px",
                }}
              >
                {album.featuredArtists.join(", ")}
              </div>
            )}
          </div>

          {/* ── Row 2: Metadata columns ── */}
          <div
            style={{
              display: "flex",
              gap: "64px",
              marginBottom: "32px",
              paddingBottom: "28px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Release date */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: textMuted,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Release Date
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: textPrimary,
                }}
              >
                {formatDate(album.releaseDate)}
              </div>
            </div>

            {/* Album length */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: textMuted,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Album Length
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: textPrimary,
                }}
              >
                {album.duration}
              </div>
            </div>

            {/* Total tracks */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: textMuted,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Tracks
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: textPrimary,
                }}
              >
                {album.tracks.length}
              </div>
            </div>
          </div>

          {/* ── Row 3: Tracklist ── */}
          <div
            style={{
              display: "flex",
              gap: "48px",
              flex: 1,
              marginBottom: "32px",
            }}
          >
            {/* Left column */}
            <div style={{ flex: 1 }}>
              {leftTracks.map((track) => (
                <div
                  key={track.number}
                  style={{
                    fontSize: "16px",
                    fontWeight: 400,
                    color: textSecondary,
                    lineHeight: "1.8",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {track.name}
                </div>
              ))}
            </div>

            {/* Right column */}
            <div style={{ flex: 1 }}>
              {rightTracks.map((track) => (
                <div
                  key={track.number}
                  style={{
                    fontSize: "16px",
                    fontWeight: 400,
                    color: textSecondary,
                    lineHeight: "1.8",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {track.name}
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 4: Bottom bar ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Color swatches — circles this time */}
            <div style={{ display: "flex", gap: "8px" }}>
              {album.colors.map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>

            {/* Spotify attribution */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {/* Spotify green circle logo mark */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#1DB954" />
                <path
                  d="M17.9 10.9C14.7 9 9.35 8.8 6.3 9.75c-.5.15-1-.15-1.15-.6-.15-.5.15-1 .6-1.15 3.55-1.05 9.4-.85 13.1 1.35.45.25.6.85.35 1.3-.25.35-.85.5-1.3.25zm-.1 2.8c-.25.35-.7.5-1.05.25-2.7-1.65-6.8-2.15-9.95-1.15-.4.1-.85-.1-.95-.5-.1-.4.1-.85.5-.95 3.65-1.1 8.15-.55 11.25 1.35.3.15.45.65.2 1zm-1.2 2.75c-.2.3-.55.4-.85.2-2.35-1.45-5.3-1.75-8.8-.95-.3.1-.65-.1-.75-.45-.1-.3.1-.65.45-.75 3.8-.85 7.1-.5 9.7 1.1.35.15.4.55.25.85z"
                  fill="white"
                />
              </svg>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: textMuted,
                  letterSpacing: "0.05em",
                }}
              >
                Listen on Spotify
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PosterCanvasTwo.displayName = "PosterCanvasTwo";
export default PosterCanvasTwo;