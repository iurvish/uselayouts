import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const PORT = 9337;
const chrome = spawn(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=/tmp/ed-deck-chrome-2",
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

try {
  const page = await waitList();
  console.log("page", page.url, page.id);
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
  console.log("navigating");
  await cdp.send("Page.navigate", {
    url: "http://localhost:3000/docs/components/editorial-deck",
  });
  await sleep(3200);

  const transforms = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const arts = [...document.querySelectorAll("article")];
      return JSON.stringify(arts.map((el) => {
        const s = getComputedStyle(el);
        return { z: s.zIndex, t: s.transform };
      }));
    })()`,
    returnByValue: true,
  });
  console.log("restTransforms", transforms.result?.value);
  const restShot = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(".tmp-ed-rest.png", Buffer.from(restShot.data, "base64"));

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
  for (let i = 1; i <= 14; i++) {
    await cdp.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: x0 - i * 14,
      y: y0 + i * 2,
      button: "left",
    });
    await sleep(16);
  }
  await sleep(80);
  const mid = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const el = document.querySelector("article.cursor-grab") || document.querySelector("article");
      return JSON.stringify({ t: getComputedStyle(el).transform, cursor: getComputedStyle(el).cursor });
    })()`,
    returnByValue: true,
  });
  console.log("midDrag", mid.result?.value);
  const dragShot = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(".tmp-ed-drag.png", Buffer.from(dragShot.data, "base64"));

  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: x0 - 196,
    y: y0 + 28,
    button: "left",
    clickCount: 1,
  });
  await sleep(600);
  const after = await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const arts = [...document.querySelectorAll("article")];
      return JSON.stringify(arts.map((el) => ({ z: getComputedStyle(el).zIndex, t: getComputedStyle(el).transform })));
    })()`,
    returnByValue: true,
  });
  console.log("afterSettle", after.result?.value);
  const settleShot = await cdp.send("Page.captureScreenshot", { format: "png" });
  writeFileSync(".tmp-ed-settle.png", Buffer.from(settleShot.data, "base64"));
  console.log("ok");
} finally {
  chrome.kill("SIGKILL");
}
