import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const subaccountId = searchParams.get('subaccountId');

  if (!subaccountId) {
    return NextResponse.json({ error: 'subaccountId é obrigatório' }, { status: 400 });
  }

  try {
    // 1. Verificar se a subconta está autorizada
    const subcontasRef = collection(db, 'subcontas');
    const q = query(subcontasRef, where('id_subconta', '==', subaccountId));
    const subcontasSnapshot = await getDocs(q);

    if (subcontasSnapshot.empty) {
      console.log(`Tentativa de acesso negada para subconta não autorizada: ${subaccountId}`);
      // Retorna 200 OK com um array vazio para não gerar erros no lado do cliente.
      return NextResponse.json([], { status: 200 });
    }
    
    console.log(`Subconta autorizada: ${subaccountId}. Buscando scripts...`);
    
    // 2. Se estiver autorizada, buscar todos os scripts disponíveis
    const scriptsRef = collection(db, 'scripts');
    const scriptsSnapshot = await getDocs(scriptsRef);
    
    const scripts = scriptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(scripts, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar scripts ou verificar autorização:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
