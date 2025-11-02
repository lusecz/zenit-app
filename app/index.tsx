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
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const FundoAcademia = require('../assets/images/gym_background.jpg');
const Logo = require('../assets/images/zenit_logo.png');

// --- CONSTANTES DE ESCALA RESPONSIVA ---
const { width, height } = Dimensions.get('window');
const DESIGN_WIDTH = 375; // base iPhone X
const DESIGN_HEIGHT = 812;
const scaleW = width / DESIGN_WIDTH;
const scaleH = height / DESIGN_HEIGHT;

// Escala inteligente (mantém proporção visual natural)
const scaleSize = (size: number) => Math.round(size * Math.min(scaleW, scaleH));
const scaleFont = (size: number) => size * Math.min(scaleW, 1.15);

export default function WelcomeScreen() {
  const navigation = useNavigation();

  // Desabilita rolagem no web
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

  const handleAcessar = () => console.log('Navegar para Login');
  const handlePrimeiroAcesso = () => console.log('Navegar para Cadastro');
  const handleMenuPress = () => console.log('Abrir Menu Lateral');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={FundoAcademia}
        style={[styles.background, Platform.OS === 'web' ? styles.backgroundWeb : null]}
        imageStyle={styles.bgImage}
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
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    backgroundColor: '#000',
  },
  backgroundWeb: {
    height: '100vh',
    minHeight: '100vh',
  },
  bgImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

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
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: scaleSize(24),
    height: scaleSize(24),
    marginRight: scaleSize(8),
  },
  headerText: {
    color: '#E2E8F0',
    fontSize: scaleFont(18),
    fontWeight: '600',
  },

  // CONTEÚDO CENTRAL
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(20),
  },
  card: {
    width: Math.min(width * 0.85, 400), // Limita tamanho máximo
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: scaleSize(25),
  },
  logoCircle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: scaleSize(50),
    padding: scaleSize(15),
    marginBottom: scaleSize(10),
  },
  logo: {
    width: scaleSize(60),
    height: scaleSize(60),
  },
  appName: {
    fontSize: scaleFont(38),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },

  // BOTÕES
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(12),
    width: '100%',
    alignItems: 'center',
    marginBottom: scaleSize(12),
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#22C55E',
    paddingVertical: scaleSize(14),
    borderRadius: scaleSize(12),
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: scaleFont(18),
    fontWeight: '600',
  },
  orText: {
    color: '#E2E8F0',
    fontSize: scaleFont(15),
    marginVertical: scaleSize(8),
  },

  // FOOTER
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSize(12),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexShrink: 0,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: scaleFont(13),
    textAlign: 'center',
  },
});
