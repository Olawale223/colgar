export function isSafeBlogHref(value: string) {
  return (value.startsWith("/") && !value.startsWith("//"))
    || value.startsWith("#")
    || /^https?:\/\//i.test(value);
}

export function isAllowedImageUrl(value: string) {
  return (value.startsWith("/") && !value.startsWith("//"))
    || /^https:\/\/(images\.unsplash\.com|www\.colgar\.org)(\/|$)/i.test(value);
}
