function flattenTokens(tokens, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(tokens || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenTokens(value, path, out);
      continue;
    }
    out[path] = value;
  }
  return out;
}

function flattenSemantic(semantic, prefix = "", out = {}) {
  for (const [key, value] of Object.entries(semantic || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenSemantic(value, path, out);
      continue;
    }
    out[path] = value;
  }
  return out;
}

function resolveTokenPath(tokenPath, flatTokens) {
  return flatTokens[tokenPath];
}

function resolveSemanticPath(semanticPath, flatSemantic, flatTokens) {
  const tokenPath = flatSemantic[semanticPath];
  if (!tokenPath) {
    return undefined;
  }
  return {
    semanticPath,
    tokenPath,
    value: resolveTokenPath(tokenPath, flatTokens)
  };
}

module.exports = {
  flattenTokens,
  flattenSemantic,
  resolveTokenPath,
  resolveSemanticPath
};
