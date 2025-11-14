import { Router, Request, Response } from "express";
import { addItem, deleteItem, listItems } from "./db";

const router = Router();
const startedAt = Date.now();
const VERSION = process.env.APP_VERSION ;

router.get("/status", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    version: VERSION,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    node: process.version
  });
});

router.get("/config", (_req: Request, res: Response) => {
  res.json({
    environment: process.env.APP_ENV || "unknown",
    feature_new_ui: process.env.FEATURE_NEW_UI === "true",
    external_api_url: process.env.EXTERNAL_API_URL || "not-set",
    max_items: parseInt(process.env.MAX_ITEMS || "100", 10),
    database_path: process.env.DB_PATH || "not-set",
    has_api_key: !!process.env.API_KEY,
    api_key_length: process.env.API_KEY ? process.env.API_KEY.length : 0
  });
});


router.get("/items", (_req, res) => {
  res.json(listItems());
});

router.post("/crash", (req, res) => {
  const hostname = process.env.HOSTNAME || 'unknown';
  
  res.status(200).json({ 
    message: "This pod will crash in 1 second for demo purposes",
    pod: hostname,
    note: "Kubernetes will restart this container automatically"
  });
  
  // Exit after response is sent
  setTimeout(() => {
    console.log(`[${hostname}] Intentional crash triggered for workshop demo`);
    process.exit(1);
  }, 1000);
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
