function exportJson(payload) {
  return JSON.stringify(
    payload,
    null,
    2
  ) + "\n";
}

module.exports = {
  exportJson
};
