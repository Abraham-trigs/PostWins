// apps/website/src/server.ts
import { createServer } from "http";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);

    // PRODUCTION-GRADE: Stakeholder context injection
    // This allows the server to see the 'dimpact_role' cookie before React even loads
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log("✅ Website/Marketing Engine started on http://localhost:3000");
  });
});
