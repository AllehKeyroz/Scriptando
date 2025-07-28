'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateScript, GenerateScriptInput } from '@/ai/flows/generate-script-flow';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Bot, Save, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';


export default function GeradorIAPage() {
  const [domContent, setDomContent] = useState('');
  const [command, setCommand] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [scriptDetails, setScriptDetails] = useState({ nome: '', descricao: '', versao: '1.0.0' });
  const { toast } = useToast();

  const handleGenerateScript = async () => {
    if (!domContent || !command) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Por favor, forneça o HTML do DOM e o comando.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedScript('');
    
    try {
      const input: GenerateScriptInput = { dom: domContent, command };
      const result = await generateScript(input);
      setGeneratedScript(result.script);
      toast({
        title: 'Script gerado com sucesso!',
        description: 'Revise o script gerado e salve-o se estiver correto.',
      });
    } catch (error) {
      console.error('Erro ao gerar script:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Geração',
        description: 'Não foi possível gerar o script. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenSaveDialog = () => {
    if (!generatedScript) {
       toast({
        variant: 'destructive',
        title: 'Nenhum script para salvar',
        description: 'Gere um script antes de tentar salvar.',
      });
      return;
    }
     setScriptDetails({ nome: '', descricao: '', versao: '1.0.0' });
    setIsSaveDialogOpen(true);
  }

  const handleSaveScript = async () => {
    if (!scriptDetails.nome) {
       toast({
        variant: 'destructive',
        title: 'Nome do script é obrigatório',
      });
      return;
    }
    
    try {
        const db = getFirestore(app);
        await addDoc(collection(db, 'scripts'), {
            ...scriptDetails,
            conteudo: generatedScript
        });
        toast({ title: 'Sucesso!', description: 'Script salvo com sucesso.' });
        setIsSaveDialogOpen(false);
        setGeneratedScript('');
        setDomContent('');
        setCommand('');
    } catch (error) {
       console.error('Erro ao salvar script:', error);
       toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o script no Firestore.',
      });
    }
  };


  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <CardTitle>Gerador de Script com IA</CardTitle>
          </div>
          <CardDescription>
            Cole o HTML da página do Go High Level e descreva em linguagem natural o que você deseja criar ou modificar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
          <div className="grid flex-grow flex flex-col gap-1.5">
            <Label htmlFor="dom-content">1. Cole o HTML do DOM</Label>
            <Textarea
              id="dom-content"
              placeholder="Cole o HTML do elemento <body> da página do GHL aqui."
              value={domContent}
              onChange={(e) => setDomContent(e.target.value)}
              className="flex-grow font-mono text-xs"
              rows={15}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="command">2. Descreva sua necessidade</Label>
            <Textarea
              id="command"
              placeholder="Ex: Crie um botão ao lado do nome do contato que copia o telefone para a área de transferência."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleGenerateScript} disabled={isLoading}>
            {isLoading ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Gerar Script
          </Button>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Script Gerado</CardTitle>
          <CardDescription>
            Revise, teste e salve o script gerado pela IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
          <div className="grid flex-grow flex flex-col gap-1.5">
             <Label htmlFor="generated-script">Conteúdo do Script (JavaScript)</Label>
              <Textarea
                id="generated-script"
                placeholder="O código gerado aparecerá aqui..."
                value={generatedScript}
                readOnly
                className="flex-grow font-mono text-xs bg-muted/50"
                rows={20}
              />
          </div>
          <Button onClick={handleOpenSaveDialog} disabled={!generatedScript || isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Script
          </Button>
        </CardContent>
      </Card>
    </div>
    
     {/* Dialog para Salvar Script */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Salvar Novo Script</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para salvar o script gerado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={scriptDetails.nome}
                onChange={(e) => setScriptDetails({ ...scriptDetails, nome: e.target.value })}
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
                value={scriptDetails.versao}
                onChange={(e) => setScriptDetails({ ...scriptDetails, versao: e.target.value })}
                className="col-span-3"
                placeholder="Ex: 1.0.0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <Textarea
                 id="descricao"
                 value={scriptDetails.descricao}
                 onChange={(e) => setScriptDetails({ ...scriptDetails, descricao: e.target.value })}
                 className="col-span-3"
                 placeholder="Descreva o que este script faz."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveScript}>Salvar Script</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
