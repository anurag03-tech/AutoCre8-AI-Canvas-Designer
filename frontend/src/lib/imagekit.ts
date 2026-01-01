// Base endpoint (still useful if you ever need to build URLs from paths)
export const imagekitUrlEndpoint =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";

// Helper to append / merge ImageKit transformations as query params
function appendTransform(url: string, transform: string) {
  const [base, existingQuery] = url.split("?");
  const searchParams = new URLSearchParams(existingQuery || "");

  const currentTr = searchParams.get("tr");

  if (currentTr) {
    // Append to existing transforms: tr=e-bgremove,e-contrast
    searchParams.set("tr", `${currentTr},${transform}`);
  } else {
    searchParams.set("tr", transform);
  }

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}

// Transformation helpers (pure URL manipulation, no SDK needed)
export const imagekitTransformations = {
  // ✅ Background removal (cheap ImageKit AI: e-bgremove)
  // For remove.bg quality instead, switch to "e-removedotbg".
  removeBg: (imageUrl: string) => {
    return appendTransform(imageUrl, "e-bgremove");
    // or: return appendTransform(imageUrl, "e-removedotbg");
  },

  // Resize
  resize: (imageUrl: string, width: number, height?: number) => {
    const tr = height ? `w-${width},h-${height}` : `w-${width}`;
    return appendTransform(imageUrl, tr);
  },

  // Blur
  blur: (imageUrl: string, intensity: number = 10) => {
    return appendTransform(imageUrl, `bl-${intensity}`);
  },

  // Grayscale
  grayscale: (imageUrl: string) => {
    return appendTransform(imageUrl, "e-grayscale");
  },

  // Sharpen
  sharpen: (imageUrl: string, intensity: number = 5) => {
    return appendTransform(imageUrl, `e-sharpen-${intensity}`);
  },

  // Auto enhancement
  autoEnhance: (imageUrl: string) => {
    return appendTransform(imageUrl, "e-contrast,e-sharpen");
  },

  // Multiple transformations (raw string, e.g. "e-bgremove,e-changebg(white)")
  custom: (imageUrl: string, transformations: string) => {
    return appendTransform(imageUrl, transformations);
  },
};
