import { productEngines } from "../product-engines";

export function useProductEngine(tagType, profile) {
  const engine = productEngines.forTagType(tagType);
  return {
    ...engine,
    visibleModules: engine.visibleModules(profile)
  };
}
