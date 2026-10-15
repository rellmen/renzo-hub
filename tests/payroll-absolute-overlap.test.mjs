import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveAmsterdamLocalMinute} from '../microapps/payroll/amsterdam-time.js';
test('Amsterdam ordinary 03:00 after autumn fold is UTC+01',()=>{assert.equal(resolveAmsterdamLocalMinute('2026-10-25','03:00'),Date.parse('2026-10-25T03:00+01:00'));});
