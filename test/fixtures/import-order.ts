// Fixture: builtin imports in wrong alphabetical order, so import/order must report a violation.
import { z as _z } from 'node:zlib';
import { readFileSync as _r } from 'node:fs';

export const _x = [_z, _r];
