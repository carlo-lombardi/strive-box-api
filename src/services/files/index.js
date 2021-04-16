import { Router } from "express";

import { fileURLToPath } from "url";

import { dirname, join } from "path";

import checkFileType from "../../middlewares/file/index.js";

import fs from "fs-extra";

import multer from "multer";

import { v4 as uniqid } from "uuid";

import { checkSchema, validationResult } from "express-validator";

const schema = {
  oldName: {
    isString: true,
    errorMessage: "Old name should be string!",
  },
  newName: {
    isString: true,
    errorMessage: "New name should be string!",
  },
};
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
    const { type = "stream" } = req.query;
    const finalDestination = join(publicFolderDirectory, req.params.name);
    const file = await fs.readFile(finalDestination);
    const stream = await fs.createReadStream(finalDestination);
    if (type === "buffer") {
      res.attachment(req.params.name);
      res.send(file);
    } else {
      res.attachment(req.params.name);
      stream.pipe(res);
    }
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

route.put("/", checkSchema(schema), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      const { oldName, newName } = req.body;

      const finalDestination = join(publicFolderDirectory, oldName);

      const buffer = await fs.readFile(finalDestination);

      let filesInDB = await fs.readJSON(dbPath);

      await fs.remove(finalDestination);

      const oldObj = filesInDB.find((f) => f.name !== req.params.name);

      filesInDB = filesInDB.filter((f) => f.name !== oldName);

      const newDestination = join(publicFolderDirectory, newName);

      await fs.writeFile(newDestination, buffer);

      const previewLink = `${req.protocol}://${req.hostname}:${process.env.PORT}/${newName}`;

      const downloadLink = `${req.protocol}://${req.hostname}:${process.env.PORT}/files/${newName}`;

      const newObj = {
        ...oldObj,
        name: newName,
        previewLink,
        downloadLink,
        updatedAt: new Date(),
      };

      filesInDB.push(newObj);

      await fs.writeJSON(dbPath, filesInDB);

      res.send(newObj);
    }
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});

route.delete("/:name", async (req, res, next) => {
  try {
    const finalDestination = join(publicFolderDirectory, req.params.name);

    let filesInDB = await fs.readJSON(dbPath);

    await fs.remove(finalDestination);

    filesInDB = filesInDB.filter((f) => f.name !== req.params.name);

    await fs.writeJSON(dbPath, filesInDB);

    res.send("OK");
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    next(error);
  }
});
export default route;
