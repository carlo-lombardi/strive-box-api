import express from "express";

import filesRoute from "./services/files/index.js";

import cors from "cors";

import {
  errorHandler,
  routeNotFoundHandler,
} from "./middlewares/errors/index.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/files", filesRoute);

app.use(errorHandler);

app.use(routeNotFoundHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("🚀 Server is running on port ", PORT));

app.on("error", (error) =>
  console.log("🚀 Server is not running due to ", error)
);
