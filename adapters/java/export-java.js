function javaClassName(themeId) {
  const parts = themeId.split("-");
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("") + "Theme";
}

function javaField(tokenPath) {
  return tokenPath.replace(/\./g, "_").toUpperCase();
}

function exportJava(themeId, flatTokens) {
  const className = javaClassName(themeId);
  const lines = [
    `public final class ${className} {`,
    ""
  ];

  for (const [tokenPath, value] of Object.entries(flatTokens)) {
    lines.push(`    public static final String ${javaField(tokenPath)} = "${value}";`);
  }

  lines.push("}\n");
  return lines.join("\n");
}

module.exports = {
  exportJava
};
