function defineName(tokenPath) {
  return `THEME_${tokenPath.replace(/\./g, "_").toUpperCase()}`;
}

function exportC(themeId, flatTokens) {
  const guard = `${themeId.replace(/[^A-Za-z0-9]/g, "_").toUpperCase()}_THEME_H`;
  const lines = [
    `#ifndef ${guard}`,
    `#define ${guard}`,
    ""
  ];

  for (const [tokenPath, value] of Object.entries(flatTokens)) {
    lines.push(`#define ${defineName(tokenPath)} \"${value}\"`);
  }

  lines.push("");
  lines.push(`#endif /* ${guard} */`);
  lines.push("");
  return lines.join("\n");
}

module.exports = {
  exportC
};
