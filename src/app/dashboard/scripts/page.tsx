'use client';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Script {
  id: string;
  nome: string;
  descricao: string;
  versao: string;
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScripts = async () => {
      setLoading(true);
      try {
        const db = getFirestore(app);
        const scriptsCollection = collection(db, 'scripts');
        const scriptsSnapshot = await getDocs(scriptsCollection);
        const scriptsList = scriptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Script[];
        setScripts(scriptsList);
      } catch (error) {
        console.error('Erro ao buscar scripts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Gerenciamento de Scripts</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Script
          </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Scripts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="hidden sm:table-cell">Versão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                       <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                       <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : scripts.length > 0 ? (
                scripts.map(script => (
                  <TableRow key={script.id}>
                    <TableCell className="font-medium">{script.nome}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{script.descricao}</TableCell>
                    <TableCell className="hidden sm:table-cell">{script.versao}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum script encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
