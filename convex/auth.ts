/**
 * SGG Digital — Auth Queries & Mutations
 * Replaces: backend/src/routes/auth.ts + users.ts + twoFactor.ts
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────────────

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const { passwordHash, totpSecret, backupCodes, ...safeUser } = user;
    return safeUser;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();
    if (!user) return null;
    const { passwordHash, totpSecret, backupCodes, ...safeUser } = user;
    return safeUser;
  },
});

export const listUsers = query({
  args: {
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { onlyActive }) => {
    const users = onlyActive
      ? await ctx.db.query("users").withIndex("by_active", (q) => q.eq("isActive", true)).collect()
      : await ctx.db.query("users").collect();
    return users.map(({ passwordHash, totpSecret, backupCodes, ...u }) => u);
  },
});

export const getUserRoles = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getUserPermissions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const roles = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const permissions = [];
    for (const role of roles) {
      const perms = await ctx.db
        .query("rolePermissions")
        .withIndex("by_role", (q) => q.eq("role", role.role))
        .collect();
      permissions.push(...perms);
    }
    return permissions;
  },
});

export const getAuditLogs = query({
  args: {
    module: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { module, limit }) => {
    const logs = module
      ? await ctx.db.query("auditLogs").withIndex("by_module", (q) => q.eq("module", module)).order("desc").take(limit ?? 50)
      : await ctx.db.query("auditLogs").order("desc").take(limit ?? 50);
    return logs;
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const createUser = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, { email, passwordHash, fullName, phone, role }) => {
    // check uniqueness
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();
    if (existing) throw new Error("Email already exists");

    const userId = await ctx.db.insert("users", {
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      phone,
      isActive: true,
      isVerified: false,
      totpEnabled: false,
      loginCount: 0,
      failedLoginCount: 0,
    });

    // Assign role
    if (role) {
      await ctx.db.insert("userRoles", {
        userId,
        role: role as any,
        isPrimary: true,
        grantedAt: Date.now(),
      });
    }

    return userId;
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(userId, filtered);
    return userId;
  },
});

export const assignRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
    institutionId: v.optional(v.id("institutions")),
    isPrimary: v.optional(v.boolean()),
    grantedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, { userId, role, institutionId, isPrimary, grantedBy }) => {
    return await ctx.db.insert("userRoles", {
      userId,
      role: role as any,
      institutionId,
      isPrimary: isPrimary ?? false,
      grantedBy,
      grantedAt: Date.now(),
    });
  },
});

export const removeRole = mutation({
  args: { roleId: v.id("userRoles") },
  handler: async (ctx, { roleId }) => {
    await ctx.db.delete(roleId);
  },
});

export const logAudit = mutation({
  args: {
    userId: v.optional(v.id("users")),
    action: v.string(),
    module: v.string(),
    tableName: v.string(),
    recordId: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", args);
  },
});
