export function assertDevOnly() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Admin APIs are only available in development.");
  }
}

export function isDev() {
  return process.env.NODE_ENV === "development";
}
