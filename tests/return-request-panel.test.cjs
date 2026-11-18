const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../app/admin/(protected)/orders/[id]/ReturnRequestPanel.tsx'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const stageModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/returnStage.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, stageModule);
const sandbox = { exports: {}, require(name) { if (name === 'react/jsx-runtime') return require(name); if (name === '@/lib/returnStage') return stageModule.exports; if (name === 'next/link') return { __esModule: true, default: 'a' }; throw Error(name); } };
vm.runInNewContext(compiled, sandbox);
const render = sandbox.exports.default;
const text = node => node == null ? '' : typeof node !== 'object' ? String(node) : Array.isArray(node) ? node.map(text).join(' ') : text(node.props?.children);
function links(node) { if (!node || typeof node !== 'object') return []; if (Array.isArray(node)) return node.flatMap(links); return [...(node.type === 'a' ? [node] : []), ...links(node.props?.children)]; }
test('orders without returns do not show a return panel', () => { assert.equal(render({ orderId: '123' }), null); });
test('pending return displays reason, quantities, refund destination and scoped review action', () => {
  const panel = render({ orderId: '123', request: { status: 'pending', reason: 'Damaged jar', items: [{ productName: 'Ghee', quantity: 1, action: 'refund' }] }, preview: { amount: 315, destination: 'original' } });
  for (const value of ['Return requested', 'Damaged jar', 'Ghee', '315.00', 'original payment method', 'Review return / approve refund']) assert.ok(text(panel).includes(value));
  assert.equal(links(panel)[0].props.href, '/admin/returns?orderId=123');
});
test('approved return displays recorded refund and gateway reference', () => {
  const panel = render({ orderId: '123', request: { status: 'approved', refundAmount: 315, refundedTo: 'original', refundOperation: { gatewayRefundId: 'rfnd_123' } } });
  assert.ok(text(panel).includes('Refund recorded')); assert.ok(text(panel).includes('rfnd_123')); assert.ok(text(panel).includes('View return details')); assert.equal(links(panel)[0].props.href, '/admin/returns/123');
});

test('replacement-only paid COD request explains its zero monetary refund', () => {
  const panel = render({ orderId: '123', request: { status: 'pending', items: [{ productName: 'Ghee', quantity: 1, action: 'replace' }] }, preview: { amount: 0, destination: 'none' } });
  assert.ok(text(panel).includes('Replacement requested; no money refund'));
  assert.ok(!text(panel).includes('Payment not recorded as collected'));
});
