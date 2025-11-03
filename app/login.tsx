import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
  TextInput, // Componente de Input de texto
  // Importando os tipos
  ViewStyle, 
  TextStyle, 
  ImageStyle 
} from 'react-native';
import { useRouter } from 'expo-router'; 

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
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Novo estado para mensagens de erro

  const handleLogin = () => {
      // 1. Limpa a mensagem de erro anterior
      setErrorMessage('');

      // 2. VALIDAÇÃO BÁSICA: Verifica se os campos estão vazios
      if (!cpf || !password) {
          setErrorMessage('Por favor, preencha o CPF e a senha.');
          return; // Para a execução e não navega
      }

      // 3. Implementar lógica real de autenticação aqui (e.g., chamada de API)
      console.log(`Tentativa de Login: CPF=${cpf}, Senha=${password}`);
      
      // Simulação: Se passar pela validação vazia, assume-se que o login é bem-sucedido
      // Neste ponto, você faria a chamada real à API
      router.replace('/(tabs)/home'); 
  };

  const handleForgotPassword = () => {
      console.log('Navegar para Esqueceu a Senha');
  };
  
  // FUNÇÃO DE NAVEGAÇÃO PARA CADASTRO CORRIGIDA
  const handleNavigateToCadastro = () => {
      // Forçamos o 'as any' porque a rota /cadastro ainda não existe no _layout
      (router as any).push('/cadastro');
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={scaleSize(24)} color="#E2E8F0" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ZenitApp</Text>
            <View style={styles.backButton} /> {/* Espaçador */}
        </View> 

        {/* CONTEÚDO PRINCIPAL (COM SCROLL) */}
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollFlex} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainTitle}>Entrar</Text>

          {/* MENSAGEM DE ERRO (NOVO) */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Feather name="alert-triangle" size={scaleSize(18)} color="#FECACA" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* INPUTS DE LOGIN */}
          <View style={styles.inputContainer}>
            
            {/* CPF */}
            <View style={styles.inputGroup}>
                <Ionicons name="arrow-forward-circle-outline" size={scaleSize(20)} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu CPF:"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    onChangeText={setCpf}
                    value={cpf}
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
                />
            </View>

            {/* ESQUECEU A SENHA */}
            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

          </View>

          {/* BOTÕES DE AÇÃO */}
          <View style={styles.actionButtonContainer}>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
                <Text style={styles.primaryButtonText}>Acessar</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>OU</Text>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleNavigateToCadastro}>
                <Text style={styles.secondaryButtonText}>Primeiro Acesso</Text>
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


// --- STYLESHEET ---
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
    opacity: 0.35, // Mais opaco para a leitura do formulário
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
    backgroundColor: 'rgba(239, 68, 68, 0.2)', // Vermelho claro
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
  } as ViewStyle,
  forgotPasswordText: {
    color: '#94A3B8',
    fontSize: scaleFont(14),
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
    marginBottom: scaleSize(15),
  } as ViewStyle,
  primaryButtonText: {
    color: '#0F172A',
    fontSize: scaleFont(20),
    fontWeight: 'bold',
  } as TextStyle,
  orText: {
    color: '#94A3B8',
    fontSize: scaleFont(16),
    marginBottom: scaleSize(15),
  } as TextStyle,
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#94A3B8',
    paddingVertical: scaleSize(16),
    borderRadius: scaleSize(10),
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: scaleFont(20),
    fontWeight: '600',
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
