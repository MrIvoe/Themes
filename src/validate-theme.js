const fs = require("node:fs");
const path = require("node:path");
const { flattenTokens, flattenSemantic } = require("./resolve-token-path");

const REQUIRED_TOKEN_GROUPS = ["background", "surface", "text", "accent", "border", "state", "syntax"];
const HEX_COLOR_PATTERN = /^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
const TOKEN_REF_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
const KEBAB_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const COMPONENT_NAMESPACES = new Set([
  "button",
  "input",
  "switch",
  "slider",
  "dropdown",
  "select",
  "menu",
  "tab",
  "card",
  "modal",
  "notification",
  "fence",
  "checkbox",
  "radio",
  "tooltip",
  "alert",
  "badge",
  "table",
  "tree",
  "scrollbar",
  "editor",
  "titlebar",
  "sidebar",
  "settings",
  "tray",
  "plugin"
]);

const BANNED_COMPONENT_NAMES = new Set(["toggle", "tabs"]);

const REQUIRED_INTERACTIVE_FIELDS = {
  button: ["bg", "text", "border", "focusRing"],
  input: ["bg", "text", "border", "focusRing"],
  switch: ["focusRing"],
  slider: ["focusRing"],
  dropdown: ["bg", "border", "focusRing"],
  select: ["bg", "text", "border"],
  tab: ["text"],
  menu: ["bg", "itemText"],
  card: ["bg"],
  modal: ["bg", "border"],
  notification: []
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function hasPath(target, dotPath) {
  if (!target || typeof target !== "object" || typeof dotPath !== "string") {
    return false;
  }
  const segments = dotPath.split(".");
  let cursor = target;
  for (const segment of segments) {
    if (!cursor || typeof cursor !== "object" || !(segment in cursor)) {
      return false;
    }
    cursor = cursor[segment];
  }
  return true;
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

function parseHexColor(hex) {
  if (typeof hex !== "string" || !HEX_COLOR_PATTERN.test(hex)) {
    return null;
  }

  const normalized = hex.replace("#", "");
  if (normalized.length === 6) {
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
      a: 1
    };
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
    a: parseInt(normalized.slice(6, 8), 16) / 255
  };
}

function relativeLuminance(rgb) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrastRatio(a, b) {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function validateScale(theme) {
  const errors = [];
  if (!theme.scale || typeof theme.scale !== "object") {
    return errors;
  }

  function walk(node, nodePath) {
    if (node === null || node === undefined) {
      errors.push(`Scale node '${nodePath}' is null/undefined`);
      return;
    }
    if (typeof node === "object" && !Array.isArray(node)) {
      for (const [key, value] of Object.entries(node)) {
        walk(value, `${nodePath}.${key}`);
      }
      return;
    }
    if (typeof node === "number" || typeof node === "string") {
      return;
    }
    errors.push(`Scale node '${nodePath}' has unexpected type '${typeof node}'`);
  }

  for (const [group, value] of Object.entries(theme.scale)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      errors.push(`scale.${group} must be an object`);
      continue;
    }
    walk(value, `scale.${group}`);
  }

  return errors;
}

function validateTheme(theme) {
  const errors = [];
  assert(theme && typeof theme === "object", "Theme must be an object", errors);
  if (!theme || typeof theme !== "object") {
    return errors;
  }

  assert(theme.meta && typeof theme.meta === "object", "Missing theme.meta", errors);
  assert(theme.tokens && typeof theme.tokens === "object", "Missing theme.tokens", errors);

  if (theme.meta) {
    assert(typeof theme.meta.id === "string" && KEBAB_PATTERN.test(theme.meta.id), "theme.meta.id must be kebab-case", errors);
    assert(typeof theme.meta.name === "string" && theme.meta.name.length > 0, "theme.meta.name is required", errors);
    assert(typeof theme.meta.version === "string" && /^[0-9]+\.[0-9]+\.[0-9]+$/.test(theme.meta.version), "theme.meta.version must match x.y.z", errors);
    assert(theme.meta.mode === "light" || theme.meta.mode === "dark", "theme.meta.mode must be light or dark", errors);
  }

  if (theme.tokens) {
    for (const group of REQUIRED_TOKEN_GROUPS) {
      assert(theme.tokens[group] && typeof theme.tokens[group] === "object", `Missing token group '${group}'`, errors);
    }
    const flatTokens = flattenTokens(theme.tokens);
    for (const [tokenPath, tokenValue] of Object.entries(flatTokens)) {
      assert(typeof tokenValue === "string", `Token '${tokenPath}' must be a string`, errors);
      assert(HEX_COLOR_PATTERN.test(String(tokenValue)), `Token '${tokenPath}' must be #RRGGBB or #RRGGBBAA`, errors);
    }
  }

  errors.push(...validateScale(theme));
  return errors;
}

function validateSemantic(semantic, theme) {
  const errors = [];
  assert(semantic && typeof semantic === "object", "Semantic file must be an object", errors);
  if (!semantic || typeof semantic !== "object") {
    return errors;
  }

  for (const banned of BANNED_COMPONENT_NAMES) {
    if (Object.prototype.hasOwnProperty.call(semantic, banned)) {
      errors.push(`semantic namespace '${banned}' is disallowed by naming law; use singular canonical names`);
    }
  }

  const flatSemantic = flattenSemantic(semantic);
  const flatTokens = flattenTokens((theme && theme.tokens) || {});
  for (const [semanticPath, tokenPath] of Object.entries(flatSemantic)) {
    assert(typeof tokenPath === "string", `Semantic '${semanticPath}' must map to a token path string`, errors);
    if (typeof tokenPath === "string") {
      assert(Object.prototype.hasOwnProperty.call(flatTokens, tokenPath), `Semantic '${semanticPath}' points to missing token '${tokenPath}'`, errors);
    }
  }
  return errors;
}

function validateComponentRequiredFields(components, errors) {
  for (const [componentName, requiredFields] of Object.entries(REQUIRED_INTERACTIVE_FIELDS)) {
    const variants = components[componentName];
    if (!variants || typeof variants !== "object" || Array.isArray(variants)) {
      continue;
    }

    for (const [variantName, variantConfig] of Object.entries(variants)) {
      if (!variantConfig || typeof variantConfig !== "object" || Array.isArray(variantConfig)) {
        continue;
      }
      for (const field of requiredFields) {
        if (!(field in variantConfig)) {
          errors.push(`components.${componentName}.${variantName} is missing required field '${field}'`);
        }
      }
    }
  }
}

function validateComponentContrast(components, theme, errors) {
  const flatTokens = flattenTokens((theme && theme.tokens) || {});

  const evaluateNode = (nodePath, node) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      return;
    }

    const bgRef = node.bg || node.background;
    const textRef = node.text || node.itemText || node.activeText || node.titleText;
    if (typeof bgRef !== "string" || typeof textRef !== "string") {
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(flatTokens, bgRef) || !Object.prototype.hasOwnProperty.call(flatTokens, textRef)) {
      return;
    }

    const bg = parseHexColor(flatTokens[bgRef]);
    const fg = parseHexColor(flatTokens[textRef]);
    if (!bg || !fg) {
      return;
    }
    if (bg.a < 1 || fg.a < 1) {
      return;
    }

    const ratio = contrastRatio(bg, fg);
    if (ratio < 3.0) {
      errors.push(`${nodePath} contrast ratio is ${ratio.toFixed(2)}:1 (< 3.0) for text/background`);
    }
  };

  for (const [componentName, variants] of Object.entries(components || {})) {
    if (!variants || typeof variants !== "object" || Array.isArray(variants)) {
      continue;
    }
    for (const [variantName, config] of Object.entries(variants)) {
      evaluateNode(`components.${componentName}.${variantName}`, config);
    }
  }
}

function validateComponents(components, theme) {
  const errors = [];
  assert(components && typeof components === "object", "Components file must be an object", errors);
  if (!components || typeof components !== "object") {
    return errors;
  }

  for (const key of Object.keys(components)) {
    if (BANNED_COMPONENT_NAMES.has(key)) {
      errors.push(`components namespace '${key}' is disallowed by naming law; use singular canonical names`);
    }
  }

  const flatTokens = flattenTokens((theme && theme.tokens) || {});
  const flatScale = flattenScalars((theme && theme.scale) || {});

  function hasToken(ref) {
    return Object.prototype.hasOwnProperty.call(flatTokens, ref) || Object.prototype.hasOwnProperty.call(flatScale, ref);
  }

  function walkNode(node, nodePath) {
    if (node === null || node === undefined) {
      errors.push(`Component node '${nodePath}' is null/undefined`);
      return;
    }
    if (typeof node === "object" && !Array.isArray(node)) {
      for (const [key, value] of Object.entries(node)) {
        walkNode(value, `${nodePath}.${key}`);
      }
      return;
    }
    if (typeof node === "number") {
      return;
    }
    if (typeof node === "string") {
      if (TOKEN_REF_PATTERN.test(node)) {
        assert(hasToken(node), `Component '${nodePath}' references missing token '${node}'`, errors);
      }
      return;
    }
    errors.push(`Component node '${nodePath}' has unexpected type '${typeof node}'`);
  }

  for (const [key, value] of Object.entries(components)) {
    walkNode(value, key);
  }

  validateComponentRequiredFields(components, errors);
  validateComponentContrast(components, theme, errors);
  return errors;
}

function validateIcons(icons, theme) {
  const errors = [];
  assert(icons && typeof icons === "object", "Icons file must be an object", errors);
  if (!icons || typeof icons !== "object") {
    return errors;
  }

  assert(icons.meta && typeof icons.meta === "object", "icons.meta required", errors);
  if (icons.meta) {
    assert(typeof icons.meta.themeId === "string" && icons.meta.themeId.length > 0, "icons.meta.themeId must be non-empty", errors);
    assert(typeof icons.meta.version === "string" && /^[0-9]+\.[0-9]+\.[0-9]+$/.test(icons.meta.version), "icons.meta.version must match x.y.z", errors);
  }

  assert(icons.icon && typeof icons.icon === "object", "icons.icon required", errors);
  if (!icons.icon || typeof icons.icon !== "object") {
    return errors;
  }

  const icon = icons.icon;
  assert(icon.size && typeof icon.size === "object", "icons.icon.size required", errors);
  if (icon.size && typeof icon.size === "object") {
    for (const [sizeName, sizeValue] of Object.entries(icon.size)) {
      assert(typeof sizeValue === "number" && sizeValue > 0, `icons.icon.size.${sizeName} must be a positive number`, errors);
    }
  }

  const flatTokens = flattenTokens((theme && theme.tokens) || {});
  const colorNames = new Set();
  assert(icon.color && typeof icon.color === "object", "icons.icon.color required", errors);
  if (icon.color && typeof icon.color === "object") {
    for (const [colorName, tokenPath] of Object.entries(icon.color)) {
      colorNames.add(colorName);
      assert(typeof tokenPath === "string" && TOKEN_REF_PATTERN.test(tokenPath), `icons.icon.color.${colorName} must be a dot-path`, errors);
      if (typeof tokenPath === "string") {
        assert(Object.prototype.hasOwnProperty.call(flatTokens, tokenPath), `icons.icon.color.${colorName} references missing token '${tokenPath}'`, errors);
      }
    }
  }

  assert(icon.roles && typeof icon.roles === "object", "icons.icon.roles required", errors);
  if (icon.roles && typeof icon.roles === "object") {
    for (const [rolePath, colorName] of Object.entries(icon.roles)) {
      assert(typeof colorName === "string" && colorName.length > 0, `icons.icon.roles.${rolePath} must be non-empty string`, errors);
      if (typeof colorName === "string") {
        assert(colorNames.has(colorName), `icons.icon.roles.${rolePath} references unknown color '${colorName}'`, errors);
      }
    }
  }

  return errors;
}

function validateDefaultInAvailable(container, defaultKey, availableKey, label, errors) {
  if (!container || typeof container !== "object") {
    return;
  }

  const defaultValue = container[defaultKey];
  const available = container[availableKey];
  if (defaultValue === undefined && available === undefined) {
    return;
  }

  assert(typeof defaultValue === "string" && defaultValue.length > 0, `${label}.${defaultKey} must be a non-empty string`, errors);
  assert(Array.isArray(available) && available.length > 0, `${label}.${availableKey} must be a non-empty array`, errors);
  if (typeof defaultValue === "string" && Array.isArray(available)) {
    assert(available.includes(defaultValue), `${label}.${defaultKey} must exist in ${label}.${availableKey}`, errors);
  }
}

function collectComponentRefs(node, currentPath = "", out = []) {
  if (!node || typeof node !== "object") {
    return out;
  }
  for (const [key, value] of Object.entries(node)) {
    const nodePath = currentPath ? `${currentPath}.${key}` : key;
    if (key === "componentRef") {
      out.push({ nodePath, ref: value });
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      collectComponentRefs(value, nodePath, out);
    }
  }
  return out;
}

function validateFamilyMetadata(resources, errors) {
  const ui = resources.ui;
  assert(ui.componentFamily && typeof ui.componentFamily === "object", "resources.ui.componentFamily required", errors);
  if (!ui.componentFamily || typeof ui.componentFamily !== "object") {
    return;
  }

  validateDefaultInAvailable(ui.componentFamily, "default", "available", "resources.ui.componentFamily", errors);

  assert(ui.familySupport && typeof ui.familySupport === "object", "resources.ui.familySupport required", errors);
  assert(ui.familyDna && typeof ui.familyDna === "object", "resources.ui.familyDna required", errors);
  if (!Array.isArray(ui.componentFamily.available)) {
    return;
  }

  const validStatus = new Set(["stable", "partial", "experimental", "planned"]);
  for (const family of ui.componentFamily.available) {
    const support = ui.familySupport && ui.familySupport[family];
    const dna = ui.familyDna && ui.familyDna[family];

    assert(Boolean(support), `resources.ui.familySupport.${family} is required`, errors);
    assert(Boolean(dna), `resources.ui.familyDna.${family} is required`, errors);
    if (support) {
      assert(validStatus.has(support.status), `resources.ui.familySupport.${family}.status must be stable|partial|experimental|planned`, errors);
      assert(Array.isArray(support.supportedComponents) && support.supportedComponents.length > 0,
        `resources.ui.familySupport.${family}.supportedComponents must be a non-empty array`, errors);
      assert(typeof support.fallbackFamily === "string" && support.fallbackFamily.length > 0,
        `resources.ui.familySupport.${family}.fallbackFamily must be a non-empty string`, errors);
      if (typeof support.fallbackFamily === "string") {
        assert(ui.componentFamily.available.includes(support.fallbackFamily),
          `resources.ui.familySupport.${family}.fallbackFamily '${support.fallbackFamily}' must exist in resources.ui.componentFamily.available`, errors);
      }
    }

    if (dna) {
      for (const key of ["mood", "shapeLanguage", "density", "motionCharacter", "glowUsage", "surfaceStyle", "accentStrategy"]) {
        assert(Object.prototype.hasOwnProperty.call(dna, key), `resources.ui.familyDna.${family}.${key} is required`, errors);
      }
      if (Array.isArray(dna.mood)) {
        assert(dna.mood.length > 0, `resources.ui.familyDna.${family}.mood must be non-empty array`, errors);
      }
    }
  }
}

function validateResources(resources, components, icons) {
  const errors = [];
  assert(resources && typeof resources === "object", "Resources file must be an object", errors);
  if (!resources || typeof resources !== "object") {
    return errors;
  }

  assert(resources.meta && typeof resources.meta === "object", "resources.meta required", errors);
  if (resources.meta) {
    assert(typeof resources.meta.themeId === "string" && resources.meta.themeId.length > 0, "resources.meta.themeId must be non-empty", errors);
    assert(typeof resources.meta.version === "string" && /^[0-9]+\.[0-9]+\.[0-9]+$/.test(resources.meta.version), "resources.meta.version must match x.y.z", errors);
  }

  assert(resources.ui && typeof resources.ui === "object", "resources.ui required", errors);
  if (!resources.ui || typeof resources.ui !== "object") {
    return errors;
  }

  const ui = resources.ui;
  const iconPacks = (icons && icons.icon && icons.icon.packs && typeof icons.icon.packs === "object") ? icons.icon.packs : {};
  const availablePackNames = new Set(Object.keys(iconPacks));

  assert(ui.icons && typeof ui.icons === "object", "resources.ui.icons required", errors);
  if (ui.icons && typeof ui.icons === "object") {
    validateDefaultInAvailable(ui.icons, "defaultPack", "availablePacks", "resources.ui.icons", errors);
    if (Array.isArray(ui.icons.availablePacks)) {
      for (const packName of ui.icons.availablePacks) {
        assert(availablePackNames.has(packName), `resources.ui.icons.availablePacks contains unknown pack '${packName}'`, errors);
      }
    }
    if (typeof ui.icons.defaultPack === "string") {
      assert(availablePackNames.has(ui.icons.defaultPack), `resources.ui.icons.defaultPack references unknown pack '${ui.icons.defaultPack}'`, errors);
    }
  }

  assert(ui.buttons && typeof ui.buttons === "object", "resources.ui.buttons required", errors);
  if (ui.buttons && typeof ui.buttons === "object") {
    validateDefaultInAvailable(ui.buttons, "defaultStyle", "availableStyles", "resources.ui.buttons", errors);
    if (!Array.isArray(ui.buttons.availableStyles) && ui.buttons.styles && typeof ui.buttons.styles === "object") {
      ui.buttons.availableStyles = Object.keys(ui.buttons.styles);
    }

    validateDefaultInAvailable(ui.buttons, "defaultFamily", "availableFamilies", "resources.ui.buttons", errors);
    assert(ui.buttons.families && typeof ui.buttons.families === "object", "resources.ui.buttons.families must be object", errors);
    assert(ui.buttons.styles && typeof ui.buttons.styles === "object", "resources.ui.buttons.styles must be object", errors);

    const styleNames = ui.buttons.styles && typeof ui.buttons.styles === "object" ? Object.keys(ui.buttons.styles) : [];
    if (ui.buttons.families && typeof ui.buttons.families === "object") {
      for (const [familyName, familyConfig] of Object.entries(ui.buttons.families)) {
        assert(familyConfig && typeof familyConfig === "object", `resources.ui.buttons.families.${familyName} must be object`, errors);
        if (!familyConfig || typeof familyConfig !== "object") {
          continue;
        }
        assert(typeof familyConfig.defaultStyle === "string", `resources.ui.buttons.families.${familyName}.defaultStyle must be string`, errors);
        assert(Array.isArray(familyConfig.styles) && familyConfig.styles.length > 0,
          `resources.ui.buttons.families.${familyName}.styles must be non-empty array`, errors);
        if (typeof familyConfig.defaultStyle === "string") {
          assert(styleNames.includes(familyConfig.defaultStyle), `resources.ui.buttons.families.${familyName}.defaultStyle must exist in styles`, errors);
        }
      }
    }
  }

  for (const bucket of ["menus", "tabs", "inputs", "notifications", "cards", "motion", "fences"]) {
    const value = ui[bucket];
    if (!value || typeof value !== "object") {
      continue;
    }
    validateDefaultInAvailable(value, "defaultStyle", "availableStyles", `resources.ui.${bucket}`, errors);
    validateDefaultInAvailable(value, "defaultFamily", "availableFamilies", `resources.ui.${bucket}`, errors);
    validateDefaultInAvailable(value, "defaultPreset", "availablePresets", `resources.ui.${bucket}`, errors);
  }

  if (ui.controls && typeof ui.controls === "object") {
    for (const [controlName, presets] of Object.entries(ui.controls)) {
      assert(controlName !== "toggle", "resources.ui.controls.toggle is disallowed; use resources.ui.controls.switch", errors);
      assert(presets && typeof presets === "object" && !Array.isArray(presets), `resources.ui.controls.${controlName} must be object`, errors);
      if (!presets || typeof presets !== "object" || Array.isArray(presets)) {
        continue;
      }
      for (const [presetName, componentRef] of Object.entries(presets)) {
        assert(typeof componentRef === "string" && componentRef.length > 0,
          `resources.ui.controls.${controlName}.${presetName} must be non-empty string`, errors);
      }
    }
  }

  const refs = collectComponentRefs(ui, "resources.ui", []);
  for (const { nodePath, ref } of refs) {
    assert(typeof ref === "string" && ref.length > 0, `${nodePath} must be a non-empty string`, errors);
    if (typeof ref !== "string") {
      continue;
    }

    const namespace = ref.split(".")[0];
    assert(!BANNED_COMPONENT_NAMES.has(namespace), `${nodePath} points to disallowed namespace '${namespace}'`, errors);
    assert(COMPONENT_NAMESPACES.has(namespace), `${nodePath} points to non-canonical namespace '${namespace}'`, errors);
    assert(hasPath(components, ref), `${nodePath} references missing component '${ref}'`, errors);
  }

  validateFamilyMetadata(resources, errors);

  assert(ui.accessibility && typeof ui.accessibility === "object", "resources.ui.accessibility required", errors);
  if (ui.accessibility && typeof ui.accessibility === "object") {
    for (const key of ["focusRingWidth", "focusRingOffset", "focusStyle", "contrastTarget", "keyboardVisibleFocusRequired"]) {
      assert(Object.prototype.hasOwnProperty.call(ui.accessibility, key), `resources.ui.accessibility.${key} is required`, errors);
    }
  }

  return errors;
}

function validateThemePair(themePath, semanticPath, componentsPath, iconsPath, resourcesPath) {
  const theme = readJson(themePath);
  const semantic = readJson(semanticPath);
  const components = componentsPath ? readJson(componentsPath) : undefined;
  const icons = iconsPath ? readJson(iconsPath) : undefined;
  const resources = resourcesPath ? readJson(resourcesPath) : undefined;

  const errors = [...validateTheme(theme), ...validateSemantic(semantic, theme)];

  if (components) {
    errors.push(...validateComponents(components, theme));
  }
  if (icons) {
    errors.push(...validateIcons(icons, theme));
  }
  if (resourcesPath) {
    if (!components || !icons) {
      errors.push("resources.json validation requires both components.json and icons.json");
    } else {
      errors.push(...validateResources(resources, components, icons));
    }
  }

  return { valid: errors.length === 0, errors, theme, semantic, components, icons, resources };
}

function validateThemeDirectory(themeDir) {
  const themePath = path.join(themeDir, "theme.json");
  const semanticPath = path.join(themeDir, "semantic.json");
  const componentsPath = fs.existsSync(path.join(themeDir, "components.json")) ? path.join(themeDir, "components.json") : undefined;
  const iconsPath = fs.existsSync(path.join(themeDir, "icons.json")) ? path.join(themeDir, "icons.json") : undefined;
  const resourcesPath = fs.existsSync(path.join(themeDir, "resources.json")) ? path.join(themeDir, "resources.json") : undefined;

  return validateThemePair(themePath, semanticPath, componentsPath, iconsPath, resourcesPath);
}

function main() {
  if (process.argv[2] === "--all") {
    const rootDir = path.resolve(__dirname, "..");
    const themesDir = path.join(rootDir, "themes");
    const themeIds = fs.readdirSync(themesDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    const allErrors = [];

    for (const themeId of themeIds) {
      const themeDir = path.join(themesDir, themeId);
      const result = validateThemeDirectory(themeDir);
      if (!result.valid) {
        for (const err of result.errors) {
          allErrors.push(`[${themeId}] ${err}`);
        }
      }
    }

    if (allErrors.length > 0) {
      for (const err of allErrors) {
        console.error(`- ${err}`);
      }
      process.exit(1);
    }

    console.log(`Validation passed for ${themeIds.length} theme(s)`);
    return;
  }

  const themePath = process.argv[2];
  const semanticPath = process.argv[3];
  if (!themePath || !semanticPath) {
    console.error("Usage: node src/validate-theme.js <theme.json> <semantic.json> [components.json] [icons.json] [resources.json]");
    console.error("   or: node src/validate-theme.js --all");
    process.exit(2);
  }

  const result = validateThemePair(
    path.resolve(themePath),
    path.resolve(semanticPath),
    process.argv[4] ? path.resolve(process.argv[4]) : undefined,
    process.argv[5] ? path.resolve(process.argv[5]) : undefined,
    process.argv[6] ? path.resolve(process.argv[6]) : undefined
  );

  if (!result.valid) {
    for (const err of result.errors) {
      console.error(`- ${err}`);
    }
    process.exit(1);
  }

  console.log(`Validation passed for ${path.resolve(themePath)} and ${path.resolve(semanticPath)}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  validateTheme,
  validateSemantic,
  validateComponents,
  validateIcons,
  validateResources,
  validateThemePair,
  validateThemeDirectory
};
