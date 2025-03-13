import fetch from 'node-fetch';

const accessToken = 'BQDVI8f1tz9b1_2NmUjCEbVGhVJrUNsbi79l-v9NyRBWgJ8plS67JrK4FlfjRmxheD2jwP1TAv7QOJWxyUfTClkhXi62ZYeZpnPPdXZdcBy0PkfMm8XHvwY-GN7wOzpjxUJCPOFVKgLUPSGV-wlFSxGm3W6CFFJGyHm1WkVe9AIY2fRm3g6KBjojUr7EIZKdXOY8OKsQLc9pmO05l3cuVgQn9fnBlrHe3tJ3ZgS9CCegX-iiwo_JYu01oNnbUVWM8_fzg6cf8w';

async function fetchWebApi(endpoint, method, token, body, retries = 3) {
  try {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log(`Response from ${endpoint}:`, data); // Add this line for debugging
    return data;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      return fetchWebApi(endpoint, method, token, body, retries - 1);
    } else {
      console.error('Error fetching data from Spotify API:', error);
      throw error;
    }
  }
}

async function searchArtist(artistName, token) {
  const data = await fetchWebApi(`v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, 'GET', token);
  return data?.artists?.items[0]?.id;
}

async function getArtistAlbums(artistId, token) {
  const data = await fetchWebApi(`v1/artists/${artistId}/albums?include_groups=album&limit=50`, 'GET', token);
  return data?.items || [];
}

async function getAlbumTracks(albumId, token) {
  const data = await fetchWebApi(`v1/albums/${albumId}/tracks?limit=50`, 'GET', token);
  return data?.items || [];
}

async function createPlaylist(userId, name, token) {
  const data = await fetchWebApi(`v1/users/${userId}/playlists`, 'POST', token, {
    name: name,
    description: 'All songs from my favorite bands',
    public: false,
  });
  return data?.id;
}

async function addTracksToPlaylist(playlistId, trackUris, token) {
  for (let i = 0; i < trackUris.length; i += 100) {
    const chunk = trackUris.slice(i, i + 100);
    await fetchWebApi(`v1/playlists/${playlistId}/tracks`, 'POST', token, {
      uris: chunk,
    });
  }
}

async function main() {
  const token = accessToken;
  const bands = [
    'Cream'
    // 'Pink Floyd', 'Guns N\' Roses', 'Metallica', 'Scorpions', 'Black Sabbath',
    // 'The Beatles', 'Lynyrd Skynyrd', 'Justin Timberlake', 'John Mayer',
    // 'Iron Maiden', 'Dream Theater'
  ];

  const userId = (await fetchWebApi('v1/me', 'GET', token)).id;
  const playlistId = await createPlaylist(userId, 'Echoes of the Eternal', token);
  console.log(`Created playlist ID: ${playlistId}`); // Add this line for debugging
  let trackUris = [];

  for (const band of bands) {
    const artistId = await searchArtist(band, token);
    if (artistId) {
      const albums = await getArtistAlbums(artistId, token);
      for (const album of albums) {
        const tracks = await getAlbumTracks(album.id, token);
        trackUris.push(...tracks.map(track => track.uri));
      }
    }
  }

  await addTracksToPlaylist(playlistId, trackUris, token);
  console.log(`Playlist created: https://open.spotify.com/playlist/${playlistId}`);
}

main();
