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
  ViewStyle, 
  TextStyle, 
  ImageStyle 
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons'; 

const FundoAcademia = require('../assets/images/gym_background.jpg');
const Logo = require('../assets/images/zenit_logo.png');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  // Bloqueia a rolagem no Web (para o fundo fixo)
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

  const handleAcessar = () => {
    console.log('Navegar para Login');
    // Implementar a navegação real aqui (ex: navigation.replace('(tabs)'))
  };

  const handlePrimeiroAcesso = () => {
    console.log('Navegar para Cadastro');
  };
  
  const handleMenuPress = () => {
    console.log('Abrir Menu Lateral');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={FundoAcademia}
        style={styles.background as ViewStyle} 
        imageStyle={styles.bgImage as ImageStyle}
      >
        <StatusBar barStyle="light-content" translucent />

        {/* Container principal */}
        <View style={styles.overlay}>
          {/* Cabeçalho */}
          <View style={styles.header}>
            
            <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
              <Feather name="menu" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Image source={Logo} style={styles.headerLogo} resizeMode="contain" />
              <Text style={styles.headerText}>ZenitApp</Text>
            </View>
            
            <View style={styles.menuButton} /> 

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

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  
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
  } as ImageStyle,
  
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    width: '100%',
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 40,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }), 
  } as ViewStyle,
  
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    marginBottom: 0,
  } as ImageStyle,
  
  headerText: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '600',
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }), 
  } as TextStyle,
  
  contentCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,
  
  card: {
    width: width * 0.85,
    borderRadius: 25,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    ...(Platform.OS === 'web' && { cursor: 'default' as any }),
  } as ViewStyle,
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  } as ViewStyle,
  
  logoCircle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: 15,
    marginBottom: 10,
  } as ViewStyle,
  
  logo: {
    width: 60,
    height: 60,
  } as ImageStyle,
  
  appName: {
    fontSize: 40,
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
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  } as ViewStyle,
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#22C55E',
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  } as ViewStyle,
  
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }),
  } as TextStyle,
  
  orText: {
    color: '#E2E8F0',
    fontSize: 16,
    marginVertical: 10,
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }),
  } as TextStyle,
  
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexShrink: 0,
  } as ViewStyle,
  
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    ...(Platform.OS === 'web' && { userSelect: 'none' as any }),
  } as TextStyle,
});