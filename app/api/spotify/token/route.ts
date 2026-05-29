import { NextResponse } from "next/server";

// How this works:
// Spotify uses Client Credentials flow for public data
// We send our Client ID + Secret → Spotify gives us a temporary token
// That token is used for all other API calls

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Safety check — if keys are missing, fail clearly
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing Spotify credentials" },
      { status: 500 }
    );
  }

  try {
    // Spotify requires credentials as Base64 encoded string
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get Spotify token" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return only the token — never expose credentials
    return NextResponse.json({ access_token: data.access_token });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}