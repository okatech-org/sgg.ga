/**
 * SGG Digital — Graphique de comparaison inter-périodes
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComparaisonPeriodesProps {
  data: { nom: string; courant: number; precedent: number }[];
  className?: string;
}

export function ComparaisonPeriodes({ data, className }: ComparaisonPeriodesProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Comparaison Inter-Périodes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="nom" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              className="text-muted-foreground"
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, undefined]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                backgroundColor: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="courant"
              name="Mois courant"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="precedent"
              name="Mois précédent"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default ComparaisonPeriodes;
