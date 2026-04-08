function exportJson(flatTokens, flatSemantic) {
  return JSON.stringify(
    {
      tokens: flatTokens,
      semantic: flatSemantic
    },
    null,
    2
  ) + "\n";
}

module.exports = {
  exportJson
};
