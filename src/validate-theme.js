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

function validateThemePair(themePath, semanticPath) {
  const theme = readJson(themePath);
  const semantic = readJson(semanticPath);

  const errors = [
    ...validateTheme(theme),
    ...validateSemantic(semantic, theme)
  ];

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
    console.error("Usage: node src/validate-theme.js <theme.json> <semantic.json>");
    process.exit(2);
  }

  const absoluteThemePath = path.resolve(themePath);
  const absoluteSemanticPath = path.resolve(semanticPath);

  const result = validateThemePair(absoluteThemePath, absoluteSemanticPath);
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
  validateThemePair
};
