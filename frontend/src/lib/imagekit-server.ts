//  SERVER-SIDE ONLY - Only import this in API routes

import ImageKit from "imagekit";

// Only runs on server where env vars are available
export const imagekitServer = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});
