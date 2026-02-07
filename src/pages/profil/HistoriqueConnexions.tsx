/**
 * SGG Digital — Historique des Connexions
 * Page d'historique de connexion avec tableau paginé, filtres et export CSV.
 */

import { useLoginHistory } from "@/hooks/useLoginHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Globe,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

function isMobileDevice(device: string): boolean {
  const mobile = device.toLowerCase();
  return (
    mobile.includes("iphone") ||
    mobile.includes("ipad") ||
    mobile.includes("android") ||
    mobile.includes("mobile") ||
    mobile.includes("smartphone") ||
    mobile.includes("tablet")
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoriqueConnexions() {
  const {
    history,
    totalPages,
    currentPage,
    setCurrentPage,
    filterPeriod,
    setFilterPeriod,
    stats,
    exportCsv,
  } = useLoginHistory();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-government-navy">
          <Clock className="h-6 w-6 text-government-gold" />
          Historique des connexions
        </h1>
        <p className="text-muted-foreground mt-1">
          Consultez l'ensemble de vos connexions et tentatives d'accès
        </p>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium">
          <Globe className="h-3.5 w-3.5 mr-1.5" />
          Total : {stats.total}
        </Badge>
        <Badge
          variant="outline"
          className="px-3 py-1.5 text-sm font-medium border-green-300 text-green-700 bg-green-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Succes : {stats.success}
        </Badge>
        <Badge
          variant="outline"
          className="px-3 py-1.5 text-sm font-medium border-red-300 text-red-700 bg-red-50"
        >
          <XCircle className="h-3.5 w-3.5 mr-1.5" />
          Echecs : {stats.failed}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select
                value={filterPeriod}
                onValueChange={(value: "7d" | "30d" | "90d" | "all") =>
                  setFilterPeriod(value)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 derniers jours</SelectItem>
                  <SelectItem value="30d">30 derniers jours</SelectItem>
                  <SelectItem value="90d">90 derniers jours</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Aucune connexion trouvée pour cette période.</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date / Heure</TableHead>
                      <TableHead>Adresse IP</TableHead>
                      <TableHead>Navigateur</TableHead>
                      <TableHead>Appareil</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead className="text-right">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry, index) => (
                      <TableRow
                        key={entry.id}
                        className={cn(
                          index % 2 === 0 ? "bg-white" : "bg-muted/30"
                        )}
                      >
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium">
                            {formatDate(entry.date)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(entry.date)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entry.ipAddress}
                        </TableCell>
                        <TableCell>{entry.browser}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isMobileDevice(entry.device) ? (
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{entry.device}</span>
                          </div>
                        </TableCell>
                        <TableCell>{entry.location || "-"}</TableCell>
                        <TableCell className="text-right">
                          {entry.success ? (
                            <Badge
                              variant="outline"
                              className="border-green-300 text-green-700 bg-green-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              Succes
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-red-300 text-red-700 bg-red-50"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Echec
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
