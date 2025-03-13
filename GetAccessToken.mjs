// getAccessToken.mjs
import fetch from 'node-fetch';

const clientId = '995494b1d44e489bade27c3a6917303d';
const clientSecret = '4f5fecee97984d2ca69a156f9a41c9bd';
const redirectUri = 'http://127.0.0.1:8888/callback';
const authorizationCode = 'AQBVNxmh9kOHn21ShiR_KhvwcuMlmc99KmWL0EgjHfMBvVvDJOuh3uP3KxH5vkYVPttbEpDZx3dTRKupFbItDQNP9hkLo0WEKXPvv4wpsqXdDWSb_duthW15nck_dqDa5dsb47Q8KDzpoto0EWxgPfG--_Dp9ln-r5WDdkmxE1itN4zK4wOufDqQQ1ER6KT9UCHSleUJ_qhLdQXibGs0kyiLFnDQnhC1ZwONI7Ew_TDzxFKEhiZ7GRtpHqEvRIc_gGGOBYRA'; // Replace with your authorization code

async function getAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: redirectUri,
    }),
  });

  const data = await res.json();
  console.log('Response:', data); // Add this line for debugging

  if (data.access_token) {
    console.log('Access Token:', data.access_token);
    console.log('Refresh Token:', data.refresh_token);
  } else {
    console.error('Failed to obtain access token:', data);
  }
}

getAccessToken();
