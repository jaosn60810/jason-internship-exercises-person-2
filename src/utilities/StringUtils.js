export function removePeriods(text) {
  return text.replace(/\./g, "");
}

export function splitByWhitespace(text) {
  return text.split(/\s+/);
}
