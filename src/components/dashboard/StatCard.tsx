import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: "success" | "warning" | "danger" | "info";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status,
  className,
}: StatCardProps) {
  const statusColors = {
    success: "bg-status-success/10 text-status-success border-status-success/20",
    warning: "bg-status-warning/10 text-status-warning border-status-warning/20",
    danger: "bg-status-danger/10 text-status-danger border-status-danger/20",
    info: "bg-status-info/10 text-status-info border-status-info/20",
  };

  const iconBgColors = {
    success: "bg-status-success",
    warning: "bg-status-warning",
    danger: "bg-status-danger",
    info: "bg-status-info",
  };

  return (
    <Card className={cn("stat-card overflow-hidden transition-all duration-300 hover:shadow-gov-lg", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight animate-count">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trend.isPositive ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            status ? iconBgColors[status] : "bg-government-navy"
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
