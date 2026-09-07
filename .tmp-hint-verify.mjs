import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = Number(process.env.CDP_PORT || 9342);
const BASE = "http://localhost:3000/docs/components";

function cdpConnect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const sessions = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === "Target.attachedToTarget" && msg.params?.sessionId) {
      sessions.set(msg.params.sessionId, true);
    }
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
  if (r.exceptionDetails) {
    throw new Error(r.exceptionDetails.text || "eval failed");
  }
  return r.result.value;
}

async function openPage(send, url) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Page.navigate", { url }, sessionId);
  await send(
    "Page.setLifecycleEventsEnabled",
    { enabled: true },
    sessionId,
  );
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    const ready = await evalExpr(
      send,
      sessionId,
      `document.readyState === "complete" && !!document.querySelector("main")`,
    );
    if (ready) break;
  }
  await sleep(800);
  return { sessionId, targetId };
}

const probe = `
(() => {
  const main = document.querySelector("main");
  const hint = [...document.querySelectorAll("p")].find((p) =>
    /Drag to flip|Scroll the stack|Interaction study|Hover to peek|Swipe|Corner player/.test(p.textContent || "")
  );
  const overlay = hint?.closest("[class*='sticky'], [class*='absolute']") || hint?.parentElement;
  const shell = hint && [...document.querySelectorAll("div")].find((d) => d.contains(hint) && getComputedStyle(d).position === "sticky");
  const abs = hint && [...document.querySelectorAll("div")].find((d) => d.contains(hint) && getComputedStyle(d).position === "absolute" && d !== shell);
  const cs = shell ? getComputedStyle(shell) : abs ? getComputedStyle(abs) : null;
  const inner = abs ? getComputedStyle(abs) : hint ? getComputedStyle(hint.parentElement) : null;
  const showcase = document.querySelector(".component-showcase");
  const deck = document.querySelector("[class*='cursor-grab'], article");
  const canvas = document.querySelector("main > div") || showcase;
  const scroller = [...document.querySelectorAll("*")].find((el) => {
    const s = getComputedStyle(el);
    return (s.overflowY === "auto" || s.overflowY === "scroll") && el.scrollHeight > el.clientHeight + 20;
  }) || main;
  const hintBox = hint ? hint.getBoundingClientRect() : null;
  const mainBox = main ? main.getBoundingClientRect() : null;
  const mid = mainBox
    ? document.elementFromPoint(mainBox.left + mainBox.width / 2, mainBox.top + mainBox.height / 2)
    : null;
  const topPt = mainBox
    ? document.elementFromPoint(mainBox.left + mainBox.width / 2, mainBox.top + 90)
    : null;
  return {
    title: document.title,
    hintText: hint?.textContent ?? null,
    shell: shell
      ? {
          position: cs.position,
          zIndex: cs.zIndex,
          pointerEvents: cs.pointerEvents,
          height: cs.height,
          opacity: cs.opacity,
          top: Math.round(shell.getBoundingClientRect().top),
        }
      : null,
    abs: abs
      ? {
          position: inner.position,
          zIndex: inner.zIndex,
          pointerEvents: inner.pointerEvents,
          top: Math.round(abs.getBoundingClientRect().top),
          height: Math.round(abs.getBoundingClientRect().height),
        }
      : null,
    mainScroll: main ? { top: main.scrollTop, sh: main.scrollHeight, ch: main.clientHeight } : null,
    nestedScroll: scroller && scroller !== main
      ? { tag: scroller.tagName, top: scroller.scrollTop, sh: scroller.scrollHeight, ch: scroller.clientHeight, cls: scroller.className.slice(0, 80) }
      : null,
    showcaseH: showcase ? Math.round(showcase.getBoundingClientRect().height) : null,
    mainH: mainBox ? Math.round(mainBox.height) : null,
    midTag: mid && (mid.className || mid.tagName),
    topTag: topPt && ((typeof topPt.className === "string" && topPt.className.slice(0, 80)) || topPt.tagName),
    hintBehind: topPt && hint ? !hint.contains(topPt) && topPt !== hint : null,
  };
})()
`;

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=/tmp/hint-verify-chrome-${PORT}`,
    "--window-size=1440,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let version;
for (let i = 0; i < 40; i++) {
  try {
    version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) =>
      r.json(),
    );
    break;
  } catch {
    await sleep(250);
  }
}
if (!version) {
  chrome.kill("SIGKILL");
  throw new Error("cdp not ready");
}
const { send, ws } = await cdpConnect(version.webSocketDebuggerUrl);
try {

  const pages = [
    "editorial-deck",
    "infinite-grid",
    "scroll-stack-deck",
    "delete-button",
  ];
  const out = {};
  for (const slug of pages) {
    const { sessionId, targetId } = await openPage(send, `${BASE}/${slug}`);
    out[slug] = await evalExpr(send, sessionId, probe);
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
          return scroller ? scroller.scrollTop : -1;
        })()`,
      );
      await sleep(200);
      out[slug].afterScroll = await evalExpr(send, sessionId, probe);
      await evalExpr(
        send,
        sessionId,
        `(() => {
          const scroller = [...document.querySelectorAll("*")].find((el) => {
            const s = getComputedStyle(el);
            return (s.overflowY === "auto" || s.overflowY === "scroll") && el.scrollHeight > el.clientHeight + 20;
          });
          if (scroller) scroller.scrollTop = 0;
          return scroller ? scroller.scrollTop : -1;
        })()`,
      );
      await sleep(200);
      out[slug].afterTop = await evalExpr(send, sessionId, probe);
    }
    if (slug === "editorial-deck") {
      out[slug].dragTarget = await evalExpr(
        send,
        sessionId,
        `(() => {
          const article = document.querySelector("article.cursor-grab, article");
          if (!article) return null;
          const r = article.getBoundingClientRect();
          const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return {
            tag: el?.tagName,
            cls: typeof el?.className === "string" ? el.className.slice(0, 100) : String(el?.className ?? ""),
            isHint: !!(el && /Drag to flip/.test(el.textContent || "")),
            pe: el ? getComputedStyle(el).pointerEvents : null,
          };
        })()`,
      );
    }
    await send("Target.closeTarget", { targetId });
  }
  console.log(JSON.stringify(out, null, 2));
} finally {
  try { ws.close(); } catch {}
  chrome.kill("SIGKILL");
}
