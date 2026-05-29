"use client";

interface ColorSwatchesProps {
  colors: string[];
}

export default function ColorSwatches({ colors }: ColorSwatchesProps) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {colors.map((color, index) => (
        <div
          key={index}
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: color,
            borderRadius: "2px",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}