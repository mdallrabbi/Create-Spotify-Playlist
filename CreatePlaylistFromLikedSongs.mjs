import fetch from 'node-fetch';

const accessToken = 'BQBQPeTTzXepW2yX3a6ZLImgVT8zdjDkF0J2QqqG_RDuyxC1DFuPwObyjwhlkU59RNT3X7hEjUeT0boCvsZ3TTQc02OgTFe4kjcZmv45hQ9fU89OlqDX-5phqEp7aKDgAH8CjNAvhyMZP5O8xnzpmg50ALiIcv-6PXu_9alNr3M7GAV8ZdZby9zdQuCfUHVvm-_hDX6q_M4yqMtew7A5DOJARzJ-5s9SxlXOFOXwjq_FXEHbGlrRTEhTVNj8KAU8r7ozth9mdzq4BRbGhVeb6hoCmS4RHaFy7ECOoiZlVnM5sB7M5A'

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
    console.log(`Response from ${endpoint}:`, data); // Debugging
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

async function getLikedSongs(token) {
  let allTracks = [];
  let offset = 0;
  let limit = 50;

  while (true) {
    const data = await fetchWebApi(`v1/me/tracks?limit=${limit}&offset=${offset}`, 'GET', token);
    const tracks = data.items.map(item => item.track.uri);
    allTracks.push(...tracks);

    if (data.items.length < limit) {
      break; // No more tracks to fetch
    }
    offset += limit;
  }

  return allTracks;
}

async function createPlaylist(userId, name, token) {
  const data = await fetchWebApi(`v1/users/${userId}/playlists`, 'POST', token, {
    name: name,
    description: 'Playlist created from my liked songs',
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

  // Fetch the current user's ID
  const userId = (await fetchWebApi('v1/me', 'GET', token)).id;

  // Fetch liked songs
  const likedSongs = await getLikedSongs(token);
  console.log(`Fetched ${likedSongs.length} liked songs.`);

  // Create a new playlist
  const playlistId = await createPlaylist(userId, 'Liked Song Playlist MD ALL RABBI', token);
  console.log(`Created playlist ID: ${playlistId}`);

  // Add liked songs to the playlist
  await addTracksToPlaylist(playlistId, likedSongs, token);
  console.log(`Playlist created: https://open.spotify.com/playlist/${playlistId}`);
}

main();