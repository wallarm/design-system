// biome-ignore lint/suspicious/noConsole: rejected agent output must stay visible in production too
export const warn = console.warn.bind(console, '[gen-ui]');
