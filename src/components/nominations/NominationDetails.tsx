import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  User, 
  Briefcase, 
  Calendar,
  Send,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Nomination, NominationStatus } from "@/pages/Nominations";

interface NominationDetailsProps {
  nomination: Nomination;
  canReview: boolean;
  canValidate: boolean;
}

const statusConfig: Record<NominationStatus, { label: string; color: string }> = {
  soumis: { label: "Soumis", color: "bg-muted text-muted-foreground" },
  recevabilite: { label: "Contrôle Recevabilité", color: "bg-status-warning text-white" },
  examen: { label: "Examen SGG", color: "bg-status-info text-white" },
  transmis_sgpr: { label: "Transmis SGPR", color: "bg-government-navy text-white" },
  valide: { label: "Validé en Conseil", color: "bg-status-success text-white" },
  rejete: { label: "Rejeté", color: "bg-status-danger text-white" },
  publie: { label: "Publié au JO", color: "bg-government-gold text-government-navy" },
};

export function NominationDetails({ nomination, canReview, canValidate }: NominationDetailsProps) {
  const status = statusConfig[nomination.statut];
  const isComplete = Object.values(nomination.documents).every(Boolean);
  const documentCount = Object.values(nomination.documents).filter(Boolean).length;
  const totalDocs = Object.keys(nomination.documents).length;

  const isActionable = ["recevabilite", "examen"].includes(nomination.statut);
  const canTransmit = nomination.statut === "examen" && canReview;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Détails du Dossier</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{nomination.id}</p>
          </div>
          <Badge className={cn("text-xs", status.color)}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-6 pr-4">
            {/* Candidat */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="h-3 w-3" />
                Candidat
              </h4>
              <div className="space-y-2">
                <p className="font-medium">
                  {nomination.candidat.prenom} {nomination.candidat.nom}
                </p>
                <p className="text-sm text-muted-foreground">
                  Né(e) le {new Date(nomination.candidat.dateNaissance).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {nomination.candidat.email}
                </p>
              </div>
            </div>

            <Separator />

            {/* Poste */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Briefcase className="h-3 w-3" />
                Poste Proposé
              </h4>
              <div className="space-y-2">
                <p className="font-medium">{nomination.poste.titre}</p>
                <p className="text-sm text-muted-foreground">{nomination.poste.direction}</p>
                <p className="text-sm text-muted-foreground">{nomination.poste.ministere}</p>
                <Badge variant="outline" className="text-xs">
                  {nomination.poste.grade}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Documents */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Documents ({documentCount}/{totalDocs})
              </h4>
              <div className="space-y-2">
                <Progress value={(documentCount / totalDocs) * 100} className="h-2" />
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {Object.entries(nomination.documents).map(([key, value]) => (
                    <div 
                      key={key}
                      className={cn(
                        "flex items-center gap-2 text-xs p-2 rounded",
                        value ? "bg-status-success/10" : "bg-status-danger/10"
                      )}
                    >
                      {value ? (
                        <CheckCircle2 className="h-3 w-3 text-status-success" />
                      ) : (
                        <XCircle className="h-3 w-3 text-status-danger" />
                      )}
                      <span className={value ? "text-foreground" : "text-status-danger"}>
                        {key === "cv" && "CV"}
                        {key === "acteNaissance" && "Acte naissance"}
                        {key === "diplomes" && "Diplômes"}
                        {key === "casierJudiciaire" && "Casier"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Évaluation */}
            {nomination.evaluation && (
              <>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Évaluation SGG
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Adéquation profil/poste</span>
                        <span className="font-medium">{nomination.evaluation.adequationProfil}%</span>
                      </div>
                      <Progress value={nomination.evaluation.adequationProfil} className="h-2" />
                    </div>
                    <div className="flex items-center gap-2">
                      {nomination.evaluation.experience ? (
                        <CheckCircle2 className="h-4 w-4 text-status-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-status-danger" />
                      )}
                      <span className="text-sm">
                        Expérience requise (10 ans min.)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {nomination.evaluation.commentaires}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Délais */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Délais
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Prochain Conseil</span>
                  <span className="font-medium">
                    {new Date(nomination.prochainConseil).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Jours restants</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      nomination.joursRestants <= 7 && "border-status-danger text-status-danger"
                    )}
                  >
                    J-{nomination.joursRestants}
                  </Badge>
                </div>
                {nomination.joursRestants <= 7 && (
                  <div className="flex items-center gap-2 text-xs text-status-danger bg-status-danger/10 p-2 rounded">
                    <AlertTriangle className="h-3 w-3" />
                    Délai critique — Transmission SGPR requise
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Historique */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Historique
              </h4>
              <div className="space-y-3">
                {nomination.historique.map((event, index) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-government-navy" />
                      {index < nomination.historique.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs">{event.action}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(event.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{event.acteur}</p>
                      {event.commentaire && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          "{event.commentaire}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        {isActionable && canReview && (
          <div className="pt-4 border-t space-y-2">
            {canTransmit && (
              <Button variant="government" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Transmettre au SGPR
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-status-danger border-status-danger hover:bg-status-danger/10">
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </Button>
              <Button variant="success" className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Valider
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
