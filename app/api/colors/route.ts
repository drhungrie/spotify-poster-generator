import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// We use sharp to process the image and extract colors manually
// sharp is the most reliable image processing library for Node.js

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Missing image URL" },
      { status: 400 }
    );
  }

  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Could not fetch image" },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resize image to 200x200 for faster processing
    // Then get raw pixel data (RGB format)
    const { data, info } = await sharp(buffer)
      .resize(200, 200)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Sample pixels evenly across the image
    const pixels: [number, number, number][] = [];
    const sampleRate = 10; // every 10th pixel

    for (let i = 0; i < data.length; i += info.channels * sampleRate) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Skip very dark or very light pixels — not interesting for palette
      const brightness = (r + g + b) / 3;
      if (brightness > 20 && brightness < 235) {
        pixels.push([r, g, b]);
      }
    }

    // Simple k-means-like clustering: bucket pixels by hue zones
    // Then pick the most representative color from each bucket
    const buckets: { [key: number]: [number, number, number][] } = {};
    const numBuckets = 8;

    pixels.forEach(([r, g, b]) => {
      // Convert to HSL hue to bucket by color family
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      let hue = 0;
      if (max !== min) {
        const d = max - min;
        if (max === r / 255) hue = ((g - b) / 255 / d) % 6;
        else if (max === g / 255) hue = (b - r) / 255 / d + 2;
        else hue = (r - g) / 255 / d + 4;
        hue = Math.round((hue * 60 + 360) % 360);
      }
      const bucket = Math.floor(hue / (360 / numBuckets));
      if (!buckets[bucket]) buckets[bucket] = [];
      buckets[bucket].push([r, g, b]);
    });

    // Average each bucket to get representative colors
    const palette: string[] = [];
    Object.values(buckets)
      .filter((bucket) => bucket.length > 10) // ignore tiny buckets
      .sort((a, b) => b.length - a.length) // most dominant first
      .slice(0, 5)
      .forEach((bucket) => {
        const avg = bucket.reduce(
          (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
          [0, 0, 0]
        );
        const r = Math.round(avg[0] / bucket.length);
        const g = Math.round(avg[1] / bucket.length);
        const b = Math.round(avg[2] / bucket.length);
        palette.push(
          `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
        );
      });

    // Ensure we always have 5 colors
    while (palette.length < 5) {
      palette.push("#888888");
    }

    // Dominant color is the most common one
    const dominantHex = palette[0];

    // Parse dominant hex to check luminance
    const dr = parseInt(dominantHex.slice(1, 3), 16);
    const dg = parseInt(dominantHex.slice(3, 5), 16);
    const db = parseInt(dominantHex.slice(5, 7), 16);
    const luminance = (0.299 * dr + 0.587 * dg + 0.114 * db) / 255;
    const isDark = luminance < 0.5;

    return NextResponse.json({ colors: palette, dominantHex, isDark });

  } catch (error) {
    console.error("Color extraction error:", error);
    return NextResponse.json(
      { error: "Color extraction failed" },
      { status: 500 }
    );
  }
}