export default function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';
  const body = { code, message };

  if (err.suggestedNext !== undefined) {
    body.suggestedNext = err.suggestedNext;
  }

  res.status(status).json(body);
}
