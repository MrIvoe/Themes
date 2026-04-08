function scssVar(tokenPath) {
  return `$${tokenPath.replace(/\./g, "-")}`;
}

function exportScss(flatTokens) {
  const lines = [];
  for (const [tokenPath, value] of Object.entries(flatTokens)) {
    lines.push(`${scssVar(tokenPath)}: ${value};`);
  }
  lines.push("");
  return lines.join("\n");
}

module.exports = {
  exportScss
};
