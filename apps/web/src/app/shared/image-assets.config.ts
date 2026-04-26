/**
 * Image asset registry for the Savage Media web app.
 *
 * Each slot declares two URLs:
 *   - `original`: the studio-owned asset (ideally something like
 *     `/assets/images/<slot>.jpg` once the real shoot is delivered).
 *   - `fallback`: a royalty-free Unsplash CDN URL that renders while the
 *     production asset hasn't been uploaded yet.
 *
 * The resolver in `image-assets.ts` prefers `original` when it's a non-empty
 * string and silently uses `fallback` otherwise — so swapping in real imagery
 * later is a one-line change per slot.
 *
 * WHY: keeping both sources in one table makes it obvious which slots still
 * need a proper asset and lets design + engineering share a single source of
 * truth instead of chasing hard-coded URLs across templates.
 */
export interface ImageSource {
  original: string;
  fallback: string;
}

const unsplash = (id: string, w = 1400, q = 70): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/**
 * All named image slots. Keep keys in sync with the `IMAGES` map exported by
 * `image-assets.ts`.
 */
export const IMAGE_SOURCES = {
  // ── Core visual categories ────────────────────────────────────────────────
  realEstate:           { original: '', fallback: unsplash('photo-1600596542815-ffad4c1539a9') },
  realEstateInterior:   { original: '', fallback: unsplash('photo-1600585154340-be6161a56a0c') },
  realEstateExterior:   { original: '', fallback: unsplash('photo-1512917774080-9991f1c4c750') },
  cinematic:            { original: '', fallback: unsplash('photo-1485846234645-a62644f84728') },
  cinematicFilm:        { original: '', fallback: unsplash('photo-1574717025058-2f8737d2e2b7') },
  cinematicSet:         { original: '', fallback: unsplash('photo-1518676590629-3dcba9c5a555') },
  productBrand:         { original: '', fallback: unsplash('photo-1526170375885-4d8ecf77b99f') },
  productFlatlay:       { original: '', fallback: unsplash('photo-1586023492125-27b2c045efd7') },
  portrait:             { original: '', fallback: unsplash('photo-1544005313-94ddf0286df2') },
  portraitStudio:       { original: '', fallback: unsplash('photo-1524504388940-b1c1722653e1') },
  portraitEditorial:    { original: '', fallback: unsplash('photo-1496440737103-cd596325d314') },
  aerial:               { original: '', fallback: unsplash('photo-1506947411487-a56738267384') },
  aerialDrone:          { original: '', fallback: unsplash('photo-1473968512647-3e447244af8f') },
  virtualTour:          { original: '', fallback: unsplash('photo-1558618666-fcd25c85cd64') },

  // ── Advanced tools ────────────────────────────────────────────────────────
  verticalReel:         { original: '', fallback: unsplash('photo-1611162617213-7d7a39e9b1d7') },
  promoVideo:           { original: '', fallback: unsplash('photo-1492691527719-9d1e07e534b4') },
  heroBanner:           { original: '', fallback: unsplash('photo-1542744173-8e7e53415bb0') },
  logoMotion:           { original: '', fallback: unsplash('photo-1626785774573-4b799315345d') },
  mockup:               { original: '', fallback: unsplash('photo-1542744094-24638eff58bb') },
  threeDViz:            { original: '', fallback: unsplash('photo-1617791160505-6f00504e3519') },
  colorGrading:         { original: '', fallback: unsplash('photo-1574375927938-d5a98e8ffe85') },
  skyReplacement:       { original: '', fallback: unsplash('photo-1488229297570-58520851e868') },

  // ── Marketing & branding ─────────────────────────────────────────────────
  influencer:           { original: '', fallback: unsplash('photo-1529626455594-4ff0802cfb7e') },
  corporateIdentity:    { original: '', fallback: unsplash('photo-1519389950473-47ba0277781c') },
  eventCoverage:        { original: '', fallback: unsplash('photo-1492684223066-81342ee5ff30') },
  architecture:         { original: '', fallback: unsplash('photo-1487958449943-2429e8be8625') },
  flyers:               { original: '', fallback: unsplash('photo-1561070791-2526d30994b8') },
  socialKit:            { original: '', fallback: unsplash('photo-1611162618071-b39a2ec055fb') },

  // ── Add-on & premium ─────────────────────────────────────────────────────
  campaign:             { original: '', fallback: unsplash('photo-1504198266287-1659872e6590') },
  creativeDirection:    { original: '', fallback: unsplash('photo-1460723237483-7a6dc9d0b212') },

  // ── About / editorial ────────────────────────────────────────────────────
  photographer:         { original: '', fallback: unsplash('photo-1502920917128-1aa500764cbd') },
  photographerAtWork:   { original: '', fallback: unsplash('photo-1476610182048-b716b8518aae') },
  philosophy:           { original: '', fallback: unsplash('photo-1470225620780-dba8ba36b745') },
  wedding:              { original: '', fallback: unsplash('photo-1519741497674-611481863552') },

  // ── Ambient wide hero textures ───────────────────────────────────────────
  heroCinematic:        { original: '', fallback: unsplash('photo-1536440136628-849c177e76a1', 1920) },
  heroStudio:           { original: '', fallback: unsplash('photo-1542038784456-1ea8e935640e', 1920) },
  heroAerial:           { original: '', fallback: unsplash('photo-1507608616759-54f48f0af0ee', 1920) },
  heroBooking:          { original: '', fallback: unsplash('photo-1554941829-202a0b2403b8', 1920) },
  heroContact:          { original: '', fallback: unsplash('photo-1511285560929-80b456fea0bc', 1920) },
  heroServices:         { original: '', fallback: unsplash('photo-1500021804447-2ca2eaaaabeb', 1920) },
  heroAbout:            { original: '', fallback: unsplash('photo-1464822759023-fed622ff2c3b', 1920) },
} as const satisfies Record<string, ImageSource>;

export type ImageKey = keyof typeof IMAGE_SOURCES;

/**
 * Dedicated slots for the WebGL gallery on the homepage hero. These are
 * intentionally different from the on-page card imagery — moody/atmospheric
 * editorial stills — so the 3D scene reads as its own curated feed rather
 * than a restatement of what's already visible on the page.
 */
export const SCENE_IMAGE_SOURCES: { id: string; title: string; source: ImageSource }[] = [
  { id: 'scn-01', title: 'Silhouette',        source: { original: '', fallback: unsplash('photo-1493863641943-9b68992a8d07') } },
  { id: 'scn-02', title: 'Stage Smoke',       source: { original: '', fallback: unsplash('photo-1478720568477-152d9b164e26') } },
  { id: 'scn-03', title: 'Film Reel',         source: { original: '', fallback: unsplash('photo-1516035069371-29a1b244cc32') } },
  { id: 'scn-04', title: 'Neon Skyline',      source: { original: '', fallback: unsplash('photo-1551818255-e6e10975bc17') } },
  { id: 'scn-05', title: 'Long Exposure',     source: { original: '', fallback: unsplash('photo-1512427691650-15bfdf8879b3') } },
  { id: 'scn-06', title: 'Stage Lights',      source: { original: '', fallback: unsplash('photo-1518998053901-5348d3961a04') } },
  { id: 'scn-07', title: 'Studio Beam',       source: { original: '', fallback: unsplash('photo-1533105079780-92b9be482077') } },
  { id: 'scn-08', title: 'Light Abstract',    source: { original: '', fallback: unsplash('photo-1524492412937-b28074a5d7da') } },
  { id: 'scn-09', title: 'Moody Portrait',    source: { original: '', fallback: unsplash('photo-1503919545889-aef636e10ad4') } },
  { id: 'scn-10', title: 'Editorial Fashion', source: { original: '', fallback: unsplash('photo-1517404215738-15263e9f9178') } },
  { id: 'scn-11', title: 'Vinyl & Noir',      source: { original: '', fallback: unsplash('photo-1536152470836-b943b246224c') } },
  { id: 'scn-12', title: 'Camera Obscura',    source: { original: '', fallback: unsplash('photo-1510414842594-a61c69b5ae57') } },
];
