import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const PORT = 9341;
const chrome = spawn(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/ed-deck-chrome-3",
    "--no-first-run",
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitList() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find((t) => t.type === "page");
        if (page?.webSocketDebuggerUrl) return page;
      }
    } catch {}
    await sleep(150);
  }
  throw new Error("no chrome page");
}

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.n = 0;
    this.pending = new Map();
    this.ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { ok, fail } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? fail(new Error(JSON.stringify(msg.error))) : ok(msg.result);
      }
    });
  }
  ready() {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise((ok, fail) => {
      this.ws.addEventListener("open", ok, { once: true });
      this.ws.addEventListener("error", fail, { once: true });
    });
  }
  send(method, params = {}) {
    const id = ++this.n;
    return new Promise((ok, fail) => {
      this.pending.set(id, { ok, fail });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

const ARTICLE_INFO = `(() => {
  const arts = [...document.querySelectorAll("article")];
  return JSON.stringify(arts.map((el) => {
    const s = getComputedStyle(el);
    const t = new DOMMatrix(s.transform);
    const rotX = Math.abs(t.m23) + Math.abs(t.m32);
    const rotY = Math.abs(t.m13) + Math.abs(t.m31);
    const rotZ = Math.abs(t.a - t.d) + Math.abs(t.b) + Math.abs(t.c);
    return {
      z: s.zIndex,
      tx: Math.round(t.e),
      ty: Math.round(t.f),
      sx: +t.a.toFixed(3),
      rotX: +rotX.toFixed(3),
      rotY: +rotY.toFixed(3),
      rotZ: +rotZ.toFixed(3),
      perspective: s.perspective,
      preserve: s.transformStyle,
      grab: el.className.includes("cursor-grab"),
    };
  }));
})()`;

try {
  const page = await waitList();
  const cdp = new Cdp(page.webSocketDebuggerUrl);
  await cdp.ready();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.send("Page.navigate", {
    url: "http://localhost:3000/docs/components/editorial-deck",
  });
  await sleep(3500);

  const rest = JSON.parse(
    (await cdp.send("Runtime.evaluate", { expression: ARTICLE_INFO, returnByValue: true }))
      .result?.value || "[]",
  );
  console.log("rest", rest);
  const restShot = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(".tmp-ed-rest.png", Buffer.from(restShot.data, "base64"));

  for (const c of rest) {
    if (c.rotX > 0.05 || c.rotY > 0.05 || c.rotZ > 0.05) {
      throw new Error(`rest still rotated: ${JSON.stringify(c)}`);
    }
    if (c.tx !== 0) throw new Error(`rest x offset ${c.tx}`);
  }

  const boxRes = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const el = document.querySelector("article.cursor-grab") || document.querySelector("article");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return JSON.stringify({ x: r.x, y: r.y, w: r.width, h: r.height, n: document.querySelectorAll("article").length });
    })()`,
    returnByValue: true,
  });
  const box = JSON.parse(boxRes.result?.value || "null");
  console.log("frontBox", box);
  if (!box || box.w < 40) throw new Error("front card not found");

  const x0 = box.x + box.w * 0.55;
  const y0 = box.y + box.h * 0.45;
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: x0,
    y: y0,
    button: "left",
    clickCount: 1,
  });
  for (let i = 1; i <= 16; i++) {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: x0 - i * 16,
      y: y0 + i * 2,
      button: "left",
    });
    await sleep(16);
  }
  await sleep(80);
  const mid = JSON.parse(
    (await cdp.send("Runtime.evaluate", { expression: ARTICLE_INFO, returnByValue: true }))
      .result?.value || "[]",
  );
  console.log("midDrag", mid);
  const dragShot = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(".tmp-ed-drag.png", Buffer.from(dragShot.data, "base64"));

  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: x0 - 256,
    y: y0 + 32,
    button: "left",
    clickCount: 1,
  });
  await sleep(700);
  const after = JSON.parse(
    (await cdp.send("Runtime.evaluate", { expression: ARTICLE_INFO, returnByValue: true }))
      .result?.value || "[]",
  );
  console.log("afterSettle", after);
  const settleShot = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(".tmp-ed-settle.png", Buffer.from(settleShot.data, "base64"));

  for (const c of after) {
    if (c.rotX > 0.08 || c.rotY > 0.08 || c.rotZ > 0.08) {
      throw new Error(`settle still rotated: ${JSON.stringify(c)}`);
    }
    if (Math.abs(c.tx) > 8) throw new Error(`settle x offset ${c.tx}`);
  }
  console.log("ok");
} finally {
  chrome.kill("SIGKILL");
}
