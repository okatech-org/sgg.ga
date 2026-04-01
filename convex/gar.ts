/**
 * SGG Digital — GAR (Gestion Axée sur les Résultats) Queries & Mutations
 * Replaces: backend/src/routes/gar.ts (23KB)
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────────────

export const getPriorites = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("garPrioritesPag")
      .collect()
      .then((r) => r.sort((a, b) => a.ordre - b.ordre));
  },
});

export const getDashboard = query({
  args: {},
  handler: async (ctx) => {
    const priorites = await ctx.db.query("garPrioritesPag").collect();
    const currentYear = new Date().getFullYear();

    const dashboard = await Promise.all(
      priorites.sort((a, b) => a.ordre - b.ordre).map(async (p) => {
        const objectifs = await ctx.db
          .query("garObjectifs")
          .withIndex("by_priorite", (q) => q.eq("prioriteId", p._id))
          .collect();

        const thisYear = objectifs.filter((o) => o.annee === currentYear);

        return {
          prioriteId: p._id,
          priorite: p.priorite,
          titre: p.titre,
          icone: p.icone,
          couleur: p.couleur,
          budgetAlloue: p.budgetAlloue,
          budgetConsomme: p.budgetConsomme,
          tauxConsommation:
            p.budgetAlloue > 0
              ? Math.round((p.budgetConsomme / p.budgetAlloue) * 10000) / 100
              : 0,
          nbObjectifs: thisYear.length,
          objectifsAtteints: thisYear.filter((o) => o.statut === "atteint").length,
          objectifsEnRetard: thisYear.filter((o) => o.statut === "en_retard").length,
          objectifsEnCours: thisYear.filter((o) => o.statut === "en_cours").length,
          tauxExecutionMoyen:
            thisYear.length > 0
              ? Math.round(
                  thisYear.reduce((sum, o) => {
                    const taux =
                      o.valeurCible && o.valeurCible > 0
                        ? ((o.valeurRealisee ?? 0) / o.valeurCible) * 100
                        : 0;
                    return sum + taux;
                  }, 0) / thisYear.length * 100
                ) / 100
              : 0,
        };
      })
    );

    return dashboard;
  },
});

export const getObjectifs = query({
  args: {
    prioriteId: v.optional(v.id("garPrioritesPag")),
    ministereId: v.optional(v.id("institutions")),
    annee: v.optional(v.number()),
    statut: v.optional(v.string()),
  },
  handler: async (ctx, { prioriteId, ministereId, annee, statut }) => {
    let results;

    if (prioriteId) {
      results = await ctx.db
        .query("garObjectifs")
        .withIndex("by_priorite", (q) => q.eq("prioriteId", prioriteId))
        .collect();
    } else if (ministereId) {
      results = await ctx.db
        .query("garObjectifs")
        .withIndex("by_ministere", (q) => q.eq("ministereId", ministereId))
        .collect();
    } else if (annee) {
      results = await ctx.db
        .query("garObjectifs")
        .withIndex("by_annee", (q) => q.eq("annee", annee))
        .collect();
    } else {
      results = await ctx.db.query("garObjectifs").collect();
    }

    if (statut) {
      results = results.filter((o) => o.statut === statut);
    }

    return results;
  },
});

export const getObjectif = query({
  args: { id: v.id("garObjectifs") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getRapports = query({
  args: {
    ministereId: v.optional(v.id("institutions")),
    annee: v.optional(v.number()),
    statut: v.optional(v.string()),
  },
  handler: async (ctx, { ministereId, annee, statut }) => {
    let results;

    if (ministereId) {
      results = await ctx.db
        .query("garRapports")
        .withIndex("by_ministere", (q) => q.eq("ministereId", ministereId))
        .collect();
    } else if (annee) {
      results = await ctx.db
        .query("garRapports")
        .withIndex("by_periode", (q) => q.eq("annee", annee))
        .collect();
    } else {
      results = await ctx.db.query("garRapports").collect();
    }

    if (statut) {
      results = results.filter((r) => r.statut === statut);
    }

    return results.sort((a, b) => {
      if (a.annee !== b.annee) return b.annee - a.annee;
      return b.mois - a.mois;
    });
  },
});

export const getIndicateurs = query({
  args: { objectifId: v.id("garObjectifs") },
  handler: async (ctx, { objectifId }) => {
    return await ctx.db
      .query("garIndicateurs")
      .withIndex("by_objectif", (q) => q.eq("objectifId", objectifId))
      .collect();
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const createObjectif = mutation({
  args: {
    code: v.string(),
    prioriteId: v.id("garPrioritesPag"),
    ministereId: v.id("institutions"),
    titre: v.string(),
    description: v.optional(v.string()),
    annee: v.number(),
    valeurCible: v.optional(v.number()),
    budgetPrevu: v.optional(v.number()),
    responsableNom: v.optional(v.string()),
    responsableEmail: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("garObjectifs", {
      ...args,
      statut: "planifie",
      niveau: 1,
      budgetPrevu: args.budgetPrevu ?? 0,
      budgetEngage: 0,
      budgetDecaisse: 0,
    });
  },
});

export const updateObjectif = mutation({
  args: {
    id: v.id("garObjectifs"),
    statut: v.optional(v.string()),
    valeurRealisee: v.optional(v.number()),
    budgetEngage: v.optional(v.number()),
    budgetDecaisse: v.optional(v.number()),
    observations: v.optional(v.string()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const createRapport = mutation({
  args: {
    ministereId: v.id("institutions"),
    annee: v.number(),
    mois: v.number(),
    donneesMatrice: v.any(),
    synthese: v.optional(v.string()),
    soumisPar: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("garRapports", {
      ...args,
      nbObjectifsSuivis: 0,
      nbObjectifsAtteints: 0,
      nbObjectifsEnRetard: 0,
      tauxGlobalRealisation: 0,
      statut: "soumis",
      dateSoumission: Date.now(),
    });
  },
});

export const validerRapport = mutation({
  args: {
    id: v.id("garRapports"),
    validePar: v.id("users"),
    observations: v.optional(v.string()),
  },
  handler: async (ctx, { id, validePar, observations }) => {
    await ctx.db.patch(id, {
      statut: "valide",
      validePar,
      dateValidation: Date.now(),
      observationsValidation: observations,
    });
  },
});
