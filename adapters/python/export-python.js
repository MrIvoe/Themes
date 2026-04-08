function escapePy(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function exportPython(flatTokens) {
  const lines = ["THEME = {"];
  const entries = Object.entries(flatTokens);

  entries.forEach(([tokenPath, value], index) => {
    const trailing = index < entries.length - 1 ? "," : "";
    lines.push(`    \"${escapePy(tokenPath)}\": \"${escapePy(value)}\"${trailing}`);
  });

  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

module.exports = {
  exportPython
};
