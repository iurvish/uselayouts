/** Tags an outbound link so the destination can attribute the traffic back to
 *  us in their own analytics. Source is always this site; medium and campaign
 *  say which placement sent them. */
export function withUtm(
  url: string,
  { medium, campaign }: { medium: string; campaign: string },
): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "uselayouts");
  u.searchParams.set("utm_medium", medium);
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}
