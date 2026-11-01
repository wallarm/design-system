// Ensure HTMLElement.prototype.focus is writable for @react-aria/interactions compatibility.
// react-aria patches HTMLElement.prototype.focus to track focus modality, but in some
// environments the property is non-writable, causing a runtime TypeError.
if (typeof HTMLElement !== 'undefined') {
  try {
    const desc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus');
    if (desc) {
      Object.defineProperty(HTMLElement.prototype, 'focus', {
        ...desc,
        writable: true,
        configurable: true,
      });
    }
  } catch {
    // Unable to make focus writable — environment may be restricted
  }
}
