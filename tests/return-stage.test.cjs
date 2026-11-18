const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const moduleValue = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/returnStage.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, moduleValue);
const { returnStageLabel } = moduleValue.exports;
test('normal deliveries retain their status while returns show the actual fulfillment stage', () => {
  assert.equal(returnStageLabel(), null);
  for (const [stage, label] of Object.entries({ pickup_pending: 'Return accepted', pickup_assigned: 'Pickup scheduled', collected: 'Items collected', received: 'Received at VADI', inspected: 'Inspection complete', replacement_ready: 'Replacement packed', out_for_delivery: 'Replacement out for delivery', completed: 'Replacement delivered' })) {
    assert.equal(returnStageLabel({ status: 'approved', items: [{ action: 'replace' }], fulfillment: { stage } }), label);
  }
});
test('pending, legacy approvals and refund-only completion are labelled correctly', () => {
  assert.equal(returnStageLabel({ status: 'pending' }), 'Return requested');
  assert.equal(returnStageLabel({ status: 'approved' }), 'Return accepted');
  assert.equal(returnStageLabel({ status: 'approved', fulfillment: { stage: 'completed' } }), 'Return completed');
});
