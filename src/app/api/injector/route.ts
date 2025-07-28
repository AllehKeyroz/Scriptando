
const ADMIN_SUBACCOUNT_ID = 'q0DpTdHQceFBme8mKQdO';
// A variável de ambiente é lida no servidor, não precisa ser NEXT_PUBLIC_
const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

const SCRIPT_CONTENT = `
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
            if (window.locationId) {
                return window.locationId;
            }
            
            // Tenta encontrar o ID na classe do body, que é o padrão do GHL
            const bodyClass = document.body.className;
            const match = bodyClass.match(/location-([a-zA-Z0-9]+)/);
            if (match && match[1]) {
                return match[1];
            }
            
            // Fallback: Tenta encontrar em algum script no DOM que contenha o locationId
            const scripts = Array.from(document.scripts);
            for (const script of scripts) {
                if (script.textContent) {
                    const scriptMatch = script.textContent.match(/"locationId":\\s*"([a-zA-Z0-9]+)"/);
                    if (scriptMatch && scriptMatch[1]) {
                        return scriptMatch[1];
                    }
                }
            }

            return null;
        } catch (e) {
            console.error('GHL Script Manager: Erro ao obter ID da subconta.', e);
            return null;
        }
    }

    function init() {
        console.log('GHL Script Manager: Inicializando...');
        currentSubaccountId = getSubaccountId();
        
        if (!currentSubaccountId) {
            console.log('GHL Script Manager: ID da subconta não encontrado. Tentando novamente em 2 segundos...');
            setTimeout(init, 2000); // Tenta novamente pois GHL pode carregar dados depois
            return;
        }

        console.log('GHL Script Manager: ID da Subconta Detectado:', currentSubaccountId);
        
        isAdminMode = (currentSubaccountId === ADMIN_ACCOUNT_ID);

        if (isAdminMode) {
            console.log('GHL Script Manager: Modo Administrador ATIVADO.');
            injectAdminWidget();
        } else {
            console.log('GHL Script Manager: Modo Padrão. Carregando scripts para subcontas autorizadas...');
            // Futuramente, aqui será carregado o script para subcontas normais
        }
    }

    function injectAdminWidget() {
        if (document.getElementById('ghl-ai-widget-container')) return;
        
        console.log('GHL Script Manager: Injetando Widget de IA do Administrador...');

        const styles = document.createElement('style');
        styles.innerHTML = \`
            #ghl-ai-widget-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9998;
                background-color: #1a1a1a;
                color: #fafafa;
                border: 1px solid #2e2e2e;
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
                display: none;
                flex-direction: column;
                background-color: #09090b;
                border: 1px solid #2e2e2e;
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
        
        widgetButton = document.createElement('div');
        widgetButton.id = 'ghl-ai-widget-button';
        widgetButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>';

        aiWidget = document.createElement('div');
        aiWidget.id = 'ghl-ai-widget-container';
        aiWidgetIframe = document.createElement('iframe');
        aiWidgetIframe.id = 'ghl-ai-widget-iframe';
        aiWidgetIframe.src = APP_BASE_URL + '/dashboard/gerador-ia';
        aiWidget.appendChild(aiWidgetIframe);

        document.body.appendChild(widgetButton);
        document.body.appendChild(aiWidget);

        widgetButton.addEventListener('click', toggleWidget);
        window.addEventListener('message', handleMessagesFromApp);
        
        console.log('GHL Script Manager: Widget de IA injetado com sucesso.');
    }
    
    function toggleWidget() {
        aiWidget.classList.toggle('open');
    }

    function handleMessagesFromApp(event) {
        if (event.origin !== APP_BASE_URL) return;

        const { type, script } = event.data;
        
        console.log('GHL Script Manager: Mensagem recebida do Widget', event.data);

        if (type === 'REQUEST_GHL_DOM') {
            const domContent = document.documentElement.outerHTML;
            if (aiWidgetIframe.contentWindow) {
                 console.log('GHL Script Manager: Enviando DOM para o Widget.');
                aiWidgetIframe.contentWindow.postMessage({ type: 'GHL_DOM_CONTENT', dom: domContent }, APP_BASE_URL);
            }
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

    if (document.body) {
        init();
    } else {
        const observer = new MutationObserver((mutationsList, observer) => {
            if (document.body) {
                init();
                observer.disconnect();
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

})();
`;

export async function GET() {
  return new Response(SCRIPT_CONTENT, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
