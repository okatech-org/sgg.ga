/**
 * SGG Digital — Seed initial data into Convex
 * Replaces PostgreSQL INSERT statements from schema.sql
 */
import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // ── Check if already seeded ──────────────────────────────
    const existing = await ctx.db.query("garPrioritesPag").first();
    if (existing) {
      console.log("Already seeded, skipping.");
      return { seeded: false, message: "Data already exists" };
    }

    // ── 1. Seed 8 Priorités PAG 2026 ─────────────────────────
    const priorites = [
      { code: "PAG-001", priorite: "sante" as const, titre: "Santé pour Tous", icone: "Heart", couleur: "#EF4444", ordre: 1 },
      { code: "PAG-002", priorite: "education" as const, titre: "Éducation de Qualité", icone: "GraduationCap", couleur: "#3B82F6", ordre: 2 },
      { code: "PAG-003", priorite: "infrastructure" as const, titre: "Infrastructures Modernes", icone: "Building2", couleur: "#8B5CF6", ordre: 3 },
      { code: "PAG-004", priorite: "agriculture" as const, titre: "Sécurité Alimentaire", icone: "Wheat", couleur: "#22C55E", ordre: 4 },
      { code: "PAG-005", priorite: "numerique" as const, titre: "Transformation Numérique", icone: "Laptop", couleur: "#06B6D4", ordre: 5 },
      { code: "PAG-006", priorite: "emploi" as const, titre: "Emploi des Jeunes", icone: "Users", couleur: "#F59E0B", ordre: 6 },
      { code: "PAG-007", priorite: "environnement" as const, titre: "Développement Durable", icone: "TreePine", couleur: "#10B981", ordre: 7 },
      { code: "PAG-008", priorite: "gouvernance" as const, titre: "Bonne Gouvernance", icone: "Shield", couleur: "#6366F1", ordre: 8 },
    ];

    for (const p of priorites) {
      await ctx.db.insert("garPrioritesPag", {
        ...p,
        budgetAlloue: 0,
        budgetConsomme: 0,
        nbObjectifsTotal: 0,
        nbObjectifsAtteints: 0,
      });
    }

    // ── 2. Seed Institutions ──────────────────────────────────
    const coreInstitutions = [
      { code: "PRESIDENCE", nom: "Présidence de la République", nomCourt: "Présidence", sigle: "PR", type: "presidence" as const, ordreProtocole: 1 },
      { code: "SGPR", nom: "Secrétariat Général de la Présidence de la République", nomCourt: "SGPR", sigle: "SGPR", type: "secretariat_general" as const, ordreProtocole: 2 },
      { code: "PRIMATURE", nom: "Primature", nomCourt: "Primature", sigle: "PM", type: "primature" as const, ordreProtocole: 3 },
      { code: "SGG", nom: "Secrétariat Général du Gouvernement", nomCourt: "SGG", sigle: "SGG", type: "secretariat_general" as const, ordreProtocole: 4 },
      { code: "AN", nom: "Assemblée Nationale", nomCourt: "Assemblée Nationale", sigle: "AN", type: "assemblee" as const, ordreProtocole: 10 },
      { code: "SENAT", nom: "Sénat", nomCourt: "Sénat", sigle: "SEN", type: "senat" as const, ordreProtocole: 11 },
      { code: "CE", nom: "Conseil d'État", nomCourt: "Conseil d'État", sigle: "CE", type: "juridiction" as const, ordreProtocole: 20 },
      { code: "CC", nom: "Cour Constitutionnelle", nomCourt: "Cour Constitutionnelle", sigle: "CC", type: "juridiction" as const, ordreProtocole: 21 },
      { code: "DGJO", nom: "Direction Générale du Journal Officiel", nomCourt: "DGJO", sigle: "DGJO", type: "direction_generale" as const, ordreProtocole: 30 },
    ];

    const ministeres = [
      { code: "MIN_ECO", nom: "Ministère de l'Économie et des Participations", nomCourt: "Économie", sigle: "MEP", ordreProtocole: 100 },
      { code: "MIN_BUDGET", nom: "Ministère du Budget et des Comptes Publics", nomCourt: "Budget", sigle: "MBP", ordreProtocole: 101 },
      { code: "MIN_INT", nom: "Ministère de l'Intérieur et de la Sécurité", nomCourt: "Intérieur", sigle: "MIS", ordreProtocole: 102 },
      { code: "MIN_JUST", nom: "Ministère de la Justice, Garde des Sceaux", nomCourt: "Justice", sigle: "MJ", ordreProtocole: 103 },
      { code: "MIN_DEF", nom: "Ministère de la Défense Nationale", nomCourt: "Défense", sigle: "MDN", ordreProtocole: 104 },
      { code: "MIN_AE", nom: "Ministère des Affaires Étrangères", nomCourt: "Affaires Étrangères", sigle: "MAE", ordreProtocole: 105 },
      { code: "MIN_SANTE", nom: "Ministère de la Santé", nomCourt: "Santé", sigle: "MS", ordreProtocole: 106 },
      { code: "MIN_EDUC", nom: "Ministère de l'Éducation Nationale", nomCourt: "Éducation", sigle: "MEN", ordreProtocole: 107 },
      { code: "MIN_ENSUP", nom: "Ministère de l'Enseignement Supérieur", nomCourt: "Enseignement Supérieur", sigle: "MES", ordreProtocole: 108 },
      { code: "MIN_NUM", nom: "Ministère de l'Économie Numérique", nomCourt: "Numérique", sigle: "MEN", ordreProtocole: 109 },
      { code: "MIN_ENERGIE", nom: "Ministère de l'Énergie et des Ressources Hydrauliques", nomCourt: "Énergie", sigle: "MERH", ordreProtocole: 110 },
      { code: "MIN_MINES", nom: "Ministère des Mines et de la Géologie", nomCourt: "Mines", sigle: "MMG", ordreProtocole: 111 },
      { code: "MIN_TRAVAIL", nom: "Ministère du Travail et de l'Emploi", nomCourt: "Travail", sigle: "MTE", ordreProtocole: 112 },
      { code: "MIN_AGRI", nom: "Ministère de l'Agriculture et de l'Élevage", nomCourt: "Agriculture", sigle: "MAE", ordreProtocole: 113 },
      { code: "MIN_ENVIRO", nom: "Ministère de l'Environnement et des Forêts", nomCourt: "Environnement", sigle: "MEF", ordreProtocole: 114 },
      { code: "MIN_TRANS", nom: "Ministère des Transports", nomCourt: "Transports", sigle: "MT", ordreProtocole: 115 },
      { code: "MIN_HABITAT", nom: "Ministère de l'Habitat et de l'Urbanisme", nomCourt: "Habitat", sigle: "MHU", ordreProtocole: 116 },
      { code: "MIN_JEUNESSE", nom: "Ministère de la Jeunesse et des Sports", nomCourt: "Jeunesse", sigle: "MJS", ordreProtocole: 117 },
      { code: "MIN_CULTURE", nom: "Ministère de la Culture et des Arts", nomCourt: "Culture", sigle: "MCA", ordreProtocole: 118 },
      { code: "MIN_COMM", nom: "Ministère de la Communication", nomCourt: "Communication", sigle: "MC", ordreProtocole: 119 },
    ];

    for (const inst of coreInstitutions) {
      await ctx.db.insert("institutions", {
        ...inst,
        isActive: true,
        niveauDigitalisation: "niveau_0",
        ville: "Libreville",
      });
    }

    for (const min of ministeres) {
      await ctx.db.insert("institutions", {
        ...min,
        type: "ministere" as const,
        isActive: true,
        niveauDigitalisation: "niveau_0",
        ville: "Libreville",
      });
    }

    // ── 3. Seed RBAC Permissions ──────────────────────────────
    const permissions: Array<{ role: any; module: string; permission: any }> = [
      // Admin SGG - Full access
      { role: "admin_sgg", module: "gar", permission: "admin" },
      { role: "admin_sgg", module: "nominations", permission: "admin" },
      { role: "admin_sgg", module: "legislatif", permission: "admin" },
      { role: "admin_sgg", module: "egop", permission: "admin" },
      { role: "admin_sgg", module: "jo", permission: "admin" },
      // Directeur SGG
      { role: "directeur_sgg", module: "gar", permission: "approve" },
      { role: "directeur_sgg", module: "nominations", permission: "approve" },
      { role: "directeur_sgg", module: "legislatif", permission: "approve" },
      { role: "directeur_sgg", module: "egop", permission: "write" },
      { role: "directeur_sgg", module: "jo", permission: "read" },
      // SG Ministère
      { role: "sg_ministere", module: "gar", permission: "write" },
      { role: "sg_ministere", module: "nominations", permission: "write" },
      { role: "sg_ministere", module: "legislatif", permission: "write" },
      { role: "sg_ministere", module: "egop", permission: "read" },
      { role: "sg_ministere", module: "jo", permission: "read" },
      // SGPR
      { role: "sgpr", module: "gar", permission: "read" },
      { role: "sgpr", module: "nominations", permission: "approve" },
      { role: "sgpr", module: "legislatif", permission: "approve" },
      { role: "sgpr", module: "egop", permission: "read" },
      { role: "sgpr", module: "jo", permission: "read" },
      // DGJO
      { role: "dgjo", module: "jo", permission: "publish" },
      { role: "dgjo", module: "jo", permission: "write" },
      { role: "dgjo", module: "legislatif", permission: "read" },
      { role: "dgjo", module: "nominations", permission: "read" },
      // Citoyen
      { role: "citoyen", module: "jo", permission: "read" },
    ];

    for (const perm of permissions) {
      await ctx.db.insert("rolePermissions", perm);
    }

    // ── 4. Seed Admin user ────────────────────────────────────
    const adminId = await ctx.db.insert("users", {
      email: "admin@sgg.ga",
      passwordHash: "$2b$10$placeholder_hash_change_me", // Use bcrypt in production
      fullName: "Administrateur SGG",
      isActive: true,
      isVerified: true,
      totpEnabled: false,
      loginCount: 0,
      failedLoginCount: 0,
    });

    await ctx.db.insert("userRoles", {
      userId: adminId,
      role: "admin_sgg",
      isPrimary: true,
      grantedAt: Date.now(),
    });

    return {
      seeded: true,
      message: "Seeded 8 priorités, 29 institutions, 25 permissions, 1 admin user",
    };
  },
});
