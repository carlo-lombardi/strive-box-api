import express from "express";

import filesRoute from "./services/files/index.js";

import cors from "cors";

import { fileURLToPath } from "url";

import { dirname, join } from "path";

import {
  errorHandler,
  routeNotFoundHandler,
} from "./middlewares/errors/index.js";

const currentWorkingFile = fileURLToPath(import.meta.url);

const currentWorkingDirectory = dirname(currentWorkingFile);

const publicFolderDirectory = join(currentWorkingDirectory, "../public");

const app = express();

app.use(cors());

app.use(express.static(publicFolderDirectory));

app.use(express.json());

app.use("/files", filesRoute);

app.use(errorHandler);

app.use(routeNotFoundHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("🚀 Server is running on port ", PORT));

app.on("error", (error) =>
  console.log("🚀 Server is not running due to ", error)
);
