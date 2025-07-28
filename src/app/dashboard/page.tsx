'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { app } from '@/lib/firebase';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    scriptsAtivos: 0,
    subcontasAutorizadas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const db = getFirestore(app);
        
        // Buscar total de scripts
        const scriptsSnapshot = await getDocs(collection(db, 'scripts'));
        const scriptsAtivos = scriptsSnapshot.size;

        // Buscar total de subcontas autorizadas
        const subcontasSnapshot = await getDocs(collection(db, 'subcontas'));
        const subcontasAutorizadas = subcontasSnapshot.size;
        
        setStats({
          scriptsAtivos,
          subcontasAutorizadas,
        });
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scripts Ativos</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-2xl font-bold">{stats.scriptsAtivos}</div>
          )}
          <p className="text-xs text-muted-foreground">Total de scripts cadastrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Subcontas Autorizadas
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-1/2" />
          ) : (
            <div className="text-2xl font-bold">{stats.subcontasAutorizadas}</div>
          )}
          <p className="text-xs text-muted-foreground">
            Total de subcontas com acesso
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
