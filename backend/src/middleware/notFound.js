const notFound = (req, res, next) => {
  res.status(404).json({
    status: 'Error',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFound;
