// Outside helpers/: entry.css scans helpers/ for Tailwind classes, and these fixtures must stay unstyled.
import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { JSDOM } from 'jsdom';
import { reportUnstyledClasses, styledClasses, unstyledMessage } from './helpers/unstyledClasses';

const silence = () => {
  /* keep test output clean */
};
const page = (css: string, body: string) =>
  new JSDOM(`<!doctype html><style>${css}</style><body><div id="root">${body}</div></body>`).window
    .document;

afterEach(() => {
  rs.restoreAllMocks();
});

describe('unstyled class warning', () => {
  it('reads escaped class names from nested and grouped rules', () => {
    const classes = styledClasses(
      page(
        '@layer utilities { .p-16 { padding: 16px } @media (min-width: 1px) { .md\\:grid-cols-3 { color: red } } } .w-1\\/3, .\\32 xl\\:p-4 { width: 1px }',
        '',
      ),
    );
    expect([...(classes ?? [])].sort()).toEqual(['2xl:p-4', 'md:grid-cols-3', 'p-16', 'w-1/3']);
  });

  it('warns once per unknown class, skips marker classes and suggests the 1px reading', () => {
    const warn = rs.spyOn(console, 'warn').mockImplementation(silence);
    const document = page(
      '.p-20 { padding: 20px } .flex { display: flex }',
      '<div class="flex p-5 group"><span class="p-5 peer/item mystery"></span></div>',
    );
    const root = document.getElementById('root')!;
    reportUnstyledClasses(root);
    reportUnstyledClasses(root);
    expect(warn.mock.calls.map(([message]) => message)).toEqual([
      unstyledMessage('p-5', new Set(['p-20'])),
      unstyledMessage('mystery', new Set()),
    ]);
    expect(warn.mock.calls[0]?.[0]).toContain("Tailwind's p-5 is p-20");
  });

  it('stays silent without readable styles and never throws', () => {
    const warn = rs.spyOn(console, 'warn').mockImplementation(silence);
    reportUnstyledClasses(page('', '<div class="p-5"></div>').getElementById('root')!);
    expect(() => reportUnstyledClasses({} as Element)).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
  });
});
