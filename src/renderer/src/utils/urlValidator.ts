export const isValidHttpUrl = (urlToValidate: string): boolean => {
  let url
  try {
    url = new URL(urlToValidate)
  } catch (_) {
    console.error(_)
    return false
  }

  return url.protocol === 'https:'
}
