export const debug = {
  query:
    process.env.NODE_ENV === "development" && process.env.REACT_APP_DEBUG_QUERY,
  translation:
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_DEBUG_TRANSLATION,
}
