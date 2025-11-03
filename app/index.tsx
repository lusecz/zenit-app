import React, { useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  // Tipos para evitar erros do TypeScript em estilos mistos
  ViewStyle, 
  TextStyle, 
  ImageStyle 
} from 'react-native';
// useNavigation retorna a interface do router no Expo Router v3+
import { useRouter } from 'expo-router'; 
import { Feather } from '@expo/vector-icons';

// --- CONSTANTES DE ESCALA RESPONSIVA ---
const { width, height } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;
const scaleW = width / DESIGN_WIDTH;
const scaleH = height / DESIGN_HEIGHT;

const scaleSize = (size: number) => Math.round(size * Math.min(scaleW, scaleH));
const scaleFont = (size: number) => size * Math.min(scaleW, 1.15);

// Assumindo que os caminhos de imagem estão corretos:
const FundoAcademia = require('../assets/images/gym_background.jpg');
const Logo = require('../assets/images/zenit_logo.png');


export default function WelcomeScreen() {
  const router = useRouter();

  // Desabilita rolagem no web (Mantido)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevBodyOverflow || '';
        document.documentElement.style.overflow = prevHtmlOverflow || '';
      };
    }
  }, []);

  // --- FUNÇÃO CORRIGIDA PARA NAVEGAÇÃO ---
  const handleAcessar = () => {
    console.log('Redirecionando para Login...');
    // CRÍTICO: Redireciona para a tela de Login
    router.push('/login'); 
  };
  
  const handlePrimeiroAcesso = () => console.log('Navegar para Cadastro');
  const handleMenuPress = () => console.log('Abrir Menu Lateral');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={FundoAcademia}
        style={styles.background as ViewStyle} 
        imageStyle={styles.bgImage as ImageStyle}
      >
        <StatusBar barStyle="light-content" translucent />

        <View style={styles.overlay}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
              <Feather name="menu" size={scaleSize(22)} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Image source={Logo} style={styles.headerLogo} resizeMode="contain" />
              <Text style={styles.headerText}>ZenitApp</Text>
            </View>
            
            <View style={styles.menuButton} /> {/* espaço simétrico */}
          </View>

          {/* Conteúdo central */}
          <View style={styles.contentCenter}>
            <View style={styles.card}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Image source={Logo} style={styles.logo} resizeMode="contain" />
                </View>
                <Text style={styles.appName}>ZenitApp</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={handleAcessar}>
                  <Text style={styles.buttonText}>Acessar</Text>
                </TouchableOpacity>

                <Text style={styles.orText}>ou</Text>

                <TouchableOpacity style={styles.secondaryButton} onPress={handlePrimeiroAcesso}>
                  <Text style={styles.buttonText}>Primeiro acesso</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Rodapé fixo */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 <Text style={{ fontWeight: '600', color: '#fff' }}>ZenitApp</Text>. Todos os direitos reservados.
            </Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  } as ViewStyle,
  
  background: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor: '#000',
    ...Platform.select({
      web: {
        height: '100vh' as any,
        minHeight: '100vh' as any,
      },
    }),
  } as ViewStyle,
  
  bgImage: {
    resizeMode: 'cover',
    opacity: 0.25,
  } as ImageStyle,
  
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)',
  } as ViewStyle,

  // HEADER
  header: {
    width: '100%',
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  menuButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }), 
  } as ViewStyle,
  headerLogo: {
    width: scaleSize(24),
    height: scaleSize(24),
    marginRight: scaleSize(8),
  } as ImageStyle,
  headerText: {
    color: '#E2E8F0',
    fontSize: scaleFont(18),
    fontWeight: '600',
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }), 
  } as TextStyle,
  
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(20),
  } as ViewStyle,
  
  card: {
    width: Math.min(width * 0.85, 400),
    borderRadius: scaleSize(20),
    paddingVertical: scaleSize(30),
    paddingHorizontal: scaleSize(25),
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleSize(10) },
    shadowOpacity: 0.3,
    shadowRadius: scaleSize(15),
    ...(Platform.OS === 'web' && { cursor: 'default' as any }),
  } as ViewStyle,
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: scaleSize(25),
  } as ViewStyle,
  
  logoCircle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: scaleSize(50),
    padding: scaleSize(15),
    marginBottom: scaleSize(10),
  } as ViewStyle,
  
  logo: {
    width: scaleSize(60),
    height: scaleSize(60),
  } as ImageStyle,
  
  appName: {
    fontSize: scaleFont(38),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  } as TextStyle,
  
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  
  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(12),
    width: '100%',
    alignItems: 'center',
    marginBottom: scaleSize(12),
    elevation: 5,
  } as ViewStyle,
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#22C55E',
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(12),
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  
  buttonText: {
    color: '#fff',
    fontSize: scaleFont(18),
    fontWeight: '600',
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }),
  } as TextStyle,
  
  orText: {
    color: '#E2E8F0',
    fontSize: scaleFont(15),
    marginVertical: scaleSize(8),
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }),
  } as TextStyle,

  // RODAPÉ FIXO
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
