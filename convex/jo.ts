import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listNumeros = query({
  args: { annee: v.optional(v.number()), limit: v.optional(v.number()) },
  handler: async (ctx, { annee, limit }) => {
    let results;
    if (annee) {
      results = await ctx.db.query("joNumeros").withIndex("by_annee", (q) => q.eq("annee", annee)).collect();
    } else {
      results = await ctx.db.query("joNumeros").collect();
    }
    return results.sort((a, b) => b.datePublication.localeCompare(a.datePublication)).slice(0, limit ?? 50);
  },
});

export const getNumero = query({
  args: { id: v.id("joNumeros") },
  handler: async (ctx, { id }) => {
    const numero = await ctx.db.get(id);
    if (!numero) return null;
    const textes = await ctx.db.query("joTextes").withIndex("by_numero_jo", (q) => q.eq("numeroJoId", id)).collect();
    return { ...numero, textes };
  },
});

export const listTextes = query({
  args: { type: v.optional(v.string()), search: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { type, search, limit }) => {
    let results;
    if (type) {
      results = await ctx.db.query("joTextes").withIndex("by_type", (q) => q.eq("type", type as any)).collect();
    } else {
      results = await ctx.db.query("joTextes").collect();
    }
    if (search) {
      const s = search.toLowerCase();
      results = results.filter((t) => t.titre.toLowerCase().includes(s) || t.numero.toLowerCase().includes(s) || t.resume?.toLowerCase().includes(s));
    }
    return results.sort((a, b) => b.datePublication.localeCompare(a.datePublication)).slice(0, limit ?? 50);
  },
});

export const getTexte = query({
  args: { id: v.id("joTextes") },
  handler: async (ctx, { id }) => {
    const texte = await ctx.db.get(id);
    if (!texte) return null;
    const articles = await ctx.db.query("joArticles").withIndex("by_texte", (q) => q.eq("texteId", id)).collect();
    const annexes = await ctx.db.query("joAnnexes").withIndex("by_texte", (q) => q.eq("texteId", id)).collect();
    return { ...texte, articles: articles.sort((a, b) => a.ordre - b.ordre), annexes: annexes.sort((a, b) => a.ordre - b.ordre) };
  },
});

export const getStatistiques = query({
  args: {},
  handler: async (ctx) => {
    const numeros = await ctx.db.query("joNumeros").collect();
    const textes = await ctx.db.query("joTextes").collect();
    const abonnes = await ctx.db.query("joAbonnements").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
    return { totalNumeros: numeros.length, totalTextes: textes.length, totalAbonnes: abonnes.length, totalVues: textes.reduce((s, t) => s + t.nbVues, 0), totalTelechargements: textes.reduce((s, t) => s + t.nbTelechargements, 0) };
  },
});

export const createNumero = mutation({
  args: { annee: v.number(), datePublication: v.string(), type: v.optional(v.string()), publiePar: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("joNumeros").withIndex("by_annee", (q) => q.eq("annee", args.annee)).collect();
    const numeroOrdre = existing.length + 1;
    return await ctx.db.insert("joNumeros", { numero: `JO-${args.annee}-${String(numeroOrdre).padStart(3, "0")}`, numeroOrdre, ...args, nbTextes: 0, nbVues: 0, nbTelechargements: 0, isPublie: false });
  },
});

export const publierNumero = mutation({
  args: { id: v.id("joNumeros"), publiePar: v.id("users") },
  handler: async (ctx, { id, publiePar }) => {
    const textes = await ctx.db.query("joTextes").withIndex("by_numero_jo", (q) => q.eq("numeroJoId", id)).collect();
    await ctx.db.patch(id, { isPublie: true, publiePar, nbTextes: textes.length });
    for (const t of textes) { if (t.statut !== "publie") await ctx.db.patch(t._id, { statut: "publie" }); }
  },
});

export const createTexteJo = mutation({
  args: { numeroJoId: v.id("joNumeros"), numero: v.string(), type: v.string(), titre: v.string(), signataire: v.string(), dateSignature: v.string(), datePublication: v.string(), resume: v.optional(v.string()), createdBy: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("joTextes", { ...args, type: args.type as any, statut: "en_preparation", isConsolide: false, nbVues: 0, nbTelechargements: 0 });
  },
});

export const trackView = mutation({
  args: { texteId: v.id("joTextes") },
  handler: async (ctx, { texteId }) => {
    const t = await ctx.db.get(texteId);
    if (t) await ctx.db.patch(texteId, { nbVues: t.nbVues + 1 });
  },
});

export const subscribe = mutation({
  args: { email: v.string(), nom: v.optional(v.string()), frequence: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("joAbonnements").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existing) { await ctx.db.patch(existing._id, { isActive: true }); return existing._id; }
    return await ctx.db.insert("joAbonnements", { ...args, isActive: true });
  },
});
