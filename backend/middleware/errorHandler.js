const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max 5MB.' });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error' : err.message
  });
};

module.exports = errorHandler;