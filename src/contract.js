export function normalizeSecret(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 256 || /[\x00-\x1f\x7f]/.test(value)) {
    throw new Error('Nhập secret hợp lệ, tối đa 256 ký tự.');
  }
  return value.trim();
}

export function normalizeExtension(value) {
  const extension = String(value ?? '').trim();
  if (!/^\d{1,16}$/.test(extension)) throw new Error('Máy lẻ phải gồm 1–16 chữ số.');
  return extension;
}

export function createPayload(extension, secret) {
  return JSON.stringify({kind: 'sc-softphone-login', version: 1, extension: normalizeExtension(extension), secret: normalizeSecret(secret)});
}

export function parseExtensionList(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) throw new Error('Nhập ít nhất một máy lẻ.');
  if (lines.length > 100) throw new Error('Mỗi phiên hỗ trợ tối đa 100 máy lẻ.');
  const seen = new Set();
  return lines.map((line, index) => {
    const comma = line.indexOf(',');
    const extension = normalizeExtension(comma < 0 ? line : line.slice(0, comma));
    const name = comma < 0 ? '' : line.slice(comma + 1).trim();
    if (seen.has(extension)) throw new Error(`Máy lẻ ${extension} bị trùng ở dòng ${index + 1}.`);
    if (name.length > 64) throw new Error(`Tên ở dòng ${index + 1} quá dài (tối đa 64 ký tự).`);
    seen.add(extension);
    return {extension, name};
  });
}
