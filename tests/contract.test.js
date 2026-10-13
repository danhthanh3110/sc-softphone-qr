import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPayload, parseExtensionList} from '../src/contract.js';
import QRCode from 'qrcode';
import {PNG} from 'pngjs';
import jsQR from 'jsqr';
test('emits mobile v1 contract and preserves leading zeros', () => {
  assert.deepEqual(JSON.parse(createPayload('08150',' qr-test-secret ')),{kind:'sc-softphone-login',version:1,extension:'08150',secret:'qr-test-secret'});
});
test('imports multiple rows with optional names', () => {
  assert.deepEqual(parseExtensionList('8150,Anh A\n\n8151\r\n08152,Anh B'),[{extension:'8150',name:'Anh A'},{extension:'8151',name:''},{extension:'08152',name:'Anh B'}]);
});
test('rejects duplicate or malformed extensions atomically', () => {
  for (const text of ['8150\n8150','8150\nabc','8150\n12345678901234567','',Array.from({length:101},(_,i)=>String(i)).join('\n')]) assert.throws(()=>parseExtensionList(text));
});
test('rejects invalid secrets and extensions', () => {
  for (const secret of ['', ' ', 'x'.repeat(257), 'a\nb']) assert.throws(()=>createPayload('8150',secret));
  for (const extension of ['', 'abc', '8150?foo', '12345678901234567']) assert.throws(()=>createPayload(extension,'qr-test-secret'));
});
test('generated PNG decodes back to the exact mobile login contract', async () => {
  for (const extension of ['8150','08152']) {
    const payload = createPayload(extension,'QR_DEMO_NOT_A_REAL_SECRET');
    const image = PNG.sync.read(await QRCode.toBuffer(payload,{width:360,margin:4,errorCorrectionLevel:'M'}));
    const decoded = jsQR(new Uint8ClampedArray(image.data),image.width,image.height);
    assert.equal(decoded?.data,payload);
  }
});
