import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "conseil" | "reunion" | "deadline";
}

const events: Event[] = [
  {
    id: 1,
    title: "Conseil des Ministres",
    date: "15 Fév 2026",
    time: "10:00",
    location: "Palais de la Présidence",
    type: "conseil",
  },
  {
    id: 2,
    title: "Conseil Interministériel - Budget",
    date: "18 Fév 2026",
    time: "09:00",
    location: "SGG - Salle A",
    type: "reunion",
  },
  {
    id: 3,
    title: "Date limite Reporting GAR",
    date: "28 Fév 2026",
    time: "23:59",
    location: "Tous ministères",
    type: "deadline",
  },
  {
    id: 4,
    title: "RIM - Projet Infrastructures",
    date: "05 Mar 2026",
    time: "14:30",
    location: "Min. Travaux Publics",
    type: "reunion",
  },
];

const typeConfig = {
  conseil: {
    label: "Conseil",
    className: "bg-government-gold/10 text-government-gold border-government-gold/20",
  },
  reunion: {
    label: "Réunion",
    className: "bg-government-navy/10 text-government-navy border-government-navy/20",
  },
  deadline: {
    label: "Échéance",
    className: "bg-status-danger/10 text-status-danger border-status-danger/20",
  },
};

export function UpcomingEvents() {
  return (
    <Card className="shadow-gov">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Événements à venir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => {
            const config = typeConfig[event.type];

            return (
              <div
                key={event.id}
                className={cn(
                  "group relative rounded-lg border p-4 transition-all duration-200 hover:shadow-md hover:border-government-gold/30",
                  index === 0 && "bg-government-gold/5 border-government-gold/20"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={config.className}>
                        {config.label}
                      </Badge>
                      {index === 0 && (
                        <Badge className="bg-government-gold text-government-navy">
                          Prochain
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-government-navy">{event.date}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
