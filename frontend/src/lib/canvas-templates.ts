// lib/canvas-templates.ts

export const CANVAS_TEMPLATES = {
  "instagram-post": { width: 1080, height: 1080, unit: "px" },
  "instagram-story": { width: 1080, height: 1920, unit: "px" },
  "facebook-post": { width: 1200, height: 630, unit: "px" },
  "twitter-post": { width: 1200, height: 675, unit: "px" },
  "linkedin-post": { width: 1200, height: 627, unit: "px" },
  "youtube-thumbnail": { width: 1280, height: 720, unit: "px" },
  poster: { width: 18, height: 24, unit: "in" },
  flyer: { width: 8.5, height: 11, unit: "in" },
  "business-card": { width: 3.5, height: 2, unit: "in" },
  "presentation-slide": { width: 1920, height: 1080, unit: "px" },
  "web-banner": { width: 728, height: 90, unit: "px" },
  custom: { width: 1920, height: 1080, unit: "px" },
} as const;
