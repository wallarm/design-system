import { describe, expect, it } from '@rstest/core';
import { luaSyntaxDiagnostics } from './luaSyntax';

const VALID_SAMPLES: readonly string[] = [
  'local cjson = require("cjson")\n\nlocal function check(ctx)\n  local ip = ngx.var.remote_addr\n  for k, v in pairs(ctx) do\n    if not v then goto continue end\n    ngx.log(ngx.INFO, k, ip)\n    ::continue::\n  end\nend\n\nreturn { check = check }\n',
  'for i = 1, 3 do\n  if i == 2 then goto skip end\n  print(i)\n  ::skip::\nend',
  'local a = 7 // 2',
  'local b = 5 & 3 | 1 ~ 2 << 1 >> 1',
  'local s = [[long\nstring]] .. [==[other]==]',
  'local function f(...) return select("#", ...) end',
  'local t = setmetatable({}, { __index = function(_, k) return k end })',
  '',
];

describe('luaSyntaxDiagnostics', () => {
  it.each(VALID_SAMPLES)('reports nothing for valid Lua %#', async text => {
    expect(await luaSyntaxDiagnostics(text)).toEqual([]);
  });

  it('reports an unexpected token at its offset without the line:column prefix', async () => {
    expect(await luaSyntaxDiagnostics('local x = = 1')).toEqual([
      {
        from: 10,
        to: 11,
        severity: 'error',
        source: 'syntax',
        message: "<expression> expected near '='",
      },
    ]);
  });

  it('reports an unclosed function parameter list', async () => {
    const out = await luaSyntaxDiagnostics('function f(');
    expect(out).toHaveLength(1);
    expect(out[0]?.severity).toBe('error');
    expect(out[0]?.message).not.toMatch(/^\[\d+:\d+\]/);
    expect(out[0]?.from).toBeLessThanOrEqual('function f('.length);
    expect(out[0]?.to).toBeLessThanOrEqual('function f('.length);
  });

  it('reports a missing end', async () => {
    const text = 'if x then';
    const out = await luaSyntaxDiagnostics(text);
    expect(out).toHaveLength(1);
    expect(out[0]?.message).toContain("'end' expected");
    expect(out[0]?.to).toBeLessThanOrEqual(text.length);
  });
});
