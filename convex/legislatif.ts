/**
 * SGG Digital — Législatif Queries & Mutations
 * Replaces: backend/src/routes/legislatif.ts (14KB)
 * Cycle législatif en 8 étapes
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getProgression(statut: string): { pourcentage: number; nomEtape: string } {
  const map: Record<string, { pourcentage: number; nomEtape: string }> = {
    redaction: { pourcentage: 5, nomEtape: "Soumission" },
    soumis: { pourcentage: 10, nomEtape: "Soumission" },
    examen_sgg: { pourcentage: 20, nomEtape: "Examen SGG" },
    validation_sgg: { pourcentage: 20, nomEtape: "Examen SGG" },
    transmission_ce: { pourcentage: 35, nomEtape: "Conseil d'État" },
    examen_ce: { pourcentage: 35, nomEtape: "Conseil d'État" },
    avis_ce_recu: { pourcentage: 35, nomEtape: "Conseil d'État" },
    inscription_cm: { pourcentage: 50, nomEtape: "Conseil des Ministres" },
    adopte_cm: { pourcentage: 50, nomEtape: "Conseil des Ministres" },
    depot_an: { pourcentage: 60, nomEtape: "Parlement" },
    commission_an: { pourcentage: 60, nomEtape: "Parlement" },
    vote_an: { pourcentage: 70, nomEtape: "Parlement" },
    depot_senat: { pourcentage: 60, nomEtape: "Parlement" },
    commission_senat: { pourcentage: 60, nomEtape: "Parlement" },
    vote_senat: { pourcentage: 70, nomEtape: "Parlement" },
    cmp: { pourcentage: 70, nomEtape: "Parlement" },
    vote_definitif: { pourcentage: 70, nomEtape: "Parlement" },
    saisine_cc: { pourcentage: 80, nomEtape: "Cour Constitutionnelle" },
    examen_cc: { pourcentage: 80, nomEtape: "Cour Constitutionnelle" },
    decision_cc: { pourcentage: 80, nomEtape: "Cour Constitutionnelle" },
    transmission_presidence: { pourcentage: 90, nomEtape: "Promulgation" },
    signature_promulgation: { pourcentage: 90, nomEtape: "Promulgation" },
    transmission_jo: { pourcentage: 90, nomEtape: "Publication JO" },
    publie_jo: { pourcentage: 100, nomEtape: "Publication JO" },
    rejete: { pourcentage: 0, nomEtape: "Rejeté" },
    retire: { pourcentage: 0, nomEtape: "Retiré" },
    caduc: { pourcentage: 0, nomEtape: "Caduc" },
  };
  return map[statut] ?? { pourcentage: 0, nomEtape: "Inconnu" };
}

// ── Queries ──────────────────────────────────────────────────────────────────

export const listTextes = query({
  args: {
    type: v.optional(v.string()),
    statut: v.optional(v.string()),
    ministereId: v.optional(v.id("institutions")),
  },
  handler: async (ctx, { type, statut, ministereId }) => {
    let results;
    if (type) {
      results = await ctx.db
        .query("legislatifTextes")
        .withIndex("by_type", (q) => q.eq("type", type as any))
        .collect();
    } else if (statut) {
      results = await ctx.db
        .query("legislatifTextes")
        .withIndex("by_statut", (q) => q.eq("statut", statut as any))
        .collect();
    } else if (ministereId) {
      results = await ctx.db
        .query("legislatifTextes")
        .withIndex("by_ministere", (q) => q.eq("ministereOrigineId", ministereId))
        .collect();
    } else {
      results = await ctx.db.query("legislatifTextes").collect();
    }

    return results.map((t) => ({
      ...t,
      ...getProgression(t.statut),
    }));
  },
});

export const getTexte = query({
  args: { id: v.id("legislatifTextes") },
  handler: async (ctx, { id }) => {
    const texte = await ctx.db.get(id);
    if (!texte) return null;

    const versions = await ctx.db
      .query("legislatifVersions")
      .withIndex("by_texte", (q) => q.eq("texteId", id))
      .collect();
    const avis = await ctx.db
      .query("legislatifAvis")
      .withIndex("by_texte", (q) => q.eq("texteId", id))
      .collect();
    const historique = await ctx.db
      .query("legislatifHistorique")
      .withIndex("by_texte", (q) => q.eq("texteId", id))
      .collect();
    const amendements = await ctx.db
      .query("legislatifAmendements")
      .withIndex("by_texte", (q) => q.eq("texteId", id))
      .collect();
    const ministere = await ctx.db.get(texte.ministereOrigineId);

    return {
      ...texte,
      ...getProgression(texte.statut),
      versions,
      avis,
      historique,
      amendements,
      ministere,
    };
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const createTexte = mutation({
  args: {
    titre: v.string(),
    type: v.string(),
    ministereOrigineId: v.id("institutions"),
    objet: v.optional(v.string()),
    exposeMotifs: v.optional(v.string()),
    isUrgence: v.optional(v.boolean()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Auto-generate reference
    const prefixMap: Record<string, string> = {
      loi_ordinaire: "PL", loi_organique: "PLO", ordonnance: "ORD",
      decret: "D", arrete: "A", decision: "DEC", circulaire: "CIR", instruction: "INS",
    };
    const prefix = prefixMap[args.type] ?? "TXT";
    const year = new Date().getFullYear();
    const existing = await ctx.db.query("legislatifTextes").collect();
    const yearTextes = existing.filter((t) => t.reference.startsWith(`${prefix}-${year}`));
    const seq = yearTextes.length + 1;
    const reference = `${prefix}-${year}-${String(seq).padStart(4, "0")}`;

    return await ctx.db.insert("legislatifTextes", {
      reference,
      titre: args.titre,
      type: args.type as any,
      ministereOrigineId: args.ministereOrigineId,
      statut: "redaction",
      etapeActuelle: 1,
      isUrgence: args.isUrgence ?? false,
      isLoiFinances: false,
      isLoiReglement: false,
      objet: args.objet,
      exposeMotifs: args.exposeMotifs,
      createdBy: args.createdBy,
    });
  },
});

export const transitionTexte = mutation({
  args: {
    texteId: v.id("legislatifTextes"),
    nouveauStatut: v.string(),
    commentaire: v.optional(v.string()),
    acteurId: v.id("users"),
    acteurNom: v.optional(v.string()),
  },
  handler: async (ctx, { texteId, nouveauStatut, commentaire, acteurId, acteurNom }) => {
    const texte = await ctx.db.get(texteId);
    if (!texte) throw new Error("Texte not found");

    const ancienStatut = texte.statut;
    const { pourcentage } = getProgression(nouveauStatut);
    const etape = Math.ceil(pourcentage / 12.5) || 1;

    await ctx.db.patch(texteId, {
      statut: nouveauStatut as any,
      etapeActuelle: Math.min(etape, 8),
    });

    await ctx.db.insert("legislatifHistorique", {
      texteId,
      etape,
      action: `Transition: ${ancienStatut} → ${nouveauStatut}`,
      ancienStatut,
      nouveauStatut,
      commentaire,
      acteurId,
      acteurNom,
    });
  },
});

export const addAvis = mutation({
  args: {
    texteId: v.id("legislatifTextes"),
    institutionId: v.id("institutions"),
    typeAvis: v.string(),
    nature: v.string(),
    resume: v.optional(v.string()),
    recommandations: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("legislatifAvis", {
      ...args,
      nature: args.nature as any,
      dateSaisine: Date.now(),
    });
  },
});
