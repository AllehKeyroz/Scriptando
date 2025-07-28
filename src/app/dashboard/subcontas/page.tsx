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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Subconta {
  id: string;
  nome: string;
  id_subconta: string;
}

const EMPTY_SUBCONTA: Omit<Subconta, 'id'> = {
  nome: '',
  id_subconta: '',
};

export default function SubcontasPage() {
  const [subcontas, setSubcontas] = useState<Subconta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentSubconta, setCurrentSubconta] = useState<Partial<Subconta>>(EMPTY_SUBCONTA);
  const [subcontaToDelete, setSubcontaToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubcontas = async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);
      const subcontasCollection = collection(db, 'subcontas');
      const subcontasSnapshot = await getDocs(subcontasCollection);
      const subcontasList = subcontasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Subconta[];
      setSubcontas(subcontasList);
    } catch (error) {
      console.error('Erro ao buscar subcontas:', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao buscar subcontas',
        description: 'Não foi possível carregar as subcontas do Firestore.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcontas();
  }, []);

  const handleOpenDialog = (subconta: Partial<Subconta> | null = null) => {
    setCurrentSubconta(subconta ? { ...subconta } : { ...EMPTY_SUBCONTA });
    setIsDialogOpen(true);
  };

  const handleSaveSubconta = async () => {
    if (!currentSubconta.nome || !currentSubconta.id_subconta) {
       toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Nome e ID da Subconta são obrigatórios.',
      });
      return;
    }

    try {
      const db = getFirestore(app);
      if (currentSubconta.id) {
        // Edit
        const subcontaRef = doc(db, 'subcontas', currentSubconta.id);
        const { id, ...subcontaData } = currentSubconta;
        await updateDoc(subcontaRef, subcontaData);
        toast({ title: 'Sucesso!', description: 'Subconta atualizada com sucesso.' });
      } else {
        // Create
        await addDoc(collection(db, 'subcontas'), currentSubconta);
        toast({ title: 'Sucesso!', description: 'Subconta criada com sucesso.' });
      }
      setIsDialogOpen(false);
      fetchSubcontas(); // Refresh list
    } catch (error) {
       console.error('Erro ao salvar subconta:', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a subconta.',
      });
    }
  };

  const openDeleteConfirm = (id: string) => {
    setSubcontaToDelete(id);
    setIsAlertOpen(true);
  };
  
  const handleDeleteSubconta = async () => {
    if (!subcontaToDelete) return;
    try {
       const db = getFirestore(app);
       await deleteDoc(doc(db, 'subcontas', subcontaToDelete));
       toast({ title: 'Sucesso!', description: 'Subconta excluída com sucesso.' });
       fetchSubcontas(); // Refresh list
    } catch (error) {
       console.error('Erro ao excluir subconta:', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a subconta.',
      });
    } finally {
       setIsAlertOpen(false);
       setSubcontaToDelete(null);
    }
  };


  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Gerenciamento de Subcontas</h1>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Subconta
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Subcontas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>ID da Subconta</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-48" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : subcontas.length > 0 ? (
                  subcontas.map(subconta => (
                    <TableRow key={subconta.id}>
                      <TableCell className="font-medium">{subconta.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{subconta.id_subconta}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(subconta)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteConfirm(subconta.id)} className="text-destructive focus:text-destructive">
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Nenhuma subconta encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Criar/Editar Subconta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentSubconta.id ? 'Editar Subconta' : 'Adicionar Nova Subconta'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da subconta que terá acesso aos scripts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={currentSubconta.nome || ''}
                onChange={(e) => setCurrentSubconta({ ...currentSubconta, nome: e.target.value })}
                className="col-span-3"
                placeholder="Ex: Agência XYZ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id_subconta" className="text-right">
                ID da Subconta
              </Label>
              <Input
                id="id_subconta"
                value={currentSubconta.id_subconta || ''}
                onChange={(e) => setCurrentSubconta({ ...currentSubconta, id_subconta: e.target.value })}
                className="col-span-3"
                placeholder="ID fornecido pelo Go High Level"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSubconta}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog para Confirmar Exclusão */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a subconta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubconta} className="bg-destructive hover:bg-destructive/90">
                Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
