"use client";

interface Track {
  number: number;
  name: string;
}

interface TrackListProps {
  tracks: Track[];
  textColor: string;
  mutedColor: string;
}

export default function TrackList({ tracks, textColor, mutedColor }: TrackListProps) {
  // Split tracks into two columns at the midpoint
  const midpoint = Math.ceil(tracks.length / 2);
  const leftColumn = tracks.slice(0, midpoint);
  const rightColumn = tracks.slice(midpoint);

  return (
    <div
      style={{
        display: "flex",
        gap: "48px",
        marginTop: "8px",
      }}
    >
      {/* Left column */}
      <div style={{ flex: 1 }}>
        {leftColumn.map((track) => (
          <div
            key={track.number}
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: textColor,
              lineHeight: "1.7",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {track.number}. {track.name}
          </div>
        ))}
      </div>

      {/* Right column */}
      <div style={{ flex: 1 }}>
        {rightColumn.map((track) => (
          <div
            key={track.number}
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: textColor,
              lineHeight: "1.7",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {track.number}. {track.name}
          </div>
        ))}
      </div>
    </div>
  );
}