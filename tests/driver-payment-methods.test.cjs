const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ts = require('typescript');
const jsx = require('react/jsx-runtime');

function harness(initial = {}) {
  let summary = { orderId: 'order-123', amount: 209, orderNumber: 'ORD-123', method: 'cod', status: 'pending',
    onlinePending: false, cashReserved: false, message: 'Unpaid COD', ...initial };
  let cursor = 0, confirmResult = true, failure = false;
  const hooks = [], timers = [], requests = [], callbacks = [];
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial;
      return [hooks[index], value => { hooks[index] = typeof value === 'function' ? value(hooks[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return hooks[index] ||= { current: initial }; },
    useCallback(fn, deps) {
      const index = cursor++;
      if (!same(hooks[index]?.deps, deps)) hooks[index] = { fn, deps };
      return hooks[index].fn;
    },
    useEffect(fn, deps) {
      const index = cursor++;
      if (!same(hooks[index]?.deps, deps)) { hooks[index]?.cleanup?.(); hooks[index] = { deps, cleanup: fn() }; }
    },
  };
  const api = { async post(endpoint, body) {
    requests.push({ endpoint, action: body.action });
    if (failure) throw { response: { data: { message: 'Cash was not released' } } };
    if (body.action === 'prepare') summary = { ...summary, cashReserved: true, message: 'Cash reserved' };
    if (body.action === 'release') summary = { ...summary, cashReserved: false, message: 'Cash released' };
    return { data: { success: true, data: { ...summary } } };
  } };
  const source = fs.readFileSync(path.join(__dirname, '../app/driver/deliveries/DriverPaymentCheck.tsx'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const sandbox = { exports: {}, console, confirm: () => confirmResult,
    setTimeout(fn) { timers.push(fn); return fn; }, clearTimeout(fn) { const index = timers.indexOf(fn); if (index >= 0) timers.splice(index, 1); },
    require(name) { if (name === 'react') return react; if (name === 'react/jsx-runtime') return jsx; if (name === '@/lib/api') return { __esModule: true, default: api }; throw Error(name); } };
  vm.runInNewContext(compiled, sandbox);
  const onPaymentChecked = value => callbacks.push(value);
  const render = () => { cursor = 0; return sandbox.exports.default({ orderRef: 'ORD-123', onPaymentChecked }); };
  const text = node => node == null || typeof node === 'boolean' ? '' : typeof node === 'string' || typeof node === 'number' ? String(node)
    : Array.isArray(node) ? node.map(text).join(' ') : text(node.props?.children);
  function all(node, predicate) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(value => all(value, predicate));
    return [...(predicate(node) ? [node] : []), ...all(node.props?.children, predicate)];
  }
  const button = label => all(render(), node => node.type === 'button').find(node => text(node).includes(label));
  return { requests, callbacks, text: () => text(render()), button,
    async load() { render(); for (const timer of timers.splice(0)) timer(); await new Promise(setImmediate); render(); },
    async click(label) { const node = button(label); assert.ok(node, 'Button exists: ' + label); node.props.onClick(); await new Promise(setImmediate); render(); },
    confirm: value => { confirmResult = value; }, fail: value => { failure = value; },
    summary: value => { summary = { ...summary, ...value }; },
  };
}

test('loads payment automatically and shows Cash and Online method choices', async () => {
  const h = harness(); await h.load();
  assert.equal(h.requests[0].action, 'check');
  assert.ok(h.button('Cash on delivery')); assert.ok(h.button('Online payment'));
  assert.equal(h.callbacks.length, 1);
});
test('choosing Cash reserves collection on the backend', async () => {
  const h = harness(); await h.load(); await h.click('Cash on delivery');
  assert.equal(h.requests.at(-1).action, 'prepare');
  assert.equal(h.button('Cash on delivery').props['aria-pressed'], true);
});
test('switching reserved cash to Online requires confirmation and releases cash first', async () => {
  const h = harness({ cashReserved: true }); await h.load();
  h.confirm(false); await h.click('Online payment'); assert.equal(h.requests.length, 1);
  h.confirm(true); await h.click('Online payment');
  assert.equal(h.requests.at(-1).action, 'release');
  assert.equal(h.button('Online payment').props['aria-pressed'], true);
  assert.ok(h.text().includes('Tap Pay online')); assert.ok(h.text().includes('customer’s phone'));
});
test('failed release preserves cash selection and displays the server error', async () => {
  const h = harness({ cashReserved: true }); await h.load(); h.fail(true); await h.click('Online payment');
  assert.equal(h.button('Cash on delivery').props['aria-pressed'], true);
  assert.ok(h.text().includes('Cash was not released'));
  assert.ok(!h.text().includes('Tap Pay online'));
});
test('choosing Online without a cash reservation never marks the order paid', async () => {
  const h = harness(); await h.load(); await h.click('Online payment');
  assert.equal(h.requests.length, 1);
  assert.ok(h.text().includes('does not mark the order paid'));
});
test('pending online payment disables the cash option', async () => {
  const h = harness({ onlinePending: true }); await h.load();
  assert.equal(h.button('Cash on delivery').props.disabled, true);
  assert.equal(h.button('Online payment').props['aria-pressed'], true);
});
test('refreshing confirmed online payment hides collection options and updates the parent', async () => {
  const h = harness(); await h.load(); await h.click('Online payment');
  h.summary({ method: 'upi', status: 'paid', message: 'Paid online — do not collect cash.' });
  await h.click('Check online payment received');
  assert.equal(h.button('Cash on delivery'), undefined); assert.equal(h.button('Online payment'), undefined);
  assert.ok(h.text().includes('Paid online')); assert.equal(h.callbacks.at(-1).status, 'paid');
});
