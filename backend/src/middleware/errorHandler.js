const errorHandler = (err, req, res, next) => {
  console.error(err);

  const postgresErrors = {
    23503: {
      statusCode: 400,
      message: 'Invalid reference: one or more related records do not exist',
    },
    23505: {
      statusCode: 409,
      message: 'A record with this value already exists',
    },
    23514: {
      statusCode: 400,
      message: 'The submitted data violates a database constraint',
    },
    '22P02': {
      statusCode: 400,
      message: 'Invalid data format',
    },
  };

  const postgresError = postgresErrors[err.code];

  if (postgresError) {
    return res.status(postgresError.statusCode).json({
      status: 'Error',
      message: postgresError.message,
    });
  }

  const statusCode = err.statusCode || 500;

  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    status: 'Error',
    message,
  });
};

export default errorHandler;
