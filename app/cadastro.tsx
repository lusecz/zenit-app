import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ImageBackground, 
  Dimensions, 
  Platform,
  TextInput,
  Alert,
  // Importando os tipos
  ViewStyle, 
  TextStyle, 
  ImageStyle 
} from 'react-native';
import { useRouter } from 'expo-router'; 
import { initFirebase, getCurrentUserProfileRef } from './firebase-config'; // Importa a config
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Importa Auth
import { setDoc } from 'firebase/firestore'; // Importa Firestore


// --- CONSTANTES DE ESCALA RESPONSIVA ---
const { width } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;
const scaleW = width / DESIGN_WIDTH;
const scaleH = DESIGN_HEIGHT / 812;

const scaleSize = (size: number) => Math.round(size * Math.min(scaleW, scaleH));
const scaleFont = (size: number) => size * Math.min(scaleW, 1.15);

// Importe o asset do fundo (Ajuste o caminho se necessário)
const FundoAcademia = require('../assets/images/gym_background.jpg');


// --- TELA PRINCIPAL ---
export default function CadastroScreen() {
  const router = useRouter(); 
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState(''); // Campo adicional
  const [email, setEmail] = useState(''); // Requerido pelo Firebase Auth
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa o Firebase ao carregar o componente
  useEffect(() => {
    initFirebase();
  }, []);

  const handleCadastro = async () => {
      setErrorMessage('');
      setIsLoading(true);

      if (!name || !cpf || !email || !password || !confirmPassword) {
          setErrorMessage('Por favor, preencha todos os campos.');
          setIsLoading(false);
          return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
          setErrorMessage('As senhas não coincidem.');
          setIsLoading(false);
          return;
      }
      
      try {
        const authInstance = getAuth(); 

        // 1. CRIAÇÃO DO USUÁRIO NO FIREBASE AUTHENTICATION
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
        const user = userCredential.user;

        // 2. SALVAR O PERFIL COMPLETO (CPF e Nome) NO FIRESTORE
        if (user.uid) {
            const userRef = getCurrentUserProfileRef(user.uid);
            await setDoc(userRef, {
                uid: user.uid,
                name: name,
                cpf: cpf,
                email: email,
                registrationDate: new Date().toISOString(),
            });
            
            // 3. Atualiza o Nome de Exibição no Firebase Auth
            await updateProfile(user, { displayName: name });
        }

        Alert.alert("Sucesso!", "Cadastro realizado com sucesso. Você será redirecionado para a Home.");

        // 4. Redirecionamento após cadastro (Login automático)
        router.replace('/(tabs)/home'); 

      } catch (error: any) {
        console.error("Erro no cadastro:", error.message);
        
        let msg = "Ocorreu um erro. Verifique sua conexão ou tente mais tarde.";
        if (error.code === 'auth/email-already-in-use') {
            msg = "Este e-mail já está em uso. Tente fazer login.";
        } else if (error.code === 'auth/invalid-email') {
            msg = "O formato do e-mail é inválido.";
        }
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
  };

  const handleBack = () => {
      router.back();
  };

  return (
    <ImageBackground
      source={FundoAcademia}
      style={styles.background as ViewStyle}
      imageStyle={styles.bgImage as ImageStyle}
    >
      <StatusBar barStyle="light-content" translucent />
      
      <View style={styles.overlay}>
        
        {/* CABEÇALHO CUSTOMIZADO COM VOLTAR */}
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={scaleSize(24)} color="#E2E8F0" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Novo Cadastro</Text>
            <View style={styles.backButton} />
        </View> 

        {/* CONTEÚDO PRINCIPAL (COM SCROLL) */}
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollFlex} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainTitle}>Criar Conta</Text>

          {/* MENSAGEM DE ERRO */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Feather name="alert-triangle" size={scaleSize(18)} color="#FECACA" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* INPUTS DE CADASTRO */}
          <View style={styles.inputContainer}>
            
            {/* NOME COMPLETO */}
            <View style={styles.inputGroup}>
                <Ionicons name="person-outline" size={scaleSize(20)} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Nome Completo:"
                    placeholderTextColor="#94A3B8"
                    onChangeText={setName}
                    value={name}
                    editable={!isLoading}
                />
            </View>

            {/* E-MAIL */}
            <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={scaleSize(20)} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="E-mail:"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    value={email}
                    editable={!isLoading}
                />
            </View>

            {/* CPF */}
            <View style={styles.inputGroup}>
                <Ionicons name="arrow-forward-circle-outline" size={scaleSize(20)} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="CPF (apenas números):"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    onChangeText={setCpf}
                    value={cpf}
                    editable={!isLoading}
                />
            </View>

            {/* SENHA */}
            <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={scaleSize(20)} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Crie sua senha (mín. 6 caracteres):"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    onChangeText={setPassword}
                    value={password}
                    editable={!isLoading}
                />
            </View>
            
            {/* CONFIRMAR SENHA */}
            <View style={styles.inputGroup}>
                <Ionicons name="lock-open-outline" size={scaleSize(20)} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Confirme sua senha:"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    editable={!isLoading}
                />
            </View>

          </View>

          {/* BOTÃO DE AÇÃO */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleCadastro} disabled={isLoading}>
                <Text style={styles.primaryButtonText}>{isLoading ? 'CADASTRANDO...' : 'FINALIZAR CADASTRO'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* RODAPÉ FIXO (De Direitos Autorais) */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>
                © 2025 ZenitApp. Todos os direitos reservados.
            </Text>
        </View>

      </View>
    </ImageBackground>
  );
}


// --- STYLESHEET (Reutilizado do Login para Consistência) ---
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor: '#000',
    ...Platform.select({
      web: { height: '100vh' as any, minHeight: '100vh' as any, },
    }),
  } as ViewStyle,
  bgImage: {
    resizeMode: 'cover',
    opacity: 0.35,
  } as ImageStyle,
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'space-between',
  } as ViewStyle,

  // HEADER CUSTOMIZADO
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleSize(18),
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || scaleSize(40)) : scaleSize(40),
    paddingBottom: scaleSize(12),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  } as ViewStyle,
  backButton: {
    width: scaleSize(40),
    height: scaleSize(24),
    justifyContent: 'center',
  } as ViewStyle,
  headerTitle: {
    color: '#E2E8F0',
    fontSize: scaleFont(18),
    fontWeight: '600',
  } as TextStyle,

  // SCROLL / CONTENT
  scrollFlex: {
    flex: 1,
  } as ViewStyle,
  scrollContainer: {
    padding: scaleSize(25),
    alignItems: 'center',
    flexGrow: 1,
  } as ViewStyle,

  mainTitle: {
    fontSize: scaleFont(36),
    fontWeight: 'bold',
    color: '#E2E8F0',
    alignSelf: 'flex-start',
    marginBottom: scaleSize(30),
  } as TextStyle,

  // MENSAGEM DE ERRO
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: scaleSize(12),
    borderRadius: scaleSize(8),
    marginBottom: scaleSize(20),
    borderWidth: 1,
    borderColor: '#F87171',
  } as ViewStyle,
  errorText: {
    color: '#FECACA',
    fontSize: scaleFont(14),
    marginLeft: scaleSize(10),
    flexShrink: 1,
  } as TextStyle,

  // INPUTS
  inputContainer: {
    width: '100%',
    marginBottom: scaleSize(40),
  } as ViewStyle,
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(15),
    marginBottom: scaleSize(20),
    height: scaleSize(50),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,
  inputIcon: {
    marginRight: scaleSize(10),
  } as TextStyle,
  input: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: scaleFont(16),
    height: '100%',
  } as TextStyle,

  // BOTÕES DE AÇÃO
  actionButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: scaleSize(20),
  } as ViewStyle,
  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: scaleSize(16),
    borderRadius: scaleSize(10),
    width: '100%',
    alignItems: 'center',
    marginBottom: scaleSize(10),
  } as ViewStyle,
  primaryButtonText: {
    color: '#0F172A',
    fontSize: scaleFont(20),
    fontWeight: 'bold',
  } as TextStyle,
  
  // RODAPÉ
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSize(15),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexShrink: 0, 
  } as ViewStyle,
  footerText: {
    color: '#94A3B8',
    fontSize: scaleFont(12),
    textAlign: 'center',
  } as TextStyle,
});
