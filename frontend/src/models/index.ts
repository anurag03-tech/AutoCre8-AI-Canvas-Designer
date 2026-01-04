// models/index.ts
import User from "./User";
import Brand from "./Brand";
import Project from "./Project";
import Canvas from "./Canvas";

export { User, Brand, Project, Canvas };

export function ensureModelsRegistered() {
  return { User, Brand, Project, Canvas };
}
