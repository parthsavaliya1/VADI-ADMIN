const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript'), jsx = require('react/jsx-runtime');
function harness(status = 'approved', fail = false) {
  let cursor = 0, effectRan = false; const hooks = [];
  const react = { useState(initial) { const i = cursor++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], value => { hooks[i] = typeof value === 'function' ? value(hooks[i]) : value; }]; }, useCallback: fn => fn, useEffect(fn) { if (!effectRan) { effectRan = true; fn(); } } };
  const stage = { exports: {} }; vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/returnStage.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, stage);
  const source = fs.readFileSync(path.join(__dirname, '../app/admin/(protected)/returns/[id]/ReturnManagementClient.tsx'), 'utf8');
  const sandbox = { exports: {}, require(name) {
    if (name === 'react') return react; if (name === 'react/jsx-runtime') return jsx;
    if (name === 'next/link') return { __esModule: true, default: 'a' };
    if (name === 'lucide-react') return { ArrowLeft: 'Icon', Loader2: 'Loader' };
    if (name === '@/lib/returnStage') return stage.exports;
    if (name === '../ReturnFulfillmentPanel') return { __esModule: true, default: 'Controls' };
    if (name === '@/lib/api') return { __esModule: true, default: { async get() { if (fail) throw Error(); return { data: { success: true, data: { order: { _id: '123', orderNumber: 'ORD85901542792', returnRequest: { status, items: [{ action: 'replace' }], fulfillment: { stage: 'received' } } } } } }; } } };
    throw Error(name);
  } };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, sandbox);
  const render = () => { cursor = 0; return sandbox.exports.default({ orderId: '123' }); };
  const text = node => node == null || typeof node === 'boolean' ? '' : typeof node !== 'object' ? String(node) : Array.isArray(node) ? node.map(text).join(' ') : text(node.props?.children);
  const all = (node, type) => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(child => all(child, type)) : [...(node.type === type ? [node] : []), ...all(node.props?.children, type)];
  return { render, text, all, async load() { render(); await new Promise(setImmediate); return render(); } };
}
test('dedicated management page opens actual controls for the approved replacement order', async () => {
  const h = harness(), tree = await h.load();
  assert.ok(h.text(tree).includes('ORD85901542792')); assert.ok(h.text(tree).includes('Received at VADI'));
  const controls = h.all(tree, 'Controls')[0]; assert.ok(controls); assert.equal(controls.props.orderId, '123');
  controls.props.onStageChange('replacement_ready'); assert.ok(h.text(h.render()).includes('Replacement packed'));
});
test('unapproved request opens review rather than replacement actions', async () => {
  const h = harness('pending'), tree = await h.load(); assert.equal(h.all(tree, 'Controls').length, 0);
  assert.ok(h.all(tree, 'a').some(link => link.props.href === '/admin/returns?orderId=123'));
});
test('load failure displays Retry instead of an empty management page', async () => {
  const h = harness('approved', true), tree = await h.load(); assert.ok(h.text(tree).includes('Could not load this return')); assert.ok(h.text(tree).includes('Retry'));
});
