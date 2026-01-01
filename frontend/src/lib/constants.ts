// lib/constants.ts -
import { Home, FolderKanban, BadgeCent, Plus } from "lucide-react";

export const ASSETS = {
  LOGO_TEXT: "/logoText.png",
  FAVICON: "/favicon.ico",
} as const;

export const ROUTES = {
  HOME: "/home",
  AI: "/canvas/ai",
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
    ROUTES.AI,
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
    title: "AI Canvas",
    Icon: Plus,
    href: ROUTES.AI,
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
