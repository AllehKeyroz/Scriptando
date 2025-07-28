'use client';
import { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Script {
  id: string;
  nome: string;
  descricao: string;
  versao: string;
  conteudo: string;
}

const EMPTY_SCRIPT: Omit<Script, 'id'> = {
  nome: '',
  descricao: '',
  versao: '1.0.0',
  conteudo: '',
};

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentScript, setCurrentScript] = useState<Partial<Script>>(EMPTY_SCRIPT);
  const [scriptToDelete, setScriptToDelete] = useState<string | null>(null);
  const { toast } = useToast();

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
       toast({
        variant: 'destructive',
        title: 'Erro ao buscar scripts',
        description: 'Não foi possível carregar os scripts do Firestore.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleOpenDialog = (script: Partial<Script> | null = null) => {
    setCurrentScript(script ? { ...script } : { ...EMPTY_SCRIPT });
    setIsDialogOpen(true);
  };

  const handleSaveScript = async () => {
    if (!currentScript.nome || !currentScript.conteudo) {
       toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Nome e Conteúdo do script são obrigatórios.',
      });
      return;
    }

    try {
      const db = getFirestore(app);
      if (currentScript.id) {
        // Edit
        const scriptRef = doc(db, 'scripts', currentScript.id);
        const { id, ...scriptData } = currentScript;
        await updateDoc(scriptRef, scriptData);
        toast({ title: 'Sucesso!', description: 'Script atualizado com sucesso.' });
      } else {
        // Create
        await addDoc(collection(db, 'scripts'), currentScript);
        toast({ title: 'Sucesso!', description: 'Script criado com sucesso.' });
      }
      setIsDialogOpen(false);
      fetchScripts(); // Refresh list
    } catch (error) {
       console.error('Erro ao salvar script:', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o script.',
      });
    }
  };

  const openDeleteConfirm = (id: string) => {
    setScriptToDelete(id);
    setIsAlertOpen(true);
  };
  
  const handleDeleteScript = async () => {
    if (!scriptToDelete) return;
    try {
       const db = getFirestore(app);
       await deleteDoc(doc(db, 'scripts', scriptToDelete));
       toast({ title: 'Sucesso!', description: 'Script excluído com sucesso.' });
       fetchScripts(); // Refresh list
    } catch (error) {
       console.error('Erro ao excluir script:', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o script.',
      });
    } finally {
       setIsAlertOpen(false);
       setScriptToDelete(null);
    }
  };


  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Gerenciamento de Scripts</h1>
          <Button onClick={() => handleOpenDialog()}>
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
                            <DropdownMenuItem onClick={() => handleOpenDialog(script)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteConfirm(script.id)} className="text-destructive focus:text-destructive">
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

      {/* Dialog para Criar/Editar Script */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{currentScript.id ? 'Editar Script' : 'Adicionar Novo Script'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do script. O conteúdo deve ser código JavaScript válido.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={currentScript.nome || ''}
                onChange={(e) => setCurrentScript({ ...currentScript, nome: e.target.value })}
                className="col-span-3"
                placeholder="Ex: Botão de Copiar Telefone"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="versao" className="text-right">
                Versão
              </Label>
              <Input
                id="versao"
                value={currentScript.versao || ''}
                onChange={(e) => setCurrentScript({ ...currentScript, versao: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 1.0.1"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <Textarea
                 id="descricao"
                 value={currentScript.descricao || ''}
                 onChange={(e) => setCurrentScript({ ...currentScript, descricao: e.target.value })}
                 className="col-span-3"
                 placeholder="Descreva o que este script faz."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="conteudo" className="text-right">
                Conteúdo
              </Label>
              <Textarea
                id="conteudo"
                value={currentScript.conteudo || ''}
                onChange={(e) => setCurrentScript({ ...currentScript, conteudo: e.target.value })}
                className="col-span-3 font-mono"
                placeholder="console.log('Olá, mundo!');"
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveScript}>Salvar Script</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog para Confirmar Exclusão */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o script
              do servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteScript} className="bg-destructive hover:bg-destructive/90">
                Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
