const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript'), jsx = require('react/jsx-runtime');
function harness(file, driver = false) {
  let cursor = 0, current = { stage: driver ? 'pickup_assigned' : 'pickup_pending', version: 0, label: 'Pickup', history: [] };
  const hooks = [], requests = [];
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useState(initial) { const i = cursor++; if (!(i in hooks)) hooks[i] = initial; return [hooks[i], value => { hooks[i] = typeof value === 'function' ? value(hooks[i]) : value; }]; },
    useRef(initial) { const i = cursor++; return hooks[i] ||= { current: initial }; },
    useCallback(fn, deps) { const i = cursor++; if (!same(hooks[i]?.deps, deps)) hooks[i] = { fn, deps }; return hooks[i].fn; },
    useEffect(fn, deps) { const i = cursor++; if (!same(hooks[i]?.deps, deps)) { hooks[i]?.cleanup?.(); hooks[i] = { deps, cleanup: fn() }; } },
  };
  const api = {
    async get(url) { return { data: { success: true, data: url.includes('/drivers') ? [{ _id: 'driver1', isActive: true, name: 'Driver' }] : url.endsWith('/assigned') ? current.stage === 'completed' ? [] : [{ _id: 'order1', orderNumber: 'ORD1', fulfillment: current, items: [] }] : current } }; },
    async post(url, body) { requests.push({ url, body }); const stages = { assign_pickup: 'pickup_assigned', collect: 'collected', receive: 'received', inspect: 'inspected', pack_replacement: 'replacement_ready', assign_delivery: 'out_for_delivery', deliver: 'completed' }; current = { ...current, stage: stages[body.action], version: current.version + 1 }; return { data: { success: true, data: current } }; },
  };
  const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const sandbox = { exports: {}, document: { hidden: false }, setInterval() { return 1; }, clearInterval() {}, require(name) { if (name === 'react') return react; if (name === 'react/jsx-runtime') return jsx; if (name === '@/lib/api') return { __esModule: true, default: api }; throw Error(name); } };
  vm.runInNewContext(compiled, sandbox);
  const render = () => { cursor = 0; return sandbox.exports.default({ orderId: 'order1' }); };
  const text = node => node == null || typeof node === 'boolean' ? '' : typeof node !== 'object' ? String(node) : Array.isArray(node) ? node.map(text).join(' ') : text(node.props?.children);
  const all = (node, type) => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(child => all(child, type)) : [...(node.type === type ? [node] : []), ...all(node.props?.children, type)];
  return { requests, render, stage(value) { current = { ...current, stage: value, version: current.version + 1 }; }, text: () => text(render()), async load() { render(); await new Promise(setImmediate); render(); }, change(type, value) { const node = all(render(), type)[0]; assert.ok(node, type); node.props.onChange({ target: { value } }); }, async click(label) { const button = all(render(), 'button').find(node => text(node).includes(label)); assert.ok(button, label); assert.ok(!button.props.disabled, label + ' enabled'); await button.props.onClick(); await new Promise(setImmediate); render(); } };
}
test('admin screen progresses pickup assignment, receipt, inspection, packing and delivery assignment', async () => {
  const h = harness('../app/admin/(protected)/returns/ReturnFulfillmentPanel.tsx'); await h.load();
  h.change('select', 'driver1'); await h.click('Assign / reassign pickup');
  assert.equal(h.requests[0].body.action, 'assign_pickup'); assert.ok(h.text().includes('customer’s tracking screen'));
  // Collection is deliberately unavailable in admin UI; the staff portal must verify it.
  const driverHarness = harness('../app/driver/deliveries/DriverReturnTasks.tsx', true); await driverHarness.load(); driverHarness.change('input', '123456'); await driverHarness.click('Verify pickup');
  assert.equal(driverHarness.requests[0].body.action, 'collect'); assert.equal(driverHarness.requests[0].body.code, '123456');
  h.stage('collected'); await h.click('Refresh'); await h.click('Confirm goods received');
  h.change('textarea', 'Damaged jar received — discard'); await h.click('Complete inspection');
  await h.click('Reserve stock & pack replacement'); h.change('select', 'driver1'); await h.click('Assign / reassign replacement delivery');
  assert.equal(h.requests[1].body.action, 'receive'); assert.equal(h.requests[2].body.action, 'inspect'); assert.equal(h.requests[2].body.restock, false);
  assert.equal(h.requests[3].body.action, 'pack_replacement'); assert.equal(h.requests[4].body.action, 'assign_delivery');
  assert.ok(h.text().includes('No cash to collect'));
  driverHarness.stage('out_for_delivery'); await driverHarness.click('Refresh tasks'); driverHarness.change('input', '654321'); await driverHarness.click('Verify replacement delivered');
  assert.equal(driverHarness.requests[1].body.action, 'deliver');
});
