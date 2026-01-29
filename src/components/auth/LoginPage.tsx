import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginPageProps {
    onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Hardcoded credentials as requested
        if (id === '1234' && password === '5678') {
            onLogin();
            toast.success("Xush kelibsiz!");
        } else {
            setError(true);
            toast.error("ID yoki parol noto'g'ri");
            // Shake effect logic could go here or just simple error state
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-lg border-muted/40">
                <CardHeader className="text-center space-y-2 pb-6 pt-8">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Tizimga Kirish</CardTitle>
                    <p className="text-muted-foreground text-sm">Maktab qo'ng'iroq tizimi</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ID raqam</label>
                            <Input
                                type="text"
                                placeholder="ID raqamini kiriting"
                                value={id}
                                onChange={(e) => { setId(e.target.value); setError(false); }}
                                className={error ? "border-destructive text-center text-lg tracking-widest" : "text-center text-lg tracking-widest"}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Parol</label>
                            <Input
                                type="password"
                                placeholder="Parolni kiriting"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                className={error ? "border-destructive text-center text-lg tracking-widest" : "text-center text-lg tracking-widest"}
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 text-base mt-2">
                            Kirish
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
