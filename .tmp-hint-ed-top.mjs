import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 9334;

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

const version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json());
const { send, ws } = await cdpConnect(version.webSocketDebuggerUrl);

try {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
  }, sessionId);
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Page.navigate", { url: "http://localhost:3000/docs/components/editorial-deck" }, sessionId);
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    if (await evalExpr(send, sessionId, `document.readyState === "complete" && !!document.querySelector("main")`)) break;
  }
  await sleep(1000);
  const info = await evalExpr(send, sessionId, `(() => {
    const nodes = [...document.querySelectorAll("p")].filter(p => /Drag to flip|stories/.test(p.textContent||""));
    return nodes.map(p => {
      const r = p.getBoundingClientRect();
      const cs = getComputedStyle(p);
      const sticky = p.closest("[class*='sticky']");
      const sc = sticky ? getComputedStyle(sticky) : null;
      return {
        text: p.textContent,
        box: { x: r.x, y: r.y, w: r.width, h: r.height },
        color: cs.color,
        opacity: cs.opacity,
        visibility: cs.visibility,
        display: cs.display,
        z: cs.zIndex,
        stickyZ: sc?.zIndex,
        stickyPos: sc?.position,
        stickyH: sc?.height,
        stickyOp: sc?.opacity,
        parentCls: p.parentElement?.className,
      };
    });
  })()`);
  console.log(JSON.stringify(info, null, 2));
  const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: 400, y: 0, width: 640, height: 280, scale: 1 } }, sessionId);
  writeFileSync("/Users/krishna/Personal/uselayouts/.tmp-hint-ed-top.png", Buffer.from(data, "base64"));
  await send("Target.closeTarget", { targetId });
} finally {
  ws.close();
}
