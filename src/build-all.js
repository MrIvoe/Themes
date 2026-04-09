const fs = require("node:fs");
const path = require("node:path");

const { flattenTokens, flattenSemantic } = require("./resolve-token-path");
const { validateThemePair } = require("./validate-theme");
const { exportCss } = require("../adapters/css/export-css");
const { exportJson } = require("../adapters/json/export-json");
const { exportPython } = require("../adapters/python/export-python");
const { exportC } = require("../adapters/c/export-c");
const { exportCpp } = require("../adapters/cpp/export-cpp");
const { exportJava } = require("../adapters/java/export-java");
const { exportScss } = require("../adapters/scss/export-scss");
const { exportTailwind } = require("../adapters/tailwind/export-tailwind");
const { exportQt } = require("../adapters/qt/export-qt");
const { exportTkinter } = require("../adapters/tkinter/export-tkinter");

function writeText(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function flattenScalars(value, prefix = "", out = {}) {
  for (const [key, raw] of Object.entries(value || {})) {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      flattenScalars(raw, nextPath, out);
      continue;
    }
    out[nextPath] = raw;
  }
  return out;
}

function resolveReferenceValue(rawValue, flatTokens, flatSemantic, flatScale) {
  if (typeof rawValue !== "string") {
    return rawValue;
  }

  if (rawValue in flatTokens) {
    return flatTokens[rawValue];
  }

  if (rawValue in flatScale) {
    return flatScale[rawValue];
  }

  if (rawValue in flatSemantic) {
    const tokenPath = flatSemantic[rawValue];
    if (typeof tokenPath === "string" && tokenPath in flatTokens) {
      return flatTokens[tokenPath];
    }
  }

  return rawValue;
}

function resolveObjectRefs(value, flatTokens, flatSemantic, flatScale) {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveObjectRefs(entry, flatTokens, flatSemantic, flatScale));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveObjectRefs(child, flatTokens, flatSemantic, flatScale)])
    );
  }

  return resolveReferenceValue(value, flatTokens, flatSemantic, flatScale);
}

function getThemeIds(themesDir, requestedThemeId) {
  if (requestedThemeId) {
    return [requestedThemeId];
  }

  return fs
    .readdirSync(themesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function buildTheme(rootDir, themeId) {
  const themeDir = path.join(rootDir, "themes", themeId);
  const themePath = path.join(themeDir, "theme.json");
  const semanticPath = path.join(themeDir, "semantic.json");
  const componentsPath = fs.existsSync(path.join(themeDir, "components.json")) ? path.join(themeDir, "components.json") : undefined;
  const iconsPath = fs.existsSync(path.join(themeDir, "icons.json")) ? path.join(themeDir, "icons.json") : undefined;
  const resourcesPath = fs.existsSync(path.join(themeDir, "resources.json")) ? path.join(themeDir, "resources.json") : undefined;

  const result = validateThemePair(themePath, semanticPath, componentsPath, iconsPath, resourcesPath);
  if (!result.valid) {
    throw new Error(`Validation failed for ${themeId}:\n${result.errors.map((e) => `- ${e}`).join("\n")}`);
  }

  const flatTokens = flattenTokens(result.theme.tokens);
  const flatSemantic = flattenSemantic(result.semantic);
  const flatScale = flattenScalars(result.theme.scale || {});
  const flatMotion = flattenScalars((result.theme.scale && result.theme.scale.motion) || {});
  const resolvedComponents = flattenScalars(
    resolveObjectRefs(result.components || {}, flatTokens, flatSemantic, flatScale)
  );
  const flatResources = flattenScalars(result.resources || {});

  const jsonPayload = {
    meta: {
      themeId,
      version: result.theme.meta && result.theme.meta.version ? result.theme.meta.version : undefined
    },
    tokens: flatTokens,
    semantic: flatSemantic,
    scale: flatScale,
    motion: flatMotion,
    components: resolvedComponents,
    resources: flatResources
  };

  writeText(path.join(rootDir, "dist", "css", `${themeId}.css`), exportCss(flatTokens));
  writeText(path.join(rootDir, "dist", "json", `${themeId}.json`), exportJson(jsonPayload));
  writeText(path.join(rootDir, "dist", "python", `${themeId}.py`), exportPython(flatTokens));
  writeText(path.join(rootDir, "dist", "c", `${themeId}.h`), exportC(themeId, flatTokens));
  writeText(path.join(rootDir, "dist", "cpp", `${themeId}.hpp`), exportCpp(flatTokens));
  writeText(path.join(rootDir, "dist", "java", `${themeId}.java`), exportJava(themeId, flatTokens));
  writeText(path.join(rootDir, "dist", "scss", `_${themeId}.scss`), exportScss(flatTokens));
  writeText(path.join(rootDir, "dist", "tailwind", `${themeId}.config.js`), exportTailwind(flatTokens));
  writeText(path.join(rootDir, "dist", "qt", `${themeId}.qss`), exportQt(themeId, flatTokens));
  writeText(path.join(rootDir, "dist", "tkinter", `${themeId}.py`), exportTkinter(flatTokens));

  if (resourcesPath) {
    const resources = JSON.parse(fs.readFileSync(resourcesPath, "utf8"));
    writeJson(path.join(rootDir, "dist", "json", `${themeId}.resources.json`), resources);
  }

  console.log(`Built theme '${themeId}' into dist outputs`);
}

function main() {
  const rootDir = path.resolve(__dirname, "..");
  const themesDir = path.join(rootDir, "themes");
  const requestedThemeId = process.argv[2];

  if (!fs.existsSync(themesDir)) {
    throw new Error(`Themes directory not found: ${themesDir}`);
  }

  const themeIds = getThemeIds(themesDir, requestedThemeId);
  if (themeIds.length === 0) {
    throw new Error("No themes found to build");
  }

  for (const themeId of themeIds) {
    buildTheme(rootDir, themeId);
  }
}

if (require.main === module) {
  main();
}
