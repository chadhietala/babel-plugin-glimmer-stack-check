const QUnit = require('qunitjs');
const babel = require('babel-core');
const StackCheck = require('./index');

function stripTight(strings) {
  return strings[0].split('\n').map(s => s.trim()).join('');
}

let transform;
QUnit.module('Strip stackCheck', {
  beforeEach() {
    transform = function(code, precompile) {
      return babel.transform(code, {
        plugins: [[StackCheck, {
          stackCheck: 'stackCheck',
          bindings: ['isNumber', 'isVMHandle'],
          source: '@glimmer/util'
        }]]
      }).code;
    }
  }
});

QUnit.test('strips `stackCheck`', (assert) => {
  let transformed = transform(stripTight`
    import { stackCheck } from '@glimmer/util';
    let value = 123;
    if (stackCheck(value, isNumber)) {
      console.log(value);
    };
  `);

  assert.equal(transformed, stripTight`
    let value = 123;
    console.log(value);;
  `)
});

QUnit.test('strips `stackCheck` and bindings', (assert) => {
  let transformed = transform(stripTight`
    import { stackCheck, isNumber } from '@glimmer/util';
    let value = 123;
    if (stackCheck(value, isNumber)) {
      console.log(value);
    };
  `);

  assert.equal(transformed, stripTight`
    let value = 123;
    console.log(value);;
  `)
});

QUnit.test('strips `stackCheck` and bindings', (assert) => {
  let transformed = transform(stripTight`
    import { stackCheck, isNumber, assert } from '@glimmer/util';
    let value = 123;
    if (stackCheck(value, isNumber)) {
      assert(value);
    };
  `);

  assert.equal(transformed, stripTight`
    import { assert } from '@glimmer/util';
    let value = 123;
    assert(value);;
  `)
});
