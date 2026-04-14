/** After login, `userRole` is set. Falls back for older sessions. */
export function getUserRole() {
  const explicit = sessionStorage.getItem("userRole");
  if (explicit === "admin" || explicit === "pos") return explicit;
  const auth = sessionStorage.getItem("auth");
  if (auth === "SU") return "admin";
  return "pos";
}

export function clearAuthSession() {
  sessionStorage.removeItem("auth");
  sessionStorage.removeItem("userRole");
  localStorage.removeItem("item_key");
}
