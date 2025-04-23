declare module 'jest-webextension-mock' {
  // Use the global Chrome namespace instead of trying to import it as a module
  const chrome: typeof globalThis.chrome;
  export default chrome;
}