import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import bash from 'shiki/langs/bash.mjs';
import c from 'shiki/langs/c.mjs';
import cpp from 'shiki/langs/cpp.mjs';
import css from 'shiki/langs/css.mjs';
import go from 'shiki/langs/go.mjs';
import html from 'shiki/langs/html.mjs';
import http from 'shiki/langs/http.mjs';
import java from 'shiki/langs/java.mjs';
import javascript from 'shiki/langs/javascript.mjs';
import json from 'shiki/langs/json.mjs';
import jsx from 'shiki/langs/jsx.mjs';
import lua from 'shiki/langs/lua.mjs';
import markdown from 'shiki/langs/markdown.mjs';
import python from 'shiki/langs/python.mjs';
import rust from 'shiki/langs/rust.mjs';
import sql from 'shiki/langs/sql.mjs';
import tsx from 'shiki/langs/tsx.mjs';
import typescript from 'shiki/langs/typescript.mjs';
import xml from 'shiki/langs/xml.mjs';
import yaml from 'shiki/langs/yaml.mjs';
import githubLight from 'shiki/themes/github-light.mjs';

// This entire module is loaded only on the first highlight call. Do not import
// the root `shiki` bundle: it emits every bundled grammar and theme as chunks.
export const createShikiHighlighter = () =>
  createHighlighterCore({
    themes: [githubLight],
    // Grammar exports include their embedded dependencies. Bash also registers
    // the public `shell` alias. Adapter tests cover every advertised language.
    langs: [
      javascript,
      typescript,
      jsx,
      tsx,
      bash,
      json,
      html,
      xml,
      css,
      python,
      go,
      sql,
      yaml,
      markdown,
      lua,
      rust,
      java,
      c,
      cpp,
      http,
    ],
    engine: createOnigurumaEngine(import('shiki/wasm')),
  });
