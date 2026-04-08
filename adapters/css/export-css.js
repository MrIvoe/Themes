function toCssVarName(tokenPath) {
  return `--${tokenPath.replace(/\./g, "-")}`;
}

function exportCss(flatTokens) {
  const lines = [":root {"];
  for (const [tokenPath, value] of Object.entries(flatTokens)) {
    lines.push(`  ${toCssVarName(tokenPath)}: ${value};`);
  }
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

module.exports = {
  exportCss
};
