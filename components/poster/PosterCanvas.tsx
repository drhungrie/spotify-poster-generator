"use client";

import { forwardRef } from "react";
import PosterImage from "./PosterImage";
import PosterInfo from "./PosterInfo";

// The AlbumData type defines exactly what shape of data this poster needs
export interface AlbumData {
  id: string;
  name: string;
  primaryArtist: string;
  featuredArtists: string[];
  releaseDate: string;
  imageUrl: string;
  duration: string;
  tracks: { number: number; name: string }[];
  colors: string[];
  dominantHex: string;
  isDark: boolean;
}

interface PosterCanvasProps {
  album: AlbumData;
}

// forwardRef lets the parent component get a reference to this DOM element
// We need that reference to capture it as an image for export
const PosterCanvas = forwardRef<HTMLDivElement, PosterCanvasProps>(
  ({ album }, ref) => {
    return (
      // Fixed size — 1080x1620 scaled down to fit screen via transform
      // The actual export will be full resolution
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1620px",
          backgroundColor: "#ffffff",
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top section: album art with grain overlay */}
        <PosterImage imageUrl={album.imageUrl} />

        {/* Bottom section: all text and metadata */}
        <PosterInfo album={album} />
      </div>
    );
  }
);

PosterCanvas.displayName = "PosterCanvas";
export default PosterCanvas;