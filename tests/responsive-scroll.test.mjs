import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("production web styles restore native document scrolling", async () => {
  const [entrypoint, productionCss] = await Promise.all([
    readFile(new URL("../src/main.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/prototype.css", import.meta.url), "utf8"),
  ]);

  assert.ok(
    entrypoint.indexOf('import "./styles.css"') < entrypoint.indexOf('import "./prototype.css"'),
    "production overrides must load after the protected phone runtime styles",
  );
  assert.match(
    productionCss,
    /html,\s*body\s*\{[^}]*overflow-y:\s*auto/s,
    "the document must override the simulator's overflow lock",
  );
  assert.match(
    productionCss,
    /html,\s*body,\s*#root\s*\{[^}]*height:\s*auto/s,
    "the document and React root must grow with course content",
  );
});
