'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, Clipboard, Bot } from 'lucide-react';
import Link from 'next/link';

const ADMIN_SUBACCOUNT_ID = 'q0DpTdHQceFBme8mKQdO';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'; // Use uma variável de ambiente ou um valor padrão

const SCRIPT_TEMPLATE = `
(function() {
    'use strict';

    // --- CONFIGURAÇÃO ---
    const ADMIN_ACCOUNT_ID = '${ADMIN_SUBACCOUNT_ID}';
    const APP_BASE_URL = '${APP_URL}';
    // ------------------

    let currentSubaccountId = null;
    let isAdminMode = false;
    let aiWidget = null;
    let aiWidgetIframe = null;
    let widgetButton = null;

    function getSubaccountId() {
        try {
            const bodyClass = document.body.className;
            const match = bodyClass.match(/location-([a-zA-Z0-9]+)/);
            return match ? match[1] : null;
        } catch (e) {
            console.error('GHL Script Manager: Erro ao obter ID da subconta.', e);
            return null;
        }
    }

    function init() {
        console.log('GHL Script Manager: Inicializando...');
        currentSubaccountId = getSubaccountId();
        
        if (!currentSubaccountId) {
            console.log('GHL Script Manager: ID da subconta não encontrado. Encerrando.');
            return;
        }

        console.log('GHL Script Manager: ID da Subconta Detectado:', currentSubaccountId);
        
        isAdminMode = (currentSubaccountId === ADMIN_ACCOUNT_ID);

        if (isAdminMode) {
            console.log('GHL Script Manager: Modo Administrador ATIVADO.');
            injectAdminWidget();
        } else {
            console.log('GHL Script Manager: Modo Padrão.');
            // Futuramente, aqui será carregado o script para subcontas normais
        }
    }

    function injectAdminWidget() {
        if (document.getElementById('ghl-ai-widget-container')) return;

        // Estilos
        const styles = document.createElement('style');
        styles.innerHTML = \`
            #ghl-ai-widget-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9998;
                background-color: hsl(var(--primary));
                color: hsl(var(--primary-foreground));
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                cursor: pointer;
                transition: transform 0.2s ease-out;
            }
            #ghl-ai-widget-button:hover {
                transform: scale(1.1);
            }
            #ghl-ai-widget-container {
                position: fixed;
                bottom: 100px;
                right: 20px;
                z-index: 9999;
                width: 400px;
                height: 600px;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                display: none; /* Começa escondido */
                flex-direction: column;
                background-color: white;
            }
            #ghl-ai-widget-container.open {
                display: flex;
            }
            #ghl-ai-widget-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
        \`;
        document.head.appendChild(styles);
        
        // Botão do Widget
        widgetButton = document.createElement('div');
        widgetButton.id = 'ghl-ai-widget-button';
        widgetButton.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>\`;

        // Container do Iframe
        aiWidget = document.createElement('div');
        aiWidget.id = 'ghl-ai-widget-container';
        aiWidgetIframe = document.createElement('iframe');
        aiWidgetIframe.id = 'ghl-ai-widget-iframe';
        aiWidgetIframe.src = APP_BASE_URL + '/dashboard/gerador-ia';
        aiWidget.appendChild(aiWidgetIframe);

        document.body.appendChild(widgetButton);
        document.body.appendChild(aiWidget);

        // Eventos
        widgetButton.addEventListener('click', toggleWidget);
        window.addEventListener('message', handleMessagesFromApp);
    }
    
    function toggleWidget() {
        aiWidget.classList.toggle('open');
    }

    function handleMessagesFromApp(event) {
        // Segurança: verificar a origem
        if (event.origin !== APP_BASE_URL) return;

        const { type, script } = event.data;

        if (type === 'REQUEST_GHL_DOM') {
            const domContent = document.documentElement.outerHTML;
            aiWidgetIframe.contentWindow.postMessage({ type: 'GHL_DOM_CONTENT', dom: domContent }, APP_BASE_URL);
        } else if (type === 'EXECUTE_SCRIPT') {
            try {
                console.log('GHL Script Manager: Executando script de teste...');
                new Function(script)();
                console.log('GHL Script Manager: Script de teste executado com sucesso.');
            } catch(e) {
                console.error('GHL Script Manager: Erro ao executar script de teste:', e);
            }
        }
    }

    // Usar MutationObserver para garantir que a função init seja chamada quando o body for carregado.
    const observer = new MutationObserver((mutationsList, observer) => {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if(document.body && !document.body.className.includes('n-focused')) {
                   // A classe do body mudou, podemos tentar inicializar.
                   init();
                   observer.disconnect(); // Parar de observar após a inicialização.
                   break;
                }
            }
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
`;

export default function InjetorPage() {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SCRIPT_TEMPLATE.trim());
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
                                Cole este código no campo "Custom JavaScript" nas configurações da sua conta de agência no GHL.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Este script é responsável por duas coisas:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><span className="font-semibold">Modo Administrador:</span> Na subconta com ID <code className="bg-muted px-1 py-0.5 rounded">{ADMIN_SUBACCOUNT_ID}</code>, ele ativará um widget de IA para criar e testar scripts em tempo real.</li>
                            <li><span className="font-semibold">Execução Padrão:</span> Em todas as outras subcontas autorizadas, ele carregará e executará os scripts que você salvou no painel (funcionalidade a ser implementada).</li>
                        </ul>
                    </p>
                    <Textarea
                        readOnly
                        value={SCRIPT_TEMPLATE.trim()}
                        className="font-mono h-80 text-xs bg-muted/50"
                    />
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
                        <CardTitle className="text-amber-900 dark:text-amber-200">Próximos Passos</CardTitle>
                        <CardDescription className="text-amber-800 dark:text-amber-300">
                           Após instalar o script, navegue até a subconta de admin para testar o Gerador de IA.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}

