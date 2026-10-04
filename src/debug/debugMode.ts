// Debug mode shows tools for the developer, such as the frame rate counter
// used to measure NFR-PRF-003 on the phone. It is turned on by adding
// `?debug` to the address (http://192.168.0.6:5173/?debug), so it also works
// on the production build, where the measurement is most faithful.
//
// It receives the query string of the address (window.location.search), so
// it can be tested without a browser.
export function isDebugMode(search: string): boolean {
  return new URLSearchParams(search).has('debug');
}
