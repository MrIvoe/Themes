function tailwindKey(tokenPath) {
  return tokenPath.replace(/\./g, "-");
}

function exportTailwind(flatTokens) {
  const lines = [
    "module.exports = {",
    "  theme: {",
    "    extend: {",
    "      colors: {"
  ];

  for (const [tokenPath, value] of Object.entries(flatTokens)) {
    lines.push(`        '${tailwindKey(tokenPath)}': '${value}',`);
  }

  lines.push("      }");
  lines.push("    }");
  lines.push("  }");
  lines.push("};\n");
  return lines.join("\n");
}

module.exports = {
  exportTailwind
};
