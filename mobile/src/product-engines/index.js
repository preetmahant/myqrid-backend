import { tagTypeConfig } from "../configs/tagTypeConfig";
import { moduleRegistry } from "../configs/moduleRegistry";

const basePermissions = ["view", "share", "analytics:summary"];

function buildEngine(tagType) {
  const config = tagTypeConfig[tagType] || tagTypeConfig.personal;
  const modules = config.modules.map(key => ({ key, ...moduleRegistry[key] })).filter(Boolean);

  return {
    tagType,
    title: config.title,
    engine: config.engine,
    fields: config.fields,
    modules,
    ctas: config.ctas,
    permissions: config.danger ? [...basePermissions, "emergency:sos"] : basePermissions,
    scanBehavior: config.engine === "returnMe" ? "finder_flow" : config.engine === "helpMe" ? "emergency_flow" : "identity_flow",
    visibleModules(profile = {}) {
      return modules.filter(module => !module.premium || profile.premiumStatus !== "free");
    }
  };
}

export const productEngines = {
  digitalIdentity: buildEngine("personal"),
  returnMe: buildEngine("asset"),
  helpMe: buildEngine("medical"),
  pet: buildEngine("pet"),
  vehicle: buildEngine("vehicle"),
  business: buildEngine("business"),
  forTagType: buildEngine
};
