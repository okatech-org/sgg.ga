import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NominationsHeader } from "@/components/nominations/NominationsHeader";
import { NominationsList } from "@/components/nominations/NominationsList";
import { NominationDetails } from "@/components/nominations/NominationDetails";
import { NewNominationDialog } from "@/components/nominations/NewNominationDialog";
import { useDemoUser } from "@/hooks/useDemoUser";

export type NominationStatus = 
  | "soumis" 
  | "recevabilite" 
  | "examen" 
  | "transmis_sgpr" 
  | "valide" 
  | "rejete" 
  | "publie";

export interface Nomination {
  id: string;
  candidat: {
    nom: string;
    prenom: string;
    dateNaissance: string;
    email: string;
  };
  poste: {
    titre: string;
    grade: string;
    ministere: string;
    direction: string;
  };
  soumission: {
    date: string;
    ministereOrigine: string;
    referenceDossier: string;
  };
  statut: NominationStatus;
  dateStatut: string;
  prochainConseil: string;
  joursRestants: number;
  documents: {
    cv: boolean;
    acteNaissance: boolean;
    diplomes: boolean;
    casierJudiciaire: boolean;
  };
  historique: {
    date: string;
    action: string;
    acteur: string;
    commentaire?: string;
  }[];
  evaluation?: {
    adequationProfil: number;
    experience: boolean;
    commentaires: string;
  };
}

// Mock data
const mockNominations: Nomination[] = [
  {
    id: "NOM-2026-001",
    candidat: {
      nom: "MBOUMBA",
      prenom: "Jean-Pierre",
      dateNaissance: "1975-03-15",
      email: "jp.mboumba@gouv.ga",
    },
    poste: {
      titre: "Directeur Général",
      grade: "Hors Échelle A",
      ministere: "Ministère de l'Économie",
      direction: "Direction Générale du Budget",
    },
    soumission: {
      date: "2026-01-15",
      ministereOrigine: "Ministère de l'Économie",
      referenceDossier: "ECO/DGB/2026/001",
    },
    statut: "examen",
    dateStatut: "2026-01-20",
    prochainConseil: "2026-02-15",
    joursRestants: 12,
    documents: {
      cv: true,
      acteNaissance: true,
      diplomes: true,
      casierJudiciaire: true,
    },
    historique: [
      { date: "2026-01-15", action: "Soumission", acteur: "SG Min. Économie", commentaire: "Dossier complet transmis" },
      { date: "2026-01-16", action: "Contrôle recevabilité", acteur: "Système", commentaire: "Validé automatiquement" },
      { date: "2026-01-20", action: "Début examen", acteur: "Dir. Nominations SGG" },
    ],
    evaluation: {
      adequationProfil: 85,
      experience: true,
      commentaires: "Profil senior avec 15 ans d'expérience dans les finances publiques. Parcours cohérent.",
    },
  },
  {
    id: "NOM-2026-002",
    candidat: {
      nom: "NDONG",
      prenom: "Marie-Claire",
      dateNaissance: "1980-07-22",
      email: "mc.ndong@gouv.ga",
    },
    poste: {
      titre: "Directeur Technique",
      grade: "Catégorie A1",
      ministere: "Ministère de la Santé",
      direction: "Direction des Hôpitaux",
    },
    soumission: {
      date: "2026-01-18",
      ministereOrigine: "Ministère de la Santé",
      referenceDossier: "SAN/DH/2026/003",
    },
    statut: "recevabilite",
    dateStatut: "2026-01-18",
    prochainConseil: "2026-02-15",
    joursRestants: 12,
    documents: {
      cv: true,
      acteNaissance: true,
      diplomes: false,
      casierJudiciaire: true,
    },
    historique: [
      { date: "2026-01-18", action: "Soumission", acteur: "SG Min. Santé" },
      { date: "2026-01-18", action: "Contrôle recevabilité", acteur: "Système", commentaire: "En attente - Diplômes manquants" },
    ],
  },
  {
    id: "NOM-2026-003",
    candidat: {
      nom: "OBAME",
      prenom: "François",
      dateNaissance: "1968-11-08",
      email: "f.obame@gouv.ga",
    },
    poste: {
      titre: "Secrétaire Général",
      grade: "Hors Échelle B",
      ministere: "Ministère de l'Éducation",
      direction: "Cabinet",
    },
    soumission: {
      date: "2026-01-10",
      ministereOrigine: "Ministère de l'Éducation",
      referenceDossier: "EDU/CAB/2026/001",
    },
    statut: "transmis_sgpr",
    dateStatut: "2026-01-28",
    prochainConseil: "2026-02-15",
    joursRestants: 12,
    documents: {
      cv: true,
      acteNaissance: true,
      diplomes: true,
      casierJudiciaire: true,
    },
    historique: [
      { date: "2026-01-10", action: "Soumission", acteur: "SG Min. Éducation" },
      { date: "2026-01-11", action: "Contrôle recevabilité", acteur: "Système", commentaire: "Validé" },
      { date: "2026-01-15", action: "Examen terminé", acteur: "Dir. Nominations SGG", commentaire: "Avis favorable" },
      { date: "2026-01-28", action: "Transmission SGPR", acteur: "SG du Gouvernement" },
    ],
    evaluation: {
      adequationProfil: 92,
      experience: true,
      commentaires: "Excellent profil. 20 ans d'expérience dans l'éducation nationale. Recommandé.",
    },
  },
  {
    id: "NOM-2026-004",
    candidat: {
      nom: "ELLA",
      prenom: "Sylvie",
      dateNaissance: "1982-05-30",
      email: "s.ella@gouv.ga",
    },
    poste: {
      titre: "Inspecteur Général",
      grade: "Catégorie A2",
      ministere: "Ministère des Finances",
      direction: "Inspection Générale des Finances",
    },
    soumission: {
      date: "2026-01-05",
      ministereOrigine: "Ministère des Finances",
      referenceDossier: "FIN/IGF/2026/002",
    },
    statut: "valide",
    dateStatut: "2026-02-01",
    prochainConseil: "2026-02-15",
    joursRestants: 12,
    documents: {
      cv: true,
      acteNaissance: true,
      diplomes: true,
      casierJudiciaire: true,
    },
    historique: [
      { date: "2026-01-05", action: "Soumission", acteur: "SG Min. Finances" },
      { date: "2026-01-06", action: "Contrôle recevabilité", acteur: "Système", commentaire: "Validé" },
      { date: "2026-01-12", action: "Examen terminé", acteur: "Dir. Nominations SGG", commentaire: "Avis favorable" },
      { date: "2026-01-20", action: "Transmission SGPR", acteur: "SG du Gouvernement" },
      { date: "2026-02-01", action: "Validation Conseil", acteur: "Conseil des Ministres" },
    ],
    evaluation: {
      adequationProfil: 95,
      experience: true,
      commentaires: "Profil d'excellence. Formation ENA, parcours exemplaire.",
    },
  },
  {
    id: "NOM-2026-005",
    candidat: {
      nom: "MOUSSAVOU",
      prenom: "Patrick",
      dateNaissance: "1990-09-12",
      email: "p.moussavou@gouv.ga",
    },
    poste: {
      titre: "Chef de Service",
      grade: "Catégorie B1",
      ministere: "Ministère de l'Intérieur",
      direction: "Direction de la Décentralisation",
    },
    soumission: {
      date: "2026-01-25",
      ministereOrigine: "Ministère de l'Intérieur",
      referenceDossier: "INT/DD/2026/008",
    },
    statut: "rejete",
    dateStatut: "2026-01-30",
    prochainConseil: "2026-02-15",
    joursRestants: 12,
    documents: {
      cv: true,
      acteNaissance: true,
      diplomes: true,
      casierJudiciaire: false,
    },
    historique: [
      { date: "2026-01-25", action: "Soumission", acteur: "SG Min. Intérieur" },
      { date: "2026-01-26", action: "Contrôle recevabilité", acteur: "Système", commentaire: "En attente - Casier manquant" },
      { date: "2026-01-30", action: "Rejet", acteur: "Dir. Nominations SGG", commentaire: "Dossier incomplet après relance J+5. Expérience insuffisante (3 ans requis: 10 pour ce poste)." },
    ],
  },
];

export default function Nominations() {
  const [nominations] = useState<Nomination[]>(mockNominations);
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { demoUser } = useDemoUser();

  // Determine user capabilities based on role
  const canSubmit = !demoUser || ["ministre", "sg-ministere", "sgg-admin"].includes(demoUser.id);
  const canReview = !demoUser || ["sgg-admin", "sgg-directeur", "sgpr"].includes(demoUser.id);
  const canValidate = !demoUser || ["sgg-admin", "sgpr", "president", "vice-president"].includes(demoUser.id);

  const filteredNominations = statusFilter === "all" 
    ? nominations 
    : nominations.filter((n) => n.statut === statusFilter);

  const stats = {
    total: nominations.length,
    enCours: nominations.filter((n) => ["soumis", "recevabilite", "examen"].includes(n.statut)).length,
    transmis: nominations.filter((n) => n.statut === "transmis_sgpr").length,
    valides: nominations.filter((n) => n.statut === "valide").length,
    rejetes: nominations.filter((n) => n.statut === "rejete").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <NominationsHeader 
          stats={stats}
          canSubmit={canSubmit}
          onNewNomination={() => setIsNewDialogOpen(true)}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <NominationsList
              nominations={filteredNominations}
              selectedId={selectedNomination?.id}
              onSelect={setSelectedNomination}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
          
          <div className="lg:col-span-1">
            {selectedNomination ? (
              <NominationDetails 
                nomination={selectedNomination}
                canReview={canReview}
                canValidate={canValidate}
              />
            ) : (
              <div className="rounded-lg border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  Sélectionnez une nomination pour voir les détails
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewNominationDialog 
        open={isNewDialogOpen} 
        onOpenChange={setIsNewDialogOpen}
      />
    </DashboardLayout>
  );
}
