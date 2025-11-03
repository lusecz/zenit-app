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
import { initFirebase } from './firebase-config'; // Importa a config
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Importa a função de login

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
export default function LoginScreen() {
  const router = useRouter(); 
  
  // O Firebase usa E-mail e Senha, então adicionamos o E-mail.
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa o Firebase ao carregar o componente
  useEffect(() => {
    initFirebase();
  }, []);

  const handleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);

    if (!email || !password) {
        setErrorMessage('Por favor, preencha o E-mail e a senha.');
        setIsLoading(false);
        return;
    }

    try {
        const authInstance = getAuth();

        // TENTA FAZER O LOGIN COM E-MAIL E SENHA
        await signInWithEmailAndPassword(authInstance, email, password);

        // Se o login for bem-sucedido, redireciona
        Alert.alert("Sucesso!", "Login realizado com sucesso. Bem-vindo(a)!");
        router.replace('/(tabs)/home'); 

    } catch (error: any) {
        console.error("Erro no Login:", error.message);
        
        let msg = "Ocorreu um erro. Verifique sua conexão.";
        
        // Trata códigos de erro comuns do Firebase
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            msg = "E-mail ou senha inválidos. Verifique suas credenciais.";
        } else if (error.code === 'auth/invalid-email') {
            msg = "O formato do e-mail é inválido.";
        }
        
        setErrorMessage(msg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
      console.log('Navegar para Esqueceu a Senha');
  };
  
  // Navegação para a tela de Cadastro
  const handleNavigateToCadastro = () => {
      router.push('/cadastro');
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
      
      {/* 1. CONTAINER PRINCIPAL: flex: 1 */}
      <View style={styles.overlay}>
        
        {/* CABEÇALHO CUSTOMIZADO COM VOLTAR */}
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={scaleSize(24)} color="#E2E8F0" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Entrar</Text>
            <View style={styles.backButton} /> {/* Espaçador */}
        </View> 

        {/* CONTEÚDO PRINCIPAL (COM SCROLL) */}
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollFlex} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainTitle}>Entrar</Text>

          {/* MENSAGEM DE ERRO */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Feather name="alert-triangle" size={scaleSize(18)} color="#FECACA" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* INPUTS DE LOGIN */}
          <View style={styles.inputContainer}>
            
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

            {/* SENHA */}
            <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={scaleSize(20)} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Digite sua senha:"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    onChangeText={setPassword}
                    value={password}
                    editable={!isLoading}
                />
            </View>

            {/* Esqueceu a senha */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword} disabled={isLoading}>
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

          </View>

          {/* BOTÕES DE AÇÃO */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.primaryButtonText}>{isLoading ? 'ENTRANDO...' : 'ACESSAR'}</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>OU</Text>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleNavigateToCadastro} disabled={isLoading}>
                <Text style={styles.secondaryButtonText}>PRIMEIRO ACESSO</Text>
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


// --- STYLESHEET (Reutilizado do Cadastro para Consistência) ---
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

  // TEXTO ESQUECEU SENHA
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: scaleSize(30),
  } as ViewStyle,
  forgotPasswordText: {
    color: '#94A3B8',
    fontSize: scaleFont(14),
  } as TextStyle,

  // BOTÕES DE AÇÃO
  actionButtonContainer: {
    width: '100%',
    alignItems: 'center',
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
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: scaleSize(16),
    borderRadius: scaleSize(10),
    width: '100%',
    alignItems: 'center',
    marginTop: scaleSize(15),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  } as ViewStyle,
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: scaleFont(20),
    fontWeight: 'bold',
  } as TextStyle,
  orText: {
    color: '#94A3B8',
    fontSize: scaleFont(16),
    marginVertical: scaleSize(10),
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