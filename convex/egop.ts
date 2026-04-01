/**
 * SGG Digital — e-GOP (Conseils, Réunions, Courrier) Queries & Mutations
 * Replaces: backend/src/routes/egop.ts (20KB)
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══ CONSEILS ═══════════════════════════════════════════════════════════════

export const listConseils = query({
  args: { statut: v.optional(v.string()) },
  handler: async (ctx, { statut }) => {
    let results;
    if (statut) {
      results = await ctx.db.query("egopConseils")
        .withIndex("by_statut", (q) => q.eq("statut", statut as any))
        .collect();
    } else {
      results = await ctx.db.query("egopConseils").collect();
    }
    return results.sort((a, b) => b.dateConseil.localeCompare(a.dateConseil));
  },
});

export const getConseil = query({
  args: { id: v.id("egopConseils") },
  handler: async (ctx, { id }) => {
    const conseil = await ctx.db.get(id);
    if (!conseil) return null;
    const participants = await ctx.db.query("egopConseilParticipants")
      .withIndex("by_conseil", (q) => q.eq("conseilId", id)).collect();
    const dossiers = await ctx.db.query("egopConseilDossiers")
      .withIndex("by_conseil", (q) => q.eq("conseilId", id)).collect();
    return { ...conseil, participants, dossiers: dossiers.sort((a, b) => a.ordre - b.ordre) };
  },
});

export const createConseil = mutation({
  args: {
    type: v.string(), titre: v.string(), dateConseil: v.string(),
    lieu: v.optional(v.string()), objet: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const year = new Date().getFullYear();
    const existing = await ctx.db.query("egopConseils").collect();
    const seq = existing.filter((c) => c.reference.startsWith(`CM-${year}`)).length + 1;
    const reference = `CM-${year}-${String(seq).padStart(3, "0")}`;
    return await ctx.db.insert("egopConseils", {
      reference, ...args, statut: "planifiee",
      nbInstitutionsConvoquees: 0, nbInstitutionsConfirmees: 0, nbPresents: 0,
      nbDossiersExamines: 0, nbDecisionsPrises: 0,
    });
  },
});

// ═══ RÉUNIONS ═══════════════════════════════════════════════════════════════

export const listReunions = query({
  args: { statut: v.optional(v.string()) },
  handler: async (ctx, { statut }) => {
    let results;
    if (statut) {
      results = await ctx.db.query("egopReunions")
        .withIndex("by_statut", (q) => q.eq("statut", statut as any)).collect();
    } else {
      results = await ctx.db.query("egopReunions").collect();
    }
    return results.sort((a, b) => b.dateReunion.localeCompare(a.dateReunion));
  },
});

export const getReunion = query({
  args: { id: v.id("egopReunions") },
  handler: async (ctx, { id }) => {
    const reunion = await ctx.db.get(id);
    if (!reunion) return null;
    const participants = await ctx.db.query("egopReunionParticipants")
      .withIndex("by_reunion", (q) => q.eq("reunionId", id)).collect();
    return { ...reunion, participants };
  },
});

export const createReunion = mutation({
  args: {
    objet: v.string(), dateReunion: v.string(), type: v.optional(v.string()),
    lieu: v.optional(v.string()), isVisioconference: v.optional(v.boolean()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const year = new Date().getFullYear();
    const existing = await ctx.db.query("egopReunions").collect();
    const seq = existing.filter((r) => r.reference.startsWith(`RIM-${year}`)).length + 1;
    const reference = `RIM-${year}-${String(seq).padStart(3, "0")}`;
    return await ctx.db.insert("egopReunions", {
      reference, ...args, isVisioconference: args.isVisioconference ?? false,
      statut: "planifiee",
    });
  },
});

// ═══ COURRIERS ═════════════════════════════════════════════════════════════

export const listCourriers = query({
  args: {
    type: v.optional(v.string()), statut: v.optional(v.string()),
    priorite: v.optional(v.string()),
  },
  handler: async (ctx, { type, statut, priorite }) => {
    let results;
    if (type) {
      results = await ctx.db.query("egopCourriers")
        .withIndex("by_type", (q) => q.eq("type", type as any)).collect();
    } else if (statut) {
      results = await ctx.db.query("egopCourriers")
        .withIndex("by_statut", (q) => q.eq("statut", statut as any)).collect();
    } else if (priorite) {
      results = await ctx.db.query("egopCourriers")
        .withIndex("by_priorite", (q) => q.eq("priorite", priorite as any)).collect();
    } else {
      results = await ctx.db.query("egopCourriers").collect();
    }
    return results;
  },
});

export const getCourrier = query({
  args: { id: v.id("egopCourriers") },
  handler: async (ctx, { id }) => {
    const courrier = await ctx.db.get(id);
    if (!courrier) return null;
    const historique = await ctx.db.query("egopCourrierHistorique")
      .withIndex("by_courrier", (q) => q.eq("courrierId", id)).collect();
    return { ...courrier, historique };
  },
});

export const createCourrier = mutation({
  args: {
    type: v.string(), objet: v.string(), contenu: v.optional(v.string()),
    priorite: v.optional(v.string()),
    expediteurNom: v.optional(v.string()), expediteurInstitutionId: v.optional(v.id("institutions")),
    destinataireNom: v.optional(v.string()), destinataireInstitutionId: v.optional(v.id("institutions")),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const year = new Date().getFullYear();
    const existing = await ctx.db.query("egopCourriers").collect();
    const seq = existing.filter((c) => c.reference.startsWith(`CRR-${year}`)).length + 1;
    const reference = `CRR-${year}-${String(seq).padStart(4, "0")}`;
    return await ctx.db.insert("egopCourriers", {
      reference,
      type: args.type as any,
      objet: args.objet,
      contenu: args.contenu,
      priorite: (args.priorite as any) ?? "normale",
      statut: args.type === "entrant" ? "recu" : "enregistre",
      expediteurNom: args.expediteurNom,
      expediteurInstitutionId: args.expediteurInstitutionId,
      destinataireNom: args.destinataireNom,
      destinataireInstitutionId: args.destinataireInstitutionId,
      confidentiel: false,
      createdBy: args.createdBy,
    });
  },
});

export const transitionCourrier = mutation({
  args: {
    courrierId: v.id("egopCourriers"), nouveauStatut: v.string(),
    commentaire: v.optional(v.string()), acteurId: v.optional(v.id("users")),
  },
  handler: async (ctx, { courrierId, nouveauStatut, commentaire, acteurId }) => {
    const courrier = await ctx.db.get(courrierId);
    if (!courrier) throw new Error("Courrier not found");
    const ancienStatut = courrier.statut;
    await ctx.db.patch(courrierId, { statut: nouveauStatut as any });
    await ctx.db.insert("egopCourrierHistorique", {
      courrierId, action: `${ancienStatut} → ${nouveauStatut}`,
      ancienStatut, nouveauStatut, commentaire, acteurId,
    });
  },
});
