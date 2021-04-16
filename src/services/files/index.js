import { Router } from "express";

import { fileURLToPath } from "url";

import { dirname, join } from "path";

import checkFileType from "../../middlewares/file/index.js";

import fs from "fs-extra";

import multer from "multer";

import { v4 as uniqid } from "uuid";

const upload = multer();

const route = Router();

const currentWorkingFile = fileURLToPath(import.meta.url);

const currentWorkingDirectory = dirname(currentWorkingFile);

const publicFolderDirectory = join(currentWorkingDirectory, "../../../public");

const dbPath = join(currentWorkingDirectory, "../../db/index.json");

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

route.post(
  "/",
  upload.single("file"),
  checkFileType(["image/jpeg", "image/png"]),
  async (req, res, next) => {
    try {
      const { originalname, buffer, size } = req.file;

      const finalDestination = join(publicFolderDirectory, originalname);

      await fs.writeFile(finalDestination, buffer);

      const previewLink = `${req.protocol}://${req.hostname}:${process.env.PORT}/${originalname}`;

      const downloadLink = `${req.protocol}://${req.hostname}:${process.env.PORT}/files/${originalname}`;

      const name = originalname;

      const kb = parseFloat((size / 1024).toFixed(2));

      const createdFile = {
        id: uniqid(),
        name,
        previewLink,
        downloadLink,
        size: kb,
        unit: "kb",
        createdAt: new Date(),
      };
      const filesInDB = await fs.readJSON(dbPath);
      filesInDB.push(createdFile);
      await fs.writeJSON(dbPath, filesInDB);
      res.send(createdFile);
    } catch (err) {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      next(error);
    }
  }
);

route.get("/:name", async (req, res, next) => {
  try {
    const finalDestination = join(publicFolderDirectory, req.params.name);

    const file = await fs.readFile(finalDestination);

    res.writeHead("Content-Disposition", "attachment;"); // you should download

    res.send(file);
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});
export default route;
