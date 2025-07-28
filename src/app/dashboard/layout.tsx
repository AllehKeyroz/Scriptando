'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Bot, Code, Home, Settings, Users, Syringe, AlertTriangle } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getTitle = () => {
    switch (pathname) {
      case '/dashboard':
        return 'Painel';
      case '/dashboard/scripts':
        return 'Scripts';
      case '/dashboard/subcontas':
        return 'Subcontas';
      case '/dashboard/gerador-ia':
        return 'Gerador IA';
      case '/dashboard/injetor':
        return 'Script de Injeção';
      case '/dashboard/configuracoes':
        return 'Configurações';
      default:
        return 'Painel';
    }
  };


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Gerenciador GHL</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/dashboard">
                  <SidebarMenuButton tooltip="Painel" isActive={pathname === '/dashboard'}>
                    <Home />
                    Painel
                  </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/scripts">
                <SidebarMenuButton tooltip="Scripts" isActive={pathname === '/dashboard/scripts'}>
                  <Code />
                  Scripts
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <Link href="/dashboard/subcontas">
                <SidebarMenuButton tooltip="Subcontas" isActive={pathname === '/dashboard/subcontas'}>
                  <Users />
                  Subcontas
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <Link href="/dashboard/gerador-ia">
                <SidebarMenuButton tooltip="Gerador IA" isActive={pathname.startsWith('/dashboard/gerador-ia')}>
                  <Bot />
                  Gerador IA
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
               <Link href="/dashboard/injetor">
                <SidebarMenuButton tooltip="Injetor" isActive={pathname === '/dashboard/injetor'}>
                  <Syringe />
                  Injetor
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
               <Link href="#">
                <SidebarMenuButton tooltip="Configurações">
                  <Settings />
                  Configurações
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <SidebarTrigger />
          <h1 className="flex-1 text-lg font-semibold">{getTitle()}</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
