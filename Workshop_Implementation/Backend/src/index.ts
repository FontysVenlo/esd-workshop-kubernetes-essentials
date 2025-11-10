// src/index.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";

const app = express();

const PORT = Number(process.env.PORT || 8080);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(morgan("dev"));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use("/api", routes);

app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/readyz", (_req, res) => res.status(200).send("ok"));

const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
}); 

// graceful shutdown (Kubernetes SIGTERM)
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down…");
  server.close(() => process.exit(0));
});
