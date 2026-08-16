export const PACKAGE_MANAGERS = ["npm", "bun", "yarn", "pnpm"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const PACKAGE_MANAGER_STORAGE_KEY = "uselayouts.package-manager";

export function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value);
}

export function cliInstallCommand(manager: PackageManager, registryUrl: string) {
  const quoted = `"${registryUrl}"`;
  switch (manager) {
    case "bun":
      return `bunx --bun shadcn@latest add ${quoted}`;
    case "yarn":
      return `yarn dlx shadcn@latest add ${quoted}`;
    case "pnpm":
      return `pnpm dlx shadcn@latest add ${quoted}`;
    default:
      return `npx shadcn@latest add ${quoted}`;
  }
}

export function manualInstallCommand(manager: PackageManager, packages: string[]) {
  const list = packages.join(" ");
  if (!list) return "";
  switch (manager) {
    case "bun":
      return `bun add ${list}`;
    case "yarn":
      return `yarn add ${list}`;
    case "pnpm":
      return `pnpm add ${list}`;
    default:
      return `npm install ${list}`;
  }
}

export function parseDependencyTag(raw: string): { name: string; version: string } {
  const value = raw.trim();
  if (!value) return { name: "", version: "" };
  if (value.startsWith("@")) {
    const second = value.indexOf("@", 1);
    if (second === -1) return { name: value, version: "" };
    return { name: value.slice(0, second), version: value.slice(second + 1) };
  }
  const at = value.indexOf("@");
  if (at === -1) return { name: value, version: "" };
  return { name: value.slice(0, at), version: value.slice(at + 1) };
}

export function serializeDependencyTag(name: string, version?: string) {
  const pkg = name.trim();
  const ver = version?.trim();
  if (!pkg) return "";
  return ver ? `${pkg}@${ver}` : pkg;
}
