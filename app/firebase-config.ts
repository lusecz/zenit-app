import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, User, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';

// Variáveis globais fornecidas pelo ambiente (necessárias para Firestore)
declare const __app_id: string | undefined;
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

let app: any;
let db: any;
let auth: any;
let appId: string;

// Função de inicialização e autenticação
export const initFirebase = async (): Promise<{ db: any, auth: any, user: User | null }> => {
  try {
    const firebaseConfig = __firebase_config ? JSON.parse(__firebase_config) : {};
    appId = typeof __app_id !== 'undefined' ? __app_id : 'default-zenit-app';

    if (!app) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);

      // Lógica de Autenticação
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        // Tenta logar com o token fornecido (autenticação real)
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        // Login anônimo como fallback, se não houver token
        await signInAnonymously(auth);
      }
    }

    return new Promise(resolve => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Para de escutar após o primeiro estado
            resolve({ db, auth, user });
        });
    });

  } catch (error) {
    console.error("Erro ao inicializar Firebase ou autenticar:", error);
    // Retorna instâncias básicas mesmo se falhar
    return { db: null, auth: null, user: null };
  }
};

// Obter a coleção de usuários
export const getUsersCollection = () => {
    if (!db || !appId) {
        throw new Error("Firebase não inicializado.");
    }
    // Salvamos os dados do usuário em /artifacts/{appId}/users/{userId}/profiles
    const userId = auth.currentUser?.uid || 'anonymous';
    // Para autenticação, usaremos a coleção de perfis dentro do ID do usuário autenticado.
    return collection(db, `artifacts/${appId}/users/${userId}/profiles`);
};

// Obter o documento do usuário logado (para salvar o perfil)
export const getCurrentUserProfileRef = (uid: string) => {
    if (!db || !appId) {
        throw new Error("Firebase não inicializado.");
    }
    // Salvamos perfis em /artifacts/{appId}/users/{uid}/profiles/userProfile
    return doc(db, `artifacts/${appId}/users/${uid}/profiles/userProfile`);
};

// Função para verificar se um CPF já existe na coleção pública (simulação de unicidade)
// Em um sistema real, essa verificação seria feita no backend para garantir segurança.
export const checkCpfExists = async (cpf: string): Promise<User | null> => {
    // Para o login, usaremos o CPF como chave para o Firestore.
    // O Firebase Auth não suporta CPF nativamente, então simularemos a busca por um usuário no Firestore.
    
    // ATENÇÃO: PARA UM PROJETO DE FACULDADE COM O FIREBASE SIMPLIFICADO:
    // Não podemos buscar usuários pelo CPF de forma eficiente.
    // Vamos confiar apenas na autenticação padrão (e-mail/senha, ou neste caso, token anônimo).
    
    // Para simplificar, esta função apenas retornará null. A autenticação real será feita
    // no passo de Login, onde as credenciais serão verificadas (que é o próximo passo).
    return null;
};
