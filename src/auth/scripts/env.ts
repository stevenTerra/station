export const electron =
  process.env.REACT_APP_ELECTRON === "true" ||
  navigator.userAgent.includes("Electron")
