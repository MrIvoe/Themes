function exportTkinter(flatTokens) {
  const lines = [
    "THEME = {",
  ];

  for (const [tokenPath, value] of Object.entries(flatTokens)) {
    lines.push(`    "${tokenPath}": "${value}",`);
  }

  if (lines.length > 1) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, "");
  }
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

module.exports = {
  exportTkinter
};
