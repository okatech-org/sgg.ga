/**
 * SGG Digital — Institutions Queries & Mutations
 * Replaces: backend/src/routes/institutions.ts
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────────────

export const list = query({
  args: {
    type: v.optional(v.string()),
    onlyActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { type, onlyActive }) => {
    let results;
    if (type) {
      results = await ctx.db
        .query("institutions")
        .withIndex("by_type", (q) => q.eq("type", type as any))
        .collect();
    } else {
      results = await ctx.db.query("institutions").collect();
    }
    if (onlyActive) {
      results = results.filter((i) => i.isActive);
    }
    return results.sort((a, b) => (a.ordreProtocole ?? 999) - (b.ordreProtocole ?? 999));
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("institutions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
  },
});

export const get = query({
  args: { id: v.id("institutions") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getMinisteres = query({
  args: {},
  handler: async (ctx) => {
    const ministeres = await ctx.db
      .query("institutions")
      .withIndex("by_type", (q) => q.eq("type", "ministere"))
      .collect();
    return ministeres
      .filter((m) => m.isActive)
      .sort((a, b) => (a.ordreProtocole ?? 999) - (b.ordreProtocole ?? 999));
  },
});

export const getChildren = query({
  args: { parentId: v.id("institutions") },
  handler: async (ctx, { parentId }) => {
    return await ctx.db
      .query("institutions")
      .withIndex("by_parent", (q) => q.eq("parentId", parentId))
      .collect();
  },
});

export const getInteractions = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, { institutionId }) => {
    const outgoing = await ctx.db
      .query("institutionInteractions")
      .withIndex("by_source", (q) => q.eq("institutionSourceId", institutionId))
      .collect();
    const incoming = await ctx.db
      .query("institutionInteractions")
      .withIndex("by_cible", (q) => q.eq("institutionCibleId", institutionId))
      .collect();
    return { outgoing, incoming };
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    code: v.string(),
    nom: v.string(),
    nomCourt: v.optional(v.string()),
    sigle: v.optional(v.string()),
    type: v.string(),
    parentId: v.optional(v.id("institutions")),
    ordreProtocole: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("institutions", {
      ...args,
      type: args.type as any,
      isActive: true,
      niveauDigitalisation: "niveau_0",
      ville: "Libreville",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("institutions"),
    nom: v.optional(v.string()),
    nomCourt: v.optional(v.string()),
    sigle: v.optional(v.string()),
    responsableNom: v.optional(v.string()),
    responsableFonction: v.optional(v.string()),
    niveauDigitalisation: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});
