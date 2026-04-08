const fs = require("node:fs");
const path = require("node:path");
const { flattenTokens, flattenSemantic } = require("./resolve-token-path");

const REQUIRED_TOKEN_GROUPS = [
  "background",
  "surface",
  "text",
  "accent",
  "border",
  "state",
  "syntax"
];

const HEX_COLOR_PATTERN = /^#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
const TOKEN_REF_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function assert(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function validateTheme(theme) {
  const errors = [];

  assert(theme && typeof theme === "object", "Theme must be an object", errors);
  if (errors.length > 0) {
    return errors;
  }

  assert(theme.meta && typeof theme.meta === "object", "Missing meta object", errors);
  assert(theme.tokens && typeof theme.tokens === "object", "Missing tokens object", errors);

  if (theme.meta) {
    assert(typeof theme.meta.id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(theme.meta.id), "meta.id must be kebab-case", errors);
    assert(typeof theme.meta.name === "string" && theme.meta.name.length > 0, "meta.name is required", errors);
    assert(typeof theme.meta.version === "string" && /^[0-9]+\.[0-9]+\.[0-9]+$/.test(theme.meta.version), "meta.version must match x.y.z", errors);
    assert(theme.meta.mode === "light" || theme.meta.mode === "dark", "meta.mode must be light or dark", errors);
  }

  if (theme.tokens) {
    for (const group of REQUIRED_TOKEN_GROUPS) {
      assert(theme.tokens[group] && typeof theme.tokens[group] === "object", `Missing required token group: ${group}`, errors);
    }

    const flatTokens = flattenTokens(theme.tokens);
    for (const [tokenPath, value] of Object.entries(flatTokens)) {
      assert(typeof value === "string", `Token ${tokenPath} must be a string`, errors);
      assert(HEX_COLOR_PATTERN.test(String(value)), `Token ${tokenPath} must be a valid hex color`, errors);
    }
  }

  errors.push(...validateScale(theme));

  return errors;
}

function validateScale(theme) {
  const errors = [];

  if (!theme.scale || typeof theme.scale !== "object") {
    return errors; // scale block is optional
  }

  function walkScaleNode(node, nodePath) {
    if (node === null || node === undefined) {
      errors.push(`Scale node at '${nodePath}' is null or undefined`);
      return;
    }
    if (typeof node === "object" && !Array.isArray(node)) {
      for (const [key, value] of Object.entries(node)) {
        walkScaleNode(value, `${nodePath}.${key}`);
      }
      return;
    }
    if (typeof node === "number" || typeof node === "string") {
      return; // valid scale leaf value
    }
    errors.push(`Scale node at '${nodePath}' has unexpected type: ${typeof node}`);
  }

  for (const [group, value] of Object.entries(theme.scale)) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`scale.${group} must be an object`);
      continue;
    }
    walkScaleNode(value, `scale.${group}`);
  }

  return errors;
}

function validateSemantic(semantic, theme) {
  const errors = [];

  assert(semantic && typeof semantic === "object", "Semantic file must be an object", errors);
  if (!semantic || typeof semantic !== "object") {
    return errors;
  }

  const flatSemantic = flattenSemantic(semantic);
  const flatTokens = flattenTokens(theme.tokens || {});

  for (const [semanticPath, tokenPath] of Object.entries(flatSemantic)) {
    assert(typeof tokenPath === "string", `Semantic path ${semanticPath} must map to a token path string`, errors);
    if (typeof tokenPath === "string") {
      assert(Boolean(flatTokens[tokenPath]), `Semantic path ${semanticPath} points to missing token ${tokenPath}`, errors);
    }
  }

  return errors;
}

function validateComponents(components, theme) {
  const errors = [];

  assert(components && typeof components === "object", "Components file must be an object", errors);
  if (!components || typeof components !== "object") {
    return errors;
  }

  const flatTokens = flattenTokens(theme.tokens || {});
  const flatScale = flattenTokens(theme.scale || {});

  // A token ref is valid if it exists in either the color tokens or the scale tokens.
  // Key-in-object is used instead of Boolean(value) to avoid false-negatives on 0.
  function hasToken(ref) {
    return (ref in flatTokens) || (ref in flatScale);
  }

  function walkNode(node, nodePath) {
    if (node === null || node === undefined) {
      errors.push(`Component node at '${nodePath}' is null/undefined`);
      return;
    }
    if (typeof node === "object" && !Array.isArray(node)) {
      for (const [key, value] of Object.entries(node)) {
        walkNode(value, `${nodePath}.${key}`);
      }
      return;
    }
    if (typeof node === "number") {
      return; // raw pixel value — always allowed
    }
    if (typeof node === "string") {
      if (TOKEN_REF_PATTERN.test(node)) {
        assert(hasToken(node), `Component '${nodePath}' references missing token '${node}'`, errors);
      }
      return; // plain string (non-ref) is allowed
    }
    errors.push(`Component node at '${nodePath}' has unexpected type: ${typeof node}`);
  }

  for (const [key, value] of Object.entries(components)) {
    walkNode(value, key);
  }

  return errors;
}

function validateIcons(icons, theme) {
  const errors = [];

  assert(icons && typeof icons === "object", "Icons file must be an object", errors);
  if (!icons || typeof icons !== "object") {
    return errors;
  }

  // meta
  assert(icons.meta && typeof icons.meta === "object", "icons.meta required", errors);
  if (icons.meta) {
    assert(typeof icons.meta.themeId === "string" && icons.meta.themeId.length > 0,
      "icons.meta.themeId must be a non-empty string", errors);
    assert(typeof icons.meta.version === "string" && /^[0-9]+\.[0-9]+\.[0-9]+$/.test(icons.meta.version),
      "icons.meta.version must match x.y.z", errors);
  }

  // icon block
  assert(icons.icon && typeof icons.icon === "object", "icons.icon required", errors);
  if (!icons.icon || typeof icons.icon !== "object") {
    return errors;
  }

  const icon = icons.icon;

  // icon.size — all values must be positive numbers
  assert(icon.size && typeof icon.size === "object", "icons.icon.size required", errors);
  if (icon.size && typeof icon.size === "object") {
    for (const [sizeName, sizeValue] of Object.entries(icon.size)) {
      assert(typeof sizeValue === "number" && sizeValue > 0,
        `icons.icon.size.${sizeName} must be a positive number`, errors);
    }
  }

  // icon.color — values must be dot-notation paths that resolve in theme.tokens
  assert(icon.color && typeof icon.color === "object", "icons.icon.color required", errors);
  const flatTokens = flattenTokens(theme.tokens || {});
  const definedColorNames = new Set();
  if (icon.color && typeof icon.color === "object") {
    for (const [colorName, tokenPath] of Object.entries(icon.color)) {
      definedColorNames.add(colorName);
      assert(typeof tokenPath === "string" && TOKEN_REF_PATTERN.test(tokenPath),
        `icons.icon.color.${colorName} must be a dot-notation token path`, errors);
      if (typeof tokenPath === "string") {
        assert(tokenPath in flatTokens,
          `icons.icon.color.${colorName} references missing token '${tokenPath}'`, errors);
      }
    }
  }

  // icon.roles — values must be color names defined in icon.color
  assert(icon.roles && typeof icon.roles === "object", "icons.icon.roles required", errors);
  if (icon.roles && typeof icon.roles === "object") {
    for (const [rolePath, colorName] of Object.entries(icon.roles)) {
      assert(typeof colorName === "string" && colorName.length > 0,
        `icons.icon.roles.${rolePath} must be a non-empty string`, errors);
      if (typeof colorName === "string") {
        assert(definedColorNames.has(colorName),
          `icons.icon.roles.${rolePath} references undefined color name '${colorName}'`, errors);
      }
    }
  }

  return errors;
}

function validateThemePair(themePath, semanticPath, componentsPath, iconsPath) {
  const theme = readJson(themePath);
  const semantic = readJson(semanticPath);

  const errors = [
    ...validateTheme(theme),
    ...validateSemantic(semantic, theme)
  ];

  if (componentsPath) {
    const components = readJson(componentsPath);
    errors.push(...validateComponents(components, theme));
  }

  if (iconsPath) {
    const icons = readJson(iconsPath);
    errors.push(...validateIcons(icons, theme));
  }

  return {
    valid: errors.length === 0,
    errors,
    theme,
    semantic
  };
}

function main() {
  const themePath = process.argv[2];
  const semanticPath = process.argv[3];

  if (!themePath || !semanticPath) {
    console.error("Usage: node src/validate-theme.js <theme.json> <semantic.json> [components.json] [icons.json]");
    process.exit(2);
  }

  const absoluteThemePath = path.resolve(themePath);
  const absoluteSemanticPath = path.resolve(semanticPath);
  const absoluteComponentsPath = process.argv[4] ? path.resolve(process.argv[4]) : undefined;
  const absoluteIconsPath = process.argv[5] ? path.resolve(process.argv[5]) : undefined;

  const result = validateThemePair(absoluteThemePath, absoluteSemanticPath, absoluteComponentsPath, absoluteIconsPath);
  if (!result.valid) {
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Validation passed for ${absoluteThemePath} and ${absoluteSemanticPath}`);
}

if (require.main === module) {
  main();
}

module.exports = {
  validateTheme,
  validateSemantic,
  validateComponents,
  validateIcons,
  validateThemePair
};
