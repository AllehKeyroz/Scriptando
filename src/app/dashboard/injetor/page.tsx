'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, Clipboard, Bot, Syringe, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function InjetorPage() {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [scriptLoader, setScriptLoader] = useState('<script src="..." async defer></script>');
    
    // Determina a URL base da aplicação no lado do cliente para garantir que o snippet esteja correto.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const appBaseUrl = window.location.origin;
            setScriptLoader(`<script src="${appBaseUrl}/api/injector" async defer></script>`);
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptLoader);
        setCopied(true);
        toast({
            title: 'Copiado!',
            description: 'O script foi copiado para a área de transferência.',
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Syringe className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Script de Injeção Universal</CardTitle>
                            <CardDescription>
                                Cole este único comando no campo "Custom JavaScript" nas configurações da sua conta de agência no GHL.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 text-sm text-muted-foreground space-y-2">
                        <p>
                           Este comando carrega de forma segura a última versão do nosso script gerenciador. Ele é responsável por:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><span className="font-semibold">Modo Administrador:</span> Ativa o widget de criação por IA na subconta de desenvolvimento.</li>
                            <li><span className="font-semibold">Execução Padrão:</span> Carrega os scripts corretos para as subcontas de clientes autorizadas.</li>
                        </ul>
                         <p className="pt-2 font-medium text-foreground">
                           Todo o código-fonte fica em nosso servidor, garantindo segurança e permitindo atualizações sem que você precise alterar nada no GHL.
                        </p>
                    </div>
                    <pre className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
                        <code>{scriptLoader}</code>
                    </pre>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleCopy}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                        {copied ? 'Copiado!' : 'Copiar Script'}
                    </Button>
                </CardFooter>
            </Card>
            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Bot className="h-6 w-6 text-amber-600 dark:text-amber-400"/>
                    <div >
                        <CardTitle className="text-amber-900 dark:text-amber-200">Como Depurar (Debug)</CardTitle>
                        <CardDescription className="text-amber-800 dark:text-amber-300">
                           Após instalar o script, abra o console do desenvolvedor do navegador (F12) na página do GHL. Você verá mensagens do "GHL Script Manager" indicando o que ele está fazendo.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
