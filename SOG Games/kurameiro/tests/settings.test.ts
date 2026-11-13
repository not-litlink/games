import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resetControls} from '../src/settings.ts';
test('初期設定に戻しても作問者の視界は変えない',()=>{
  assert.deepEqual(resetControls({range:3.5,speed:4,brightness:.6,reduced:false},true),{range:3.5,speed:2.5,brightness:1,reduced:true});
});
