import { NextRequest, NextResponse } from "next/server";

// This route fetches FULL album data including tracklist
// Called after user selects an album from search results

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const albumId = searchParams.get("id");

  if (!albumId) {
    return NextResponse.json(
      { error: "Missing album ID" },
      { status: 400 }
    );
  }

  try {
    // Get fresh token
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

    // Fetch full album details
    const albumResponse = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!albumResponse.ok) {
      return NextResponse.json(
        { error: "Album not found" },
        { status: albumResponse.status }
      );
    }

    const album = await albumResponse.json();

    // Calculate total duration in minutes and seconds
    const totalMs = album.tracks.items.reduce(
      (sum: number, track: any) => sum + track.duration_ms, 0
    );
    const totalMinutes = Math.floor(totalMs / 60000);
    const totalSeconds = Math.floor((totalMs % 60000) / 1000);

    // Return clean structured data for the poster
    return NextResponse.json({
      id: album.id,
      name: album.name,
      // Primary artist first, then featuring artists
      primaryArtist: album.artists[0]?.name || "",
      featuredArtists: album.artists.slice(1).map((a: any) => a.name),
      releaseDate: album.release_date,
      imageUrl: album.images[0]?.url || "",
      totalTracks: album.total_tracks,
      duration: `${totalMinutes} min ${totalSeconds} sec`,
      tracks: album.tracks.items.map((track: any, index: number) => ({
        number: index + 1,
        name: track.name,
      })),
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}