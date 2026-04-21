/**
 * Resolves every named image slot to the best available URL.
 *
 * Pulls from `image-assets.config.ts` which stores each slot as
 * `{ original, fallback }`. If `original` is a non-empty string we use it;
 * otherwise we fall back to the CDN URL. This lets the site render a full,
 * on-brand experience today and swap in production-owned assets later with
 * nothing more than an edit to the config table.
 */
import {
  IMAGE_SOURCES,
  SCENE_IMAGE_SOURCES,
  ImageKey,
  ImageSource,
} from './image-assets.config';

export { IMAGE_SOURCES, SCENE_IMAGE_SOURCES };
export type { ImageKey, ImageSource };

/** Pick `original` when set, otherwise `fallback`. */
export function resolveImage(src: ImageSource): string {
  return src.original?.trim() ? src.original : src.fallback;
}

/**
 * Flat map of resolved URLs keyed by slot name — this is what templates bind
 * to (e.g. `images.heroStudio`). Built once at module load.
 */
export const IMAGES = Object.fromEntries(
  (Object.entries(IMAGE_SOURCES) as [ImageKey, ImageSource][]).map(
    ([key, src]) => [key, resolveImage(src)],
  ),
) as Record<ImageKey, string>;

/**
 * Default scene images for the WebGL gallery on the home hero.
 * A dedicated, moody/editorial set — intentionally distinct from the card
 * imagery elsewhere on the site so the 3D feed feels curated rather than
 * redundant.
 */
export const DEFAULT_SCENE_IMAGES: { id: string; title: string; url: string }[] =
  SCENE_IMAGE_SOURCES.map(({ id, title, source }) => ({
    id,
    title,
    url: resolveImage(source),
  }));
