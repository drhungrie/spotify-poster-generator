"use client";

// The top image section with film grain overlay

interface PosterImageProps {
  imageUrl: string;
}

export default function PosterImage({ imageUrl }: PosterImageProps) {
  return (
    <div
      style={{
        width: "1080px",
        height: "1080px", // Square crop — top 2/3 of poster
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Album art — fills entire area */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Album art"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        crossOrigin="anonymous"
      />

      {/* Film grain overlay using SVG filter */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.18,
          pointerEvents: "none",
        }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}