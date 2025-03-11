import express from 'express';

const app = express();
const port = 8888;

app.get('/callback', (req, res) => {
  const authorizationCode = req.query.code;
  console.log('Authorization Code:', authorizationCode);
  res.send('Authorization successful! You can close this window.');
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
