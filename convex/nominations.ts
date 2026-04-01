/**
 * SGG Digital — Nominations Queries & Mutations
 * Replaces: backend/src/routes/nominations.ts (13KB)
 */
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──────────────────────────────────────────────────────────────────

export const listDossiers = query({
  args: {
    statut: v.optional(v.string()),
    ministereId: v.optional(v.id("institutions")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { statut, ministereId, limit }) => {
    let results;
    if (statut) {
      results = await ctx.db
        .query("nominationsDossiers")
        .withIndex("by_statut", (q) => q.eq("statut", statut as any))
        .collect();
    } else if (ministereId) {
      results = await ctx.db
        .query("nominationsDossiers")
        .withIndex("by_ministere", (q) => q.eq("ministereProposantId", ministereId))
        .collect();
    } else {
      results = await ctx.db.query("nominationsDossiers").collect();
    }

    // Enrich with candidat and poste names
    const enriched = await Promise.all(
      results.map(async (d) => {
        const candidat = await ctx.db.get(d.candidatId);
        const poste = await ctx.db.get(d.posteId);
        return {
          ...d,
          candidatNom: candidat ? `${candidat.prenom} ${candidat.nom}` : "—",
          candidatMatricule: candidat?.matricule,
          posteTitre: poste?.titre ?? "—",
          posteCategorie: poste?.categorie,
        };
      })
    );

    return enriched.slice(0, limit ?? 100);
  },
});

export const getDossier = query({
  args: { id: v.id("nominationsDossiers") },
  handler: async (ctx, { id }) => {
    const dossier = await ctx.db.get(id);
    if (!dossier) return null;

    const candidat = await ctx.db.get(dossier.candidatId);
    const poste = await ctx.db.get(dossier.posteId);
    const ministere = await ctx.db.get(dossier.ministereProposantId);
    const documents = await ctx.db
      .query("nominationsDocuments")
      .withIndex("by_dossier", (q) => q.eq("dossierId", id))
      .collect();
    const historique = await ctx.db
      .query("nominationsHistorique")
      .withIndex("by_dossier", (q) => q.eq("dossierId", id))
      .collect();

    return { ...dossier, candidat, poste, ministere, documents, historique };
  },
});

export const listPostes = query({
  args: {
    institutionId: v.optional(v.id("institutions")),
    onlyVacant: v.optional(v.boolean()),
  },
  handler: async (ctx, { institutionId, onlyVacant }) => {
    let results;
    if (institutionId) {
      results = await ctx.db
        .query("nominationsPostes")
        .withIndex("by_institution", (q) => q.eq("institutionId", institutionId))
        .collect();
    } else {
      results = await ctx.db.query("nominationsPostes").collect();
    }
    if (onlyVacant) {
      results = results.filter((p) => p.isVacant);
    }
    return results;
  },
});

export const listCandidats = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    let candidats = await ctx.db.query("nominationsCandidats").collect();
    if (search) {
      const s = search.toLowerCase();
      candidats = candidats.filter(
        (c) =>
          c.nom.toLowerCase().includes(s) ||
          c.prenom.toLowerCase().includes(s) ||
          c.matricule?.toLowerCase().includes(s)
      );
    }
    return candidats;
  },
});

export const getHistorique = query({
  args: { dossierId: v.id("nominationsDossiers") },
  handler: async (ctx, { dossierId }) => {
    return await ctx.db
      .query("nominationsHistorique")
      .withIndex("by_dossier", (q) => q.eq("dossierId", dossierId))
      .order("desc")
      .collect();
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

export const createCandidat = mutation({
  args: {
    nom: v.string(),
    prenom: v.string(),
    dateNaissance: v.string(),
    matricule: v.optional(v.string()),
    email: v.optional(v.string()),
    telephone: v.optional(v.string()),
    corps: v.optional(v.string()),
    gradeActuel: v.optional(v.string()),
    diplomePlusEleve: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("nominationsCandidats", {
      ...args,
      nationalite: "Gabonaise",
      casierJudiciaireVerifie: false,
    });
  },
});

export const createDossier = mutation({
  args: {
    candidatId: v.id("nominationsCandidats"),
    posteId: v.id("nominationsPostes"),
    ministereProposantId: v.id("institutions"),
    type: v.string(),
    motifProposition: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Auto-generate reference
    const year = new Date().getFullYear();
    const existing = await ctx.db.query("nominationsDossiers").collect();
    const yearDossiers = existing.filter((d) => d.reference.startsWith(`NOM-${year}`));
    const seq = yearDossiers.length + 1;
    const reference = `NOM-${year}-${String(seq).padStart(4, "0")}`;

    return await ctx.db.insert("nominationsDossiers", {
      reference,
      candidatId: args.candidatId,
      posteId: args.posteId,
      ministereProposantId: args.ministereProposantId,
      type: args.type as any,
      statut: "brouillon",
      etapeActuelle: 1,
      isUrgent: false,
      motifProposition: args.motifProposition,
      createdBy: args.createdBy,
    });
  },
});

export const transitionDossier = mutation({
  args: {
    dossierId: v.id("nominationsDossiers"),
    nouveauStatut: v.string(),
    commentaire: v.optional(v.string()),
    acteurId: v.id("users"),
    acteurNom: v.optional(v.string()),
  },
  handler: async (ctx, { dossierId, nouveauStatut, commentaire, acteurId, acteurNom }) => {
    const dossier = await ctx.db.get(dossierId);
    if (!dossier) throw new Error("Dossier not found");

    const ancienStatut = dossier.statut;

    // Update dossier
    const etapeMap: Record<string, number> = {
      brouillon: 1, soumis: 2, recevabilite: 3, examen_sgg: 4,
      avis_favorable: 5, avis_defavorable: 5, transmis_sgpr: 6,
      arbitrage_pm: 7, conseil_ministres: 8, valide_cm: 9,
      signature: 10, signe: 11, publie_jo: 12, rejete: 0,
    };

    await ctx.db.patch(dossierId, {
      statut: nouveauStatut as any,
      etapeActuelle: etapeMap[nouveauStatut] ?? dossier.etapeActuelle,
    });

    // Record history
    await ctx.db.insert("nominationsHistorique", {
      dossierId,
      action: `Transition: ${ancienStatut} → ${nouveauStatut}`,
      ancienStatut,
      nouveauStatut,
      commentaire,
      acteurId,
      acteurNom,
    });
  },
});
