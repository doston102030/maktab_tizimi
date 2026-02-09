import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { bellService, type BellConfig } from '@/services/bellService';
import type { AppState, DayId, Lesson, Language } from '@/types';
import toast from 'react-hot-toast';
import { Wifi, Bell, Clock, UploadCloud, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { i18n } from '@/lib/i18n';

interface DeviceSettingsProps {
    appState: AppState;
    selectedDay: DayId;
    language: Language;
}

export function DeviceSettings({ appState, selectedDay, language }: DeviceSettingsProps) {
    const t = i18n[language];
    const [ip, setIp] = useState('192.168.4.1');
    const [useProxy, setUseProxy] = useState(false);
    const [bellDuration, setBellDuration] = useState('5');
    const [testDuration, setTestDuration] = useState('5');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected');

    const handleConnect = async () => {
        setLoading(true);
        const baseUrl = useProxy ? '' : `http://${ip}`;
        bellService.setBaseUrl(baseUrl);
        try {
            const time = await bellService.getTime();
            if (time) {
                setStatus('connected');
                toast.success(t.connected);
            }
        } catch (error) {
            setStatus('disconnected');
            toast.error("Qurilma topilmadi");
        } finally {
            setLoading(false);
        }
    };

    const handleTestBell = async () => {
        const duration = parseInt(testDuration) || 5;
        try {
            await bellService.testBell(duration);
            toast.success(`Bell signal yuborildi (${duration}s)`);
        } catch (e) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleSyncTime = async () => {
        try {
            await bellService.syncTime();
            toast.success("Vaqt sinxronlandi");
        } catch (e) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleSyncSchedule = async () => {
        if (!appState.schedule[selectedDay]) {
            toast.error("Bu kun uchun jadval topilmadi");
            return;
        }

        const daySchedule = appState.schedule[selectedDay];
        const s1 = daySchedule.shifts['1'].lessons;
        const s2 = daySchedule.shifts['2'].lessons;

        const getTimes = (lessons: Lesson[]) => {
            const times: string[] = [];
            lessons.forEach(l => {
                if (l.isActive === false) return; // Skip inactive lessons
                if (l.startTime) times.push(l.startTime);
                if (l.endTime) times.push(l.endTime);
            });
            return Array.from(new Set(times)).sort();
        };

        const activeDaysBool = [false, false, false, false, false, false, false];
        const dayMap: Record<string, number> = {
            'Dushanba': 0, 'Seshanba': 1, 'Chorshanba': 2,
            'Payshanba': 3, 'Juma': 4, 'Shanba': 5
        };

        Object.values(appState.schedule).forEach(d => {
            if (d.isActive && dayMap[d.dayId as string] !== undefined) {
                activeDaysBool[dayMap[d.dayId as string]] = true;
            }
        });

        const config: BellConfig = {
            bellDurationSec: parseInt(bellDuration) || 5,
            activeDays: activeDaysBool,
            shift1: {
                start: s1.length > 0 ? s1[0].startTime : "08:00",
                end: s1.length > 0 ? s1[s1.length - 1].endTime : "12:00",
                times: getTimes(s1)
            },
            shift2: {
                start: s2.length > 0 ? s2[0].startTime : "13:00",
                end: s2.length > 0 ? s2[s2.length - 1].endTime : "17:00",
                times: getTimes(s2)
            },
            customTimes: [],
            holidays: []
        };

        try {
            await bellService.saveConfig(config);
            toast.success("Jadval qurilmaga yuklandi");
        } catch (e) {
            toast.error("Yuklashda xatolik");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-background/50 border shadow-sm", status === 'connected' ? "text-green-600" : "text-destructive")}>
                        <Wifi size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">{t.deviceSettings}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Status:</span>
                            <span className={cn("font-medium flex items-center gap-1.5", status === 'connected' ? "text-green-600" : "text-destructive")}>
                                {status === 'connected' ? (
                                    <><CheckCircle2 size={14} /> {t.connected}</>
                                ) : (
                                    <><XCircle size={14} /> {t.disconnected}</>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end bg-background/40 p-4 rounded-xl border border-dashed">
                <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">IP Manzil</label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUseProxy(!useProxy)}
                            className={cn("h-5 text-[10px] px-2", useProxy ? "text-green-600 bg-green-500/10" : "text-muted-foreground")}
                        >
                            {useProxy ? "Proxy: YONIQ" : "Proxy: O'CHIQ"}
                        </Button>
                    </div>
                    <div className="relative">
                        <Input
                            value={ip}
                            onChange={e => setIp(e.target.value)}
                            placeholder="192.168.4.1"
                            disabled={useProxy}
                            className={cn("pl-9 font-mono bg-background/80 focus-visible:ring-offset-0", useProxy && "opacity-50")}
                        />
                        <Wifi className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
                <Button
                    onClick={handleConnect}
                    disabled={loading}
                    className={cn("w-full sm:w-auto min-w-[100px]", status === 'connected' ? "bg-green-600 hover:bg-green-700 text-white" : "")}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (status === 'connected' ? t.connected : t.connect)}
                </Button>
            </div>

            {!useProxy && status === 'disconnected' && (
                <div className="text-[11px] text-muted-foreground text-center -mt-4 bg-muted/40 p-2 rounded-lg">
                    Agarda ulanmasa, yuqoridagi <b>Proxy</b> ni yoqib ko'ring
                </div>
            )}

            {/* Duration Settings */}
            <div className="bg-blue-500/10 border-blue-500/20 border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400">Qo'ng'iroq Davomiyligi</h4>
                        <p className="text-xs text-muted-foreground">Jadval uchun signal vaqti</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                        type="number"
                        min="1"
                        max="60"
                        value={bellDuration}
                        onChange={(e) => setBellDuration(e.target.value)}
                        className="w-20 bg-background/50 border-blue-500/30 focus-visible:ring-blue-500"
                        placeholder="Sekund"
                    />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">sekund</span>
                </div>
            </div>

            {/* Manual Test Card - Always Visible */}
            <div className="bg-orange-500/10 border-orange-500/20 border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 text-orange-600 rounded-lg">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-orange-700 dark:text-orange-400">Sinov (Test)</h4>
                        <p className="text-xs text-muted-foreground">Qo'ng'iroqni tekshirish</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                        type="number"
                        min="1"
                        max="60"
                        value={testDuration}
                        onChange={(e) => setTestDuration(e.target.value)}
                        className="w-20 bg-background/50 border-orange-500/30 focus-visible:ring-orange-500"
                        placeholder="Sekund"
                    />
                    <Button
                        onClick={handleTestBell}
                        variant="outline"
                        className="flex-1 sm:flex-none border-orange-500/30 hover:bg-orange-500/20 hover:text-orange-700 dark:hover:text-orange-400"
                    >
                        <Bell className="mr-2 h-4 w-4" />
                        {t.testBell}
                    </Button>
                </div>
            </div>

            {/* Connected Actions */}
            {status === 'connected' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button onClick={handleSyncTime} variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-background/60 hover:bg-background border shadow-sm transition-all hover:-translate-y-0.5">
                        <Clock className="h-6 w-6 text-blue-500 mb-1" />
                        <span className="font-medium">{t.syncTime}</span>
                        <span className="text-xs text-muted-foreground font-normal">Browser vaqti bilan</span>
                    </Button>

                    <Button onClick={handleSyncSchedule} variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-background/60 hover:bg-background border shadow-sm transition-all hover:-translate-y-0.5">
                        <UploadCloud className="h-6 w-6 text-green-500 mb-1" />
                        <span className="font-medium">{t.uploadSchedule}</span>
                        <span className="text-xs text-muted-foreground font-normal">"{selectedDay}" kunini</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
