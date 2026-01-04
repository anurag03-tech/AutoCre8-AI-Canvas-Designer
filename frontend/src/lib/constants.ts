// lib/constants.ts
import { Home, FolderKanban, BadgeCent } from "lucide-react";

export const ASSETS = {
  LOGO_TEXT: "/logoText.png",
  FAVICON: "/favicon.ico",
} as const;

export const ROUTES = {
  HOME: "/home",
  PROJECT: "/project",
  BRAND: "/brand",
  PROFILE: "/profile",
  CANVAS: "/canvas/create",
  AUTH: "/auth",
  LANDING: "/",
} as const;

// Group routes by access level
export const ROUTE_GROUPS = {
  PUBLIC: [ROUTES.LANDING],
  AUTH: [ROUTES.AUTH],
  PROTECTED: [
    ROUTES.HOME,
    ROUTES.PROJECT,
    ROUTES.BRAND,
    ROUTES.PROFILE,
    ROUTES.CANVAS,
  ],
} as const;

export const SIDEBAR_CONFIG = [
  {
    title: "Home",
    Icon: Home,
    href: ROUTES.HOME,
  },
  {
    title: "Project",
    Icon: FolderKanban,
    href: ROUTES.PROJECT,
  },
  {
    title: "Brand",
    Icon: BadgeCent,
    href: ROUTES.BRAND,
  },
] as const;

// ✅ CANVAS SIZE TEMPLATES (SINGLE SOURCE OF TRUTH)
export const CANVAS_TEMPLATES = {
  "instagram-post": {
    width: 1080,
    height: 1080,
    unit: "px",
    label: "Instagram Post (1080×1080)",
    category: "Social Media",
  },
  "instagram-story": {
    width: 1080,
    height: 1920,
    unit: "px",
    label: "Instagram Story (1080×1920)",
    category: "Social Media",
  },
  "facebook-post": {
    width: 1200,
    height: 630,
    unit: "px",
    label: "Facebook Post (1200×630)",
    category: "Social Media",
  },
  "twitter-post": {
    width: 1200,
    height: 675,
    unit: "px",
    label: "Twitter Post (1200×675)",
    category: "Social Media",
  },
  "linkedin-post": {
    width: 1200,
    height: 627,
    unit: "px",
    label: "LinkedIn Post (1200×627)",
    category: "Social Media",
  },
  "youtube-thumbnail": {
    width: 1280,
    height: 720,
    unit: "px",
    label: "YouTube Thumbnail (1280×720)",
    category: "Video",
  },
  "presentation-slide": {
    width: 1920,
    height: 1080,
    unit: "px",
    label: "Presentation (1920×1080)",
    category: "Presentation",
  },
  "web-banner": {
    width: 728,
    height: 90,
    unit: "px",
    label: "Web Banner (728×90)",
    category: "Web",
  },
  poster: {
    width: 1728,
    height: 2304,
    unit: "px", // 18×24 inches at 96 DPI
    label: "Poster (18×24 in)",
    category: "Print",
  },
  flyer: {
    width: 816,
    height: 1056,
    unit: "px", // 8.5×11 inches at 96 DPI
    label: "Flyer (8.5×11 in)",
    category: "Print",
  },
  "business-card": {
    width: 336,
    height: 192,
    unit: "px", // 3.5×2 inches at 96 DPI
    label: "Business Card (3.5×2 in)",
    category: "Print",
  },
  custom: {
    width: 1920,
    height: 1080,
    unit: "px",
    label: "Custom Size",
    category: "Custom",
  },
} as const;

export type CanvasTemplateKey = keyof typeof CANVAS_TEMPLATES;
