import { type NextRequest } from 'next/server';

// Este é o ID da sua conta de agência/desenvolvimento. É usado para ativar o widget de IA.
const ADMIN_SUBACCOUNT_ID = 'q0DpTdHQceFBme8mKQdO';

function SCRIPT_CONTENT(appBaseUrl: string) {
  // A função `getSubaccountId` é definida aqui dentro para garantir que ela exista no escopo do navegador
  const getSubaccountId = () => {
    console.log('GHL Script Manager: Tentando obter o ID da subconta...');
    try {
        const urlPath = window.location.pathname;
        const urlMatch = urlPath.match(/location\/([a-zA-Z0-9]+)/);
        if (urlMatch && urlMatch[1]) {
            console.log('GHL Script Manager: ID da subconta encontrado na URL:', urlMatch[1]);
            return urlMatch[1];
        }
        
        // Fallback para window.locationId se existir
        if (window.locationId) {
            console.log('GHL Script Manager: ID encontrado em window.locationId:', window.locationId);
            return window.locationId;
        }

        console.log('GHL Script Manager: Não foi possível encontrar o locationId na URL ou em window.locationId.');
        return null;
    } catch (e) {
        console.error('GHL Script Manager: Erro ao obter ID da subconta.', e);
        return null;
    }
  };

  return `
(function() {
    'use strict';

    // --- CONFIGURAÇÃO ---
    const ADMIN_ACCOUNT_ID = '${ADMIN_SUBACCOUNT_ID}';
    const APP_BASE_URL = '${appBaseUrl}';
    // ------------------

    let currentSubaccountId = null;
    let isAdminMode = false;
    let aiWidget = null;
    let aiWidgetIframe = null;
    let widgetButton = null;

    // A função é injetada aqui como uma string e depois convertida para função real.
    const getSubaccountId = ${getSubaccountId.toString()};
    
    function showActiveBanner() {
        if (document.getElementById('ghl-script-active-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'ghl-script-active-banner';
        banner.style.position = 'fixed';
        banner.style.top = '10px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.padding = '10px 20px';
        banner.style.backgroundColor = '#28a745';
        banner.style.color = 'white';
        banner.style.borderRadius = '8px';
        banner.style.zIndex = '10000';
        banner.style.fontSize = '14px';
        banner.style.fontFamily = 'Arial, sans-serif';
        banner.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        banner.style.display = 'flex';
        banner.style.alignItems = 'center';
        banner.style.gap = '15px';
        banner.innerHTML = '<span>GHL Script Manager: Ativo</span>';

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.lineHeight = '1';
        closeButton.onclick = () => banner.remove();

        banner.appendChild(closeButton);
        document.body.appendChild(banner);
    }

    async function fetchAndRunScripts(subaccountId) {
      console.log('GHL Script Manager: Verificando autorização e buscando scripts para a subconta:', subaccountId);
      
      try {
        const response = await fetch(\`\${APP_BASE_URL}/api/scripts?subaccountId=\${subaccountId}\`);
        if (!response.ok) {
           console.log(\`GHL Script Manager: Falha ao buscar scripts. Status: \${response.status}\`);
           return;
        }
        const scriptsToRun = await response.json();
        
        if (scriptsToRun.length === 0) {
            console.log('GHL Script Manager: Subconta não autorizada ou nenhum script disponível.');
            return;
        }

        console.log(\`GHL Script Manager: \${scriptsToRun.length} script(s) recebido(s). Injetando no documento...\`);

        scriptsToRun.forEach(script => {
          try {
            console.log(\`GHL Script Manager: Injetando script '\${script.nome}' (Versão: \${script.versao})\`);
            const scriptElement = document.createElement('script');
            scriptElement.type = 'text/javascript';
            scriptElement.textContent = script.conteudo;
            document.body.appendChild(scriptElement);
            console.log(\`GHL Script Manager: Script '\${script.nome}' injetado com sucesso.\`);
          } catch (e) {
            console.error(\`GHL Script Manager: Erro ao injetar o script '\${script.nome}':\`, e);
          }
        });

      } catch (error) {
        console.error('GHL Script Manager: Erro no processo de busca e execução de scripts:', error);
      }
    }

    function init() {
        console.log('GHL Script Manager: Inicializando...');
        currentSubaccountId = getSubaccountId();
        
        if (!currentSubaccountId) {
            console.log('GHL Script Manager: ID da subconta não encontrado. Tentando novamente em 2 segundos...');
            setTimeout(init, 2000);
            return;
        }

        console.log('GHL Script Manager: ID da Subconta Detectado:', currentSubaccountId);
        showActiveBanner();
        
        isAdminMode = (currentSubaccountId === ADMIN_ACCOUNT_ID);

        if (isAdminMode) {
            console.log('GHL Script Manager: Modo Administrador ATIVADO.');
            injectAdminWidget();
        } else {
            console.log('GHL Script Manager: Modo Cliente. Verificando autorização...');
            fetchAndRunScripts(currentSubaccountId);
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
        // A verificação de origem é importante para segurança
        if (event.origin !== new URL(APP_BASE_URL).origin) return;

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
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                scriptElement.textContent = script;
                document.body.appendChild(scriptElement);
                console.log('GHL Script Manager: Script de teste executado com sucesso.');
            } catch(e) {
                console.error('GHL Script Manager: Erro ao executar script de teste:', e);
            }
        }
    }

    // Aguarda o corpo do documento estar pronto para iniciar o script
    const observer = new MutationObserver((mutationsList, observer) => {
        if (document.body) {
            init();
            observer.disconnect();
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
`;
}

export async function GET(request: NextRequest) {
  // Constrói a URL base dinamicamente a partir dos cabeçalhos da requisição
  const url = request.nextUrl;
  const host = request.headers.get('host') || url.host;
  const protocol = host.startsWith('localhost') ? 'http:' : 'https:';
  const appBaseUrl = `${protocol}//${host}`;

  const scriptBody = SCRIPT_CONTENT(appBaseUrl);

  return new Response(scriptBody, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
