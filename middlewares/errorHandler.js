const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let errorType = "Server Error"; // Type d'erreur par défaut

  // Gestion des erreurs JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    errorType = "Authentication Error";
  }

  // Erreur d'expiration du token
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    errorType = "Token Expired";
  }

  // Erreur de validation mongoose
  if (err.name === "ValidationError") {
    statusCode = 400;
    errorType = "Validation Error";
  }

  // Erreur de cast (ex: ID invalide MongoDB)
  if (err.name === "CastError") {
    statusCode = 400;
    errorType = "Invalid ID Format";
  }

  // Erreur de duplication (ex: email déjà utilisé)
  if (err.code === 11000) {
    statusCode = 409;
    errorType = "Duplicate Key Error";
  }

  res.status(statusCode).json({
    success: false,
    errorType,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;