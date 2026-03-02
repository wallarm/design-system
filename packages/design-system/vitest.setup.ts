import '@testing-library/jest-dom/vitest';

// Mock scrollIntoView which is not implemented in jsdom
Element.prototype.scrollIntoView = () => {};
