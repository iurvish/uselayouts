export const GITHUB_REPO = "iurvish/uselayouts";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

export function formatStarCount(count: number) {
  if (count < 1000) return String(count);
  const k = count / 1000;
  const rounded = k >= 10 ? Math.round(k) : Math.round(k * 10) / 10;
  return `${String(rounded).replace(/\.0$/, "")}k`;
}

export async function getGithubStarCount() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: unknown };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}
