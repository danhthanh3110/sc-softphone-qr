import QRCode from 'qrcode';
import {createPayload, normalizeExtension, normalizeSecret, parseExtensionList} from './contract.js';
import './style.css';

const $ = selector => document.querySelector(selector);
const rows = $('#rows');
let generation = 0;
function message(text = '') {$('#error').textContent = text; $('#error').hidden = !text;}
function invalidate() {
  generation++;
  $('#cards').replaceChildren(); $('#empty').hidden = false; $('#print').disabled = true;
  $('#status').textContent = ''; $('#generate').disabled = false; $('#generate').textContent = 'Tạo QR cho danh sách';
}
function count() {$('#count').textContent = `${rows.children.length} máy lẻ`;}
function addRow(extension = '', name = '') {
  if (rows.children.length >= 100) throw new Error('Mỗi phiên hỗ trợ tối đa 100 máy lẻ.');
  const row = document.createElement('div'); row.className = 'extension-row';
  const ext = document.createElement('input'); ext.value = extension; ext.placeholder = '8150'; ext.inputMode = 'numeric'; ext.maxLength = 16; ext.autocomplete = 'off'; ext.className = 'ext'; ext.setAttribute('aria-label', 'Máy lẻ');
  const label = document.createElement('input'); label.value = name; label.placeholder = 'Tên người dùng'; label.maxLength = 64; label.autocomplete = 'off'; label.className = 'name'; label.setAttribute('aria-label', 'Tên người dùng');
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = '×'; remove.setAttribute('aria-label','Xóa máy lẻ');
  remove.addEventListener('click', () => {invalidate(); row.remove(); if (!rows.children.length) addRow(); count(); message();});
  row.append(ext,label,remove); rows.append(row); count();
}
$('#add-row').addEventListener('click', () => {try {invalidate(); addRow(); rows.lastElementChild.querySelector('input').focus(); message();} catch(error) {message(error.message);}});
$('#import').addEventListener('click', () => {
  try {const list = parseExtensionList($('#bulk').value); invalidate(); rows.replaceChildren(); list.forEach(item => addRow(item.extension,item.name)); message();} catch(error) {message(error.message);}
});
$('#reveal').addEventListener('click', () => {const show = $('#secret').type === 'password'; $('#secret').type = show ? 'text' : 'password'; $('#reveal').textContent = show ? 'Ẩn' : 'Hiện'; $('#reveal').setAttribute('aria-pressed', String(show)); $('#reveal').setAttribute('aria-label', show ? 'Ẩn secret' : 'Hiện secret');});
$('#qr-form').addEventListener('input', event => {if (event.target.id !== 'bulk') invalidate(); message();});
$('#clear').addEventListener('click', () => {invalidate(); $('#secret').value = ''; $('#secret').type = 'password'; $('#reveal').textContent = 'Hiện'; $('#reveal').setAttribute('aria-label','Hiện secret'); $('#reveal').setAttribute('aria-pressed','false'); $('#bulk').value = ''; rows.replaceChildren(); addRow(); message(); $('#secret').focus();});
$('#print').addEventListener('click', () => window.print());
$('#qr-form').addEventListener('submit', async event => {
  event.preventDefault(); message(); invalidate(); const attempt = generation;
  try {
    const secret = normalizeSecret($('#secret').value);
    const seen = new Set();
    const list = [...rows.children].map(row => {
      const extension = normalizeExtension(row.querySelector('.ext').value);
      if (seen.has(extension)) throw new Error(`Máy lẻ ${extension} bị trùng trong danh sách.`);
      seen.add(extension); return {extension, name: row.querySelector('.name').value.trim()};
    });
    $('#generate').disabled = true; $('#generate').textContent = 'Đang tạo mã…';
    const cards = await Promise.all(list.map(async item => {
      const card = document.createElement('article'); card.className = 'qr-card';
      const canvas = document.createElement('canvas'); canvas.setAttribute('role','img'); canvas.setAttribute('aria-label',`QR đăng nhập máy lẻ ${item.extension}`);
      await QRCode.toCanvas(canvas, createPayload(item.extension,secret), {width: 360, margin: 4, errorCorrectionLevel: 'M'});
      const heading = document.createElement('h3'); heading.textContent = `Máy lẻ ${item.extension}`;
      const name = document.createElement('p'); name.textContent = item.name || 'SC Softphone · WorldfonePBX';
      const download = document.createElement('button'); download.type = 'button'; download.className = 'secondary'; download.textContent = 'Tải ảnh PNG';
      download.addEventListener('click', () => {const link = document.createElement('a'); link.download = `SC-Softphone-${item.extension}.png`; link.href = canvas.toDataURL('image/png'); link.click();});
      card.append(canvas,heading,name,download); return card;
    }));
    if (attempt !== generation) return;
    $('#cards').replaceChildren(...cards); $('#empty').hidden = true; $('#print').disabled = false; $('#status').textContent = `Đã tạo ${cards.length} mã QR. Chọn Tải ảnh PNG hoặc In mã để cấp cho người dùng.`;
  } catch(error) {if (attempt === generation) message(error.message || 'Không tạo được QR. Hãy kiểm tra thông tin.');}
  finally {if (attempt === generation) {$('#generate').disabled = false; $('#generate').textContent = 'Tạo QR cho danh sách';}}
});
// No storage, analytics, API calls, or credential URL parameters.
window.addEventListener('pagehide', () => {invalidate(); $('#secret').value = ''; $('#bulk').value = ''; rows.replaceChildren(); addRow();});
addRow();
