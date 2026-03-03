const ROLE_MAP = {
  admin: 'Admin',
  sales: 'Sales',
  purchase: 'Purchase',
  inventory: 'Inventory',
};

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

const canonicalizeRole = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_MAP[normalized] || null;
};

const hasRole = (userRole, allowedRoles = []) => {
  const normalizedUserRole = normalizeRole(userRole);
  return allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizedUserRole);
};

module.exports = {
  normalizeRole,
  canonicalizeRole,
  hasRole,
};
