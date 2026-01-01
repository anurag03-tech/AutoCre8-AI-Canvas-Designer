// models/index.ts
import User from "./User";
import Brand from "./Brand";
import Project from "./Project";

export { User, Brand, Project };

export function ensureModelsRegistered() {
  return { User, Brand, Project };
}
