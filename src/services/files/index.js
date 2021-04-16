import { Router } from "express";

// A -> B -> C

const route = Router();

route.get("/", async (req, res, next) => {
  try {
    const a = 10;
    a = 40;
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

export default route;
