export const errorHandler = (error, req, res, next) => {
  if (error) {
    res.status(error.httpStatusCode).send({ message: error.message });
  } else {
    next();
  }
};

export const routeNotFoundHandler = (req, res, next) => {
  if (!req.pathname) {
    res.status(404).send({
      message: `${req.protocol}://${req.hostname}:${process.env.PORT}${req.originalUrl} is not implemented!`,
    });
  } else {
    next();
  }
};
