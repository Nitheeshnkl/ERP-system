export function normalizeRole(role?: string) {
  return (role || '').toLowerCase().trim()
}

export function hasAnyRole(userRole?: string, allowedRoles?: string[]) {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRole) return false
  const normalizedUser = normalizeRole(userRole)
  return allowedRoles.map(normalizeRole).includes(normalizedUser)
}
