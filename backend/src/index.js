import app from './app.js';

const PORT = process.env.PORT || 4010;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
