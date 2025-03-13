//mostListenedSongs.js
const token = 'BQB_gMGhZVpQ6I_8tf5bPeVzPpPgHerJcvoHmnmK0CG2DhM9mM14qUZqq-YP-pvV2l_ajDQ3C1TzYZwHjml3IQJ1ZMUMTharHlqDieoEkZlgZL-GExEEft3brxPDoFJQ0FAB2o0Qlx5Ahvf2jB_b_uBEJlp0QBN4wtV5jXG8_6r1n9oAqEgDdX3IrtfXYsgn3BDa8ROGsJSm_OF3rCdkCGfGcBb61V-5Jf40m-E7wDrXZy1bx4OEFJ2IlNPk3W1lKkvyeqcyuIpkXcna-P-dQ5DkC45VkwmrKYqqGgBg6Slj_zv8_FNPZ5vc4TfO';

async function fetchWebApi(endpoint, method, body) {
  try {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching data from Spotify API:', error);
  }
}

async function searchArtist(artistName) {
  const data = await fetchWebApi(`v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, 'GET');
  return data?.artists?.items[0]?.id;
}

async function getArtistAlbums(artistId) {
  const data = await fetchWebApi(`v1/artists/${artistId}/albums?include_groups=album&limit=50`, 'GET');
  return data?.items || [];
}

async function getAlbumTracks(albumId) {
  const data = await fetchWebApi(`v1/albums/${albumId}/tracks?limit=50`, 'GET');
  return data?.items || [];
}

async function createPlaylist(userId, name) {
  const data = await fetchWebApi(`v1/users/${userId}/playlists`, 'POST', {
    name: name,
    description: 'All songs from my favorite bands',
    public: false,
  });
  return data?.id;
}

async function addTracksToPlaylist(playlistId, trackUris) {
  for (let i = 0; i < trackUris.length; i += 100) {
    const chunk = trackUris.slice(i, i + 100);
    await fetchWebApi(`v1/playlists/${playlistId}/tracks`, 'POST', {
      uris: chunk,
    });
  }
}

async function main() {
  const bands = [
    'Pink Floyd', 'Guns N\' Roses', 'Metallica', 'Scorpions', 'Black Sabbath',
    'The Beatles', 'Lynyrd Skynyrd', 'Justin Timberlake', 'John Mayer',
    'Iron Maiden', 'Dream Theater'
  ];

  const userId = (await fetchWebApi('v1/me', 'GET')).id;
  const playlistId = await createPlaylist(userId, 'All Songs from Favorite Bands');
  let trackUris = [];

  for (const band of bands) {
    const artistId = await searchArtist(band);
    if (artistId) {
      const albums = await getArtistAlbums(artistId);
      for (const album of albums) {
        const tracks = await getAlbumTracks(album.id);
        trackUris.push(...tracks.map(track => track.uri));
      }
    }
  }

  await addTracksToPlaylist(playlistId, trackUris);
  console.log(`Playlist created: https://open.spotify.com/playlist/${playlistId}`);
}

main();
