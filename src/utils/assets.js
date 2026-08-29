export function getAssetUrl(filename) {
  if (typeof window !== 'undefined' && window.db && window.db.getAppPath) {
    return `file:///${window.__appPath}/${filename}`.replace(/\\/g, '/')
  }
  return `/${filename}`
}
