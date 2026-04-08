function symbolName(tokenPath) {
  return tokenPath.replace(/\./g, "_");
}

function exportCpp(flatTokens) {
  const lines = [
    "#pragma once",
    "",
    "namespace theme {"
  ];

  for (const [tokenPath, value] of Object.entries(flatTokens)) {
    lines.push(`inline constexpr const char* ${symbolName(tokenPath)} = \"${value}\";`);
  }

  lines.push("} // namespace theme");
  lines.push("");
  return lines.join("\n");
}

module.exports = {
  exportCpp
};
