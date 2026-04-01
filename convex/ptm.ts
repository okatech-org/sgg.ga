import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listInitiatives = query({
  args: { ministereId: v.optional(v.id("institutions")), annee: v.optional(v.number()), statut: v.optional(v.string()) },
  handler: async (ctx, { ministereId, annee, statut }) => {
    let results;
    if (ministereId) { results = await ctx.db.query("ptmInitiatives").withIndex("by_ministere", (q) => q.eq("ministereId", ministereId)).collect(); }
    else if (annee) { results = await ctx.db.query("ptmInitiatives").withIndex("by_annee", (q) => q.eq("annee", annee)).collect(); }
    else { results = await ctx.db.query("ptmInitiatives").collect(); }
    if (statut) results = results.filter((i) => i.statut === statut);
    return results;
  },
});

export const getInitiative = query({
  args: { id: v.id("ptmInitiatives") },
  handler: async (ctx, { id }) => {
    const init = await ctx.db.get(id);
    if (!init) return null;
    const historique = await ctx.db.query("ptmHistorique").withIndex("by_initiative", (q) => q.eq("initiativeId", id)).collect();
    const ministere = await ctx.db.get(init.ministereId);
    return { ...init, historique, ministere };
  },
});

export const createInitiative = mutation({
  args: { ministereId: v.id("institutions"), annee: v.number(), rubrique: v.string(), intitule: v.string(), cadrage: v.optional(v.string()), incidenceFinanciere: v.optional(v.boolean()), createdBy: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("ptmInitiatives").withIndex("by_ministere", (q) => q.eq("ministereId", args.ministereId)).collect();
    const sameYear = existing.filter((i) => i.annee === args.annee && i.rubrique === args.rubrique);
    return await ctx.db.insert("ptmInitiatives", {
      ...args, rubrique: args.rubrique as any, cadrage: (args.cadrage as any) ?? "pag",
      numero: sameYear.length + 1, incidenceFinanciere: args.incidenceFinanciere ?? false,
      loiFinance: false, statut: "brouillon", createdBy: args.createdBy,
    });
  },
});

export const transitionInitiative = mutation({
  args: { id: v.id("ptmInitiatives"), nouveauStatut: v.string(), commentaire: v.optional(v.string()), acteurId: v.id("users"), acteurNom: v.optional(v.string()) },
  handler: async (ctx, { id, nouveauStatut, commentaire, acteurId, acteurNom }) => {
    const init = await ctx.db.get(id);
    if (!init) throw new Error("Initiative not found");
    const ancienStatut = init.statut;
    await ctx.db.patch(id, { statut: nouveauStatut as any });
    await ctx.db.insert("ptmHistorique", { initiativeId: id, action: `${ancienStatut} → ${nouveauStatut}`, ancienStatut, nouveauStatut, commentaire, acteurId, acteurNom });
  },
});
