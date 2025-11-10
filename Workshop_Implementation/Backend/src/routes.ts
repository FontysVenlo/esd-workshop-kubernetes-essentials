import { Router, Request, Response } from "express";
import { addItem, deleteItem, listItems } from "./db";

const router = Router();
const startedAt = Date.now();
const VERSION = process.env.APP_VERSION || "1.0.0";

router.get("/status", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    version: VERSION,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    node: process.version
  });
});

router.get("/items", (_req, res) => {
  res.json(listItems());
});

router.post("/items", (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "name is required" });
  const id = addItem(name);
  res.status(201).json({ id, name });
});

router.delete("/items/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });
  deleteItem(id);
  res.status(204).end();
});

// POST /api/work?ms=200
router.post("/work", (req, res) => {
  const ms = Math.max(1, Number(req.query.ms ?? 200));
  const end = Date.now() + ms;

  while (Date.now() < end) {}
  res.json({ ok: true, workMs: ms });
});

export default router;
