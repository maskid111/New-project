import cors from "cors";
import express from "express";
import { config } from "./config.js";
import verifyRouter from "./routes/verify.js";
import activityRouter from "./routes/activity.js";
import xAuthRouter from "./routes/xAuth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ParrotPass backend" });
});

app.use("/verify", verifyRouter);
app.use("/activity", activityRouter);
app.use("/auth/x", xAuthRouter);

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
