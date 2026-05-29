import { NextRequest, NextResponse } from "next/server";

// This route:
// 1. Receives a search query from the frontend
// 2. Gets a fresh token from our token route
// 3. Searches Spotify for matching albums
// 4. Returns clean, minimal album data

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 }
    );
  }

  try {
    // Get access token from our own token route
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/spotify/token`
    );
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Could not authenticate with Spotify" },
        { status: 500 }
      );
    }

    // Search Spotify — type=album, limit to 8 results
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=8`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!searchResponse.ok) {
      return NextResponse.json(
        { error: "Spotify search failed" },
        { status: searchResponse.status }
      );
    }

    const data = await searchResponse.json();

    // Return only what we need — keeps response small and clean
    const albums = data.albums.items.map((album: any) => ({
      id: album.id,
      name: album.name,
      artists: album.artists.map((a: any) => a.name),
      releaseDate: album.release_date,
      imageUrl: album.images[0]?.url || "",
      totalTracks: album.total_tracks,
    }));

    return NextResponse.json({ albums });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}