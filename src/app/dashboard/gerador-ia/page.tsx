'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateScript, GenerateScriptInput, GenerateScriptOutput } from '@/ai/flows/generate-script-flow';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Bot, Code, Save, Sparkles, Loader2, Play, User, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  script?: string;
}

export default function GeradorIAPage() {
  const { toast } = useToast();
  const [domContent, setDomContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [scriptToSave, setScriptToSave] = useState('');
  const [scriptDetails, setScriptDetails] = useState({ nome: '', descricao: '', versao: '1.0.0' });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Efeito para pegar o DOM da página pai quando em um iframe
  useEffect(() => {
    // Escuta mensagens da página pai (GHL)
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'GHL_DOM_CONTENT') {
        setDomContent(event.data.dom);
        toast({ title: 'Contexto da página carregado!' });

         // Mensagem inicial do bot
        setMessages([{
          id: 'initial-bot-message',
          sender: 'bot',
          text: 'Olá! Sou seu assistente de IA. O contexto da página foi carregado. O que você gostaria de criar ou automatizar hoje?'
        }]);
      }
    };
    window.addEventListener('message', handleMessage);

    // Pede o DOM para a página pai
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'REQUEST_GHL_DOM' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [toast]);
  
  // Efeito para rolar para a ultima mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { id: `user-${Date.now()}`, sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!domContent) {
        throw new Error("O conteúdo do DOM da página GHL não foi carregado. Certifique-se de que o script está sendo executado corretamente na página principal.");
      }
      
      const aiInput: GenerateScriptInput = { dom: domContent, command: input };
      const result = await generateScript(aiInput);

      const botMessage: Message = { id: `bot-${Date.now()}`, sender: 'bot', script: result.script };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error: any) {
      const errorMessage: Message = { id: `bot-error-${Date.now()}`, sender: 'bot', text: `Ocorreu um erro: ${error.message}` };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        variant: 'destructive',
        title: 'Erro na Geração',
        description: error.message || 'Não foi possível gerar o script.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteScript = (script: string) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'EXECUTE_SCRIPT', script: script }, '*');
       toast({
        title: 'Executando script...',
        description: 'O script foi enviado para a página para teste.',
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Não é possível executar',
        description: 'A execução só funciona quando esta página é aberta a partir do GHL.',
      });
    }
  };
  
  const handleOpenSaveDialog = (script: string) => {
    setScriptToSave(script);
    setScriptDetails({ nome: '', descricao: '', versao: '1.0.0' });
    setIsSaveDialogOpen(true);
  };

  const handleSaveScript = async () => {
     if (!scriptDetails.nome) {
       toast({ variant: 'destructive', title: 'Nome do script é obrigatório' });
       return;
     }
     try {
        const db = getFirestore(app);
        await addDoc(collection(db, 'scripts'), {
            ...scriptDetails,
            conteudo: scriptToSave
        });
        toast({ title: 'Sucesso!', description: 'Script salvo permanentemente.' });
        setIsSaveDialogOpen(false);
        setScriptToSave('');
     } catch(error) {
        toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar o script.' });
     }
  };


  return (
    <>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-muted/20 rounded-lg border">
          <Card className="flex-grow flex flex-col h-full">
            <CardContent className="flex-grow p-4 h-0">
               <ScrollArea className="h-full" ref={scrollAreaRef}>
                 <div className="space-y-4 pr-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                        {message.sender === 'bot' && <AvatarIcon className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarIcon>}
                        <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                          {message.text && <p className="text-sm">{message.text}</p>}
                          {message.script && (
                             <div className="space-y-2">
                                <p className="text-sm">Aqui está o script que eu gerei para você. Você pode executá-lo para testar em tempo real.</p>
                                <pre className="bg-muted/50 p-2 rounded-md text-xs overflow-x-auto">
                                    <code>{message.script}</code>
                                </pre>
                                <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" onClick={() => handleExecuteScript(message.script!)}><Play className="mr-2 h-4 w-4"/>Executar</Button>
                                    <Button size="sm" onClick={() => handleOpenSaveDialog(message.script!)}><Save className="mr-2 h-4 w-4"/>Salvar</Button>
                                </div>
                             </div>
                          )}
                        </div>
                         {message.sender === 'user' && <AvatarIcon className="bg-secondary-foreground text-secondary"><User className="h-5 w-5"/></AvatarIcon>}
                      </div>
                    ))}
                    {isLoading && (
                       <div className="flex items-start gap-3">
                            <AvatarIcon className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarIcon>
                            <div className="rounded-lg px-4 py-3 bg-background">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                       </div>
                    )}
                 </div>
               </ScrollArea>
            </CardContent>
            <div className="p-4 border-t">
              <div className="relative">
                  <Textarea
                    placeholder="Digite seu comando aqui... Ex: Crie um botão ao lado do nome do contato..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                    className="pr-16"
                    rows={2}
                    disabled={isLoading || !domContent}
                  />
                  <Button type="submit" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={handleSendMessage} disabled={isLoading || !input.trim() || !domContent}>
                    <Sparkles className="h-4 w-4" />
                    <span className="sr-only">Gerar</span>
                  </Button>
              </div>
               {!domContent && (
                  <p className="text-xs text-muted-foreground mt-2">Aguardando contexto da página do Go High Level. Se esta mensagem persistir, verifique se o script de injeção está instalado corretamente.</p>
                )}
            </div>
          </Card>
      </div>

     {/* Dialog para Salvar Script */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Salvar Script Gerado</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para salvar o script permanentemente.
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

function AvatarIcon({className, children}: {className?: string, children: React.ReactNode}) {
    return (
        <div className={`rounded-full w-8 h-8 flex items-center justify-center ${className}`}>
            {children}
        </div>
    )
}

    
