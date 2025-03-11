// getAccessToken.mjs
import fetch from 'node-fetch';

const clientId = '995494b1d44e489bade27c3a6917303d';
const clientSecret = '4f5fecee97984d2ca69a156f9a41c9bd';
const redirectUri = 'http://127.0.0.1:8888/callback';
const authorizationCode = 'AQDZRo8V-m8FbtBaf0umwEtIV8EMC7gP6ANQiNU2WTBGTGWOo_ho6NgPNXpepVwC9J9uVmt3UhjZ0LO4EnSL-D-HGIB5xrDHCvLzTKe32ECwQZ7v-cqTqDtNw28vNScpJJHJOYsLc1CRW-vrFddlKRIWBdg5vuAtITyEbTbdisY03LVeDe7i_pFhvKGeKbwU_rTSOOk33jfIiM3VjuNhX9vHi5LbpHimHyFaaSdX5gZjvU7z3hRA7L8ixCnk5OC_eFc'; // Replace with your authorization code

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
