import "server-only";
import type { Product } from "./types";
import { repository, releases, selectAsset } from "./github";
import { httpsUrl } from "./validation";
export async function download(p: Product) {
  if (p.download_provider === "direct")
    return {
      url:
        p.download_url && httpsUrl.safeParse(p.download_url).success
          ? p.download_url
          : undefined,
      selected: null,
      fallback: undefined,
    };
  let fallback: string | undefined;
  try {
    fallback = `https://github.com/${repository(p.github_repository)}/releases`;
    const selected = selectAsset(
      await releases(p.github_repository),
      p.github_tag,
      p.github_asset,
    );
    return { url: selected?.asset.browser_download_url, selected, fallback };
  } catch {
    return { url: undefined, selected: null, fallback };
  }
}
