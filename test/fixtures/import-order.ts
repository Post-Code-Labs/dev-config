// Smoke-test fixture for eslint-plugin-import-x on ESLint 10: the two builtin imports are in
// the wrong alphabetical order, so import/order must REPORT a violation. With the old
// eslint-plugin-import this throws on ESLint 10 (removed `getTokenOrCommentBefore`); import-x
// reports it instead.
import { z as _z } from 'node:zlib';
import { readFileSync as _r } from 'node:fs';

export const _x = [_z, _r];
