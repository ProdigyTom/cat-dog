import express, { type Request, type Response } from "express";
import { replaceInJson } from "./replace";

export const app = express();

app.use(express.json({ limit: "1mb" }));

app.post("/replace", (req: Request, res: Response) => {
  const rawMax = req.query["maxReplacements"];

  let maxReplacements: number | undefined;
  if (rawMax !== undefined) {
    const parsed = Number(rawMax);
    if (!Number.isInteger(parsed) || parsed < 0) {
      res.status(400).json({ error: "maxReplacements must be a non-negative integer" });
      return;
    }
    maxReplacements = parsed;
  }

  const { data, replacementCount } = replaceInJson(req.body, { maxReplacements });

  res.json({ data, replacementCount });
});
