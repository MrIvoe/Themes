function qtColor(tokenPath) {
  return tokenPath.replace(/\./g, "_").toUpperCase();
}

function exportQt(themeId, flatTokens) {
  const lines = [
    "/* Qt stylesheet color definitions */",
    "",
    ".theme {",
  ];

  for (const [tokenPath, value] of Object.entries(flatTokens)) {
    lines.push(`  qproperty-${tokenPath.replace(/\./g, "_")}: ${value};`);
  }

  lines.push("}\n");
  return lines.join("\n");
}

module.exports = {
  exportQt
};
