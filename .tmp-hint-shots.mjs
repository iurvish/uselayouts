import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 9334;
const BASE = "http://localhost:3000/docs/components";

function cdpConnect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };
  return new Promise((resolve, reject) => {
    ws.onopen = () => {
      const send = (method, params = {}, sessionId) => {
        const mid = ++id;
        const payload = { id: mid, method, params };
        if (sessionId) payload.sessionId = sessionId;
        return new Promise((res, rej) => {
          pending.set(mid, { resolve: res, reject: rej });
          ws.send(JSON.stringify(payload));
        });
      };
      resolve({ ws, send });
    };
    ws.onerror = reject;
  });
}

async function evalExpr(send, sessionId, expression) {
  const r = await send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || "eval failed");
  return r.result.value;
}

async function openPage(send, url) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  }, sessionId);
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Page.navigate", { url }, sessionId);
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    const ready = await evalExpr(
      send,
      sessionId,
      `document.readyState === "complete" && !!document.querySelector("main")`,
    );
    if (ready) break;
  }
  await sleep(900);
  return { sessionId, targetId };
}

async function shot(send, sessionId, name) {
  const { data } = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  writeFileSync(`/Users/krishna/Personal/uselayouts/.tmp-${name}.png`, Buffer.from(data, "base64"));
  console.log("wrote", name);
}

const version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json());
const { send, ws } = await cdpConnect(version.webSocketDebuggerUrl);

try {
  for (const slug of ["editorial-deck", "infinite-grid", "scroll-stack-deck", "delete-button", "card-folder"]) {
    const { sessionId, targetId } = await openPage(send, `${BASE}/${slug}`);
    await shot(send, sessionId, `hint-${slug}`);
    if (slug === "scroll-stack-deck") {
      await evalExpr(
        send,
        sessionId,
        `(() => {
          const scroller = [...document.querySelectorAll("*")].find((el) => {
            const s = getComputedStyle(el);
            return (s.overflowY === "auto" || s.overflowY === "scroll") && el.scrollHeight > el.clientHeight + 20;
          });
          if (scroller) scroller.scrollTop = 140;
          return true;
        })()`,
      );
      await sleep(250);
      await shot(send, sessionId, "hint-scroll-stack-deck-scrolled");
    }
    await send("Target.closeTarget", { targetId });
  }
} finally {
  ws.close();
}
