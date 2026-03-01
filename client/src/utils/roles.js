// roleId mapping: 1 = admin, 2 = customer, 3 = staff
const ROLE_ID_MAP = { 1: 'admin', 2: 'customer', 3: 'staff' };

export const extractUserRoles = (user) => {
  if (!user) {
    return [];
  }

  // Real backend user: roleId is a number
  if (typeof user.roleId === 'number') {
    const roleName = ROLE_ID_MAP[user.roleId];
    return roleName ? [roleName] : [];
  }

  // Mock / legacy: roles array
  if (Array.isArray(user.roles)) {
    return user.roles;
  }

  if (Array.isArray(user.role)) {
    return user.role;
  }

  if (typeof user.role === 'string' && user.role.trim()) {
    return [user.role];
  }

  return [];
};

export const getRoleId = (user) => user?.roleId ?? null;
export const isAdmin = (user) => user?.roleId === 1;
export const isCustomer = (user) => user?.roleId === 2;
export const isStaff = (user) => user?.roleId === 3;
