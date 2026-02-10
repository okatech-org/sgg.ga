/**
 * SGG Digital — Centre Météorologique National
 *
 * Données météorologiques et climatiques :
 *   - Conditions actuelles par province
 *   - Saisons et pluviométrie
 *   - Alertes météo
 *   - Changement climatique
 */

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CloudRain, Thermometer, Wind, Droplets,
    Sun, CloudSun, Cloud, AlertTriangle,
    MapPin, TrendingUp, Waves,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type Weather = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rain' | 'heavy-rain' | 'storm';

interface CityWeather {
    city: string;
    province: string;
    temp: number;
    humidity: number;
    wind: number;
    weather: Weather;
    rainfall24h: number; // mm
}

interface MonthlyClimate {
    month: string;
    avgTemp: number;
    rainfall: number; // mm
    season: string;
}

interface WeatherAlert {
    title: string;
    zone: string;
    level: 'yellow' | 'orange' | 'red';
    type: string;
    validUntil: string;
}

// ── Config ──────────────────────────────────────────────────────────────────

const WEATHER_CFG: Record<Weather, { label: string; icon: typeof Sun }> = {
    'sunny': { label: 'Ensoleillé', icon: Sun },
    'partly-cloudy': { label: 'Partiellement nuageux', icon: CloudSun },
    'cloudy': { label: 'Nuageux', icon: Cloud },
    'rain': { label: 'Pluie', icon: CloudRain },
    'heavy-rain': { label: 'Fortes pluies', icon: CloudRain },
    'storm': { label: 'Orage', icon: AlertTriangle },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const CURRENT: CityWeather[] = [
    { city: 'Libreville', province: 'Estuaire', temp: 29, humidity: 85, wind: 12, weather: 'partly-cloudy', rainfall24h: 8 },
    { city: 'Port-Gentil', province: 'Ogooué-Maritime', temp: 28, humidity: 88, wind: 18, weather: 'rain', rainfall24h: 25 },
    { city: 'Franceville', province: 'Haut-Ogooué', temp: 26, humidity: 72, wind: 8, weather: 'sunny', rainfall24h: 0 },
    { city: 'Oyem', province: 'Woleu-Ntem', temp: 27, humidity: 80, wind: 10, weather: 'cloudy', rainfall24h: 5 },
    { city: 'Lambaréné', province: 'Moyen-Ogooué', temp: 28, humidity: 90, wind: 6, weather: 'heavy-rain', rainfall24h: 42 },
    { city: 'Mouila', province: 'Ngounié', temp: 25, humidity: 78, wind: 9, weather: 'partly-cloudy', rainfall24h: 3 },
    { city: 'Makokou', province: 'Ogooué-Ivindo', temp: 26, humidity: 82, wind: 7, weather: 'rain', rainfall24h: 18 },
    { city: 'Koulamoutou', province: 'Ogooué-Lolo', temp: 25, humidity: 75, wind: 5, weather: 'cloudy', rainfall24h: 2 },
    { city: 'Tchibanga', province: 'Nyanga', temp: 24, humidity: 76, wind: 14, weather: 'sunny', rainfall24h: 0 },
];

const MONTHLY_CLIMATE: MonthlyClimate[] = [
    { month: 'Jan', avgTemp: 27, rainfall: 250, season: 'Petite saison sèche' },
    { month: 'Fév', avgTemp: 27, rainfall: 280, season: 'Petite saison sèche' },
    { month: 'Mar', avgTemp: 28, rainfall: 320, season: 'Grande saison des pluies' },
    { month: 'Avr', avgTemp: 27, rainfall: 340, season: 'Grande saison des pluies' },
    { month: 'Mai', avgTemp: 27, rainfall: 280, season: 'Grande saison des pluies' },
    { month: 'Jun', avgTemp: 25, rainfall: 30, season: 'Grande saison sèche' },
    { month: 'Jul', avgTemp: 24, rainfall: 5, season: 'Grande saison sèche' },
    { month: 'Aoû', avgTemp: 24, rainfall: 10, season: 'Grande saison sèche' },
    { month: 'Sep', avgTemp: 25, rainfall: 80, season: 'Grande saison sèche' },
    { month: 'Oct', avgTemp: 26, rainfall: 320, season: 'Petite saison des pluies' },
    { month: 'Nov', avgTemp: 26, rainfall: 350, season: 'Petite saison des pluies' },
    { month: 'Déc', avgTemp: 27, rainfall: 280, season: 'Petite saison des pluies' },
];

const ALERTS: WeatherAlert[] = [
    { title: 'Pluies torrentielles — Lambaréné', zone: 'Moyen-Ogooué', level: 'orange', type: 'Pluie', validUntil: '11 fév 18h' },
    { title: 'Risque d\'inondation — basse Ogooué', zone: 'Estuaire / Moyen-Ogooué', level: 'red', type: 'Inondation', validUntil: '12 fév 06h' },
    { title: 'Houle dangereuse — côte maritime', zone: 'Ogooué-Maritime', level: 'yellow', type: 'Houle', validUntil: '11 fév 12h' },
    { title: 'Vents forts — zone nord', zone: 'Woleu-Ntem', level: 'yellow', type: 'Vent', validUntil: '10 fév 20h' },
];

const ALERT_CFG = {
    yellow: { label: 'Jaune', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    orange: { label: 'Orange', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    red: { label: 'Rouge', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

// ── Component ───────────────────────────────────────────────────────────────

export default function MeteorologyCenterPage() {
    const [view, setView] = useState<'current' | 'climate' | 'alerts'>('current');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <CloudRain className="h-7 w-7 text-sky-600" />
                            Centre Météorologique National
                        </h1>
                        <p className="text-muted-foreground">
                            9 stations · Saison actuelle : Petite saison sèche · {ALERTS.length} alertes actives
                        </p>
                    </div>
                    <Badge variant="outline" className="text-xs">DGM · Climat équatorial</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Thermometer className="h-5 w-5 text-orange-500" />
                            <div><p className="text-lg font-bold text-orange-600">27°C</p><p className="text-[10px] text-muted-foreground">Moy. nationale</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <Droplets className="h-5 w-5 text-blue-500" />
                            <div><p className="text-lg font-bold text-blue-600">82%</p><p className="text-[10px] text-muted-foreground">Humidité moy.</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-cyan-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <CloudRain className="h-5 w-5 text-cyan-500" />
                            <div><p className="text-lg font-bold text-cyan-600">2 545mm</p><p className="text-[10px] text-muted-foreground">Pluviométrie/an</p></div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="pt-3 pb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div><p className="text-lg font-bold text-red-600">{ALERTS.filter(a => a.level === 'red').length}</p><p className="text-[10px] text-muted-foreground">Alerte rouge</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-1">
                    <Button variant={view === 'current' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('current')}>Temps réel</Button>
                    <Button variant={view === 'climate' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('climate')}>Climatologie</Button>
                    <Button variant={view === 'alerts' ? 'default' : 'outline'} size="sm" className="text-xs h-7" onClick={() => setView('alerts')}>Alertes ({ALERTS.length})</Button>
                </div>

                {view === 'current' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {CURRENT.map((c, i) => {
                            const wcfg = WEATHER_CFG[c.weather];
                            const WIcon = wcfg.icon;
                            return (
                                <Card key={i} className={c.rainfall24h > 30 ? 'border-l-4 border-l-blue-500' : ''}>
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="text-xs font-bold">{c.city}</p>
                                                <p className="text-[9px] text-muted-foreground">{c.province}</p>
                                            </div>
                                            <WIcon className="h-6 w-6 text-sky-500" />
                                        </div>
                                        <p className="text-2xl font-bold text-center mb-1">{c.temp}°C</p>
                                        <p className="text-[9px] text-center text-muted-foreground mb-2">{wcfg.label}</p>
                                        <div className="flex justify-between text-[9px]">
                                            <span className="flex items-center gap-0.5"><Droplets className="h-2.5 w-2.5 text-blue-400" />{c.humidity}%</span>
                                            <span className="flex items-center gap-0.5"><Wind className="h-2.5 w-2.5 text-gray-400" />{c.wind} km/h</span>
                                            <span className="flex items-center gap-0.5"><CloudRain className="h-2.5 w-2.5 text-cyan-400" />{c.rainfall24h}mm</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {view === 'climate' && (
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Pluviométrie mensuelle — Libreville</CardTitle></CardHeader>
                        <CardContent className="space-y-1">
                            {MONTHLY_CLIMATE.map((m, i) => {
                                const maxRainfall = 350;
                                return (
                                    <div key={i} className="flex items-center gap-2 text-[10px]">
                                        <span className="w-8 font-bold shrink-0">{m.month}</span>
                                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${m.rainfall > 200 ? 'bg-blue-500' : m.rainfall > 50 ? 'bg-cyan-400' : 'bg-amber-300'}`} style={{ width: `${(m.rainfall / maxRainfall) * 100}%` }} />
                                        </div>
                                        <span className="w-14 text-right text-[9px] font-mono shrink-0">{m.rainfall}mm</span>
                                        <span className="w-8 text-center shrink-0">{m.avgTemp}°</span>
                                        <Badge variant="outline" className="text-[6px] h-3 shrink-0">{m.season.split(' ').slice(-1)[0]}</Badge>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {view === 'alerts' && (
                    <div className="space-y-2">
                        {ALERTS.map((a, i) => {
                            const acfg = ALERT_CFG[a.level];
                            return (
                                <Card key={i} className={`border-l-4 ${a.level === 'red' ? 'border-l-red-500' : a.level === 'orange' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
                                    <CardContent className="p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                                            <AlertTriangle className={`h-4 w-4 ${a.level === 'red' ? 'text-red-500' : a.level === 'orange' ? 'text-orange-500' : 'text-yellow-500'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <Badge className={`text-[7px] h-3.5 ${acfg.badge}`}>⚠️ {acfg.label}</Badge>
                                                <Badge variant="outline" className="text-[7px] h-3">{a.type}</Badge>
                                            </div>
                                            <p className="text-xs font-bold">{a.title}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                                                <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{a.zone}</span>
                                                <span>Valide jusqu'au {a.validUntil}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
