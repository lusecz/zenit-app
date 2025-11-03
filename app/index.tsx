import { useNavigation } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const FundoAcademia = require('../assets/images/gym_background.jpeg');
const Logo = require('../assets/images/zenit_logo.png');

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleAcessar = () => {
    console.log('Navegar para Home após Login');
  };

  const handlePrimeiroAcesso = () => {
    console.log('Navegar para Cadastro');
  };

  return (
    <ImageBackground source={FundoAcademia} style={styles.background}>
      <StatusBar barStyle="light-content" translucent />
      <View style={styles.overlay}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Image source={Logo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerText}>Bem-vindo ao ZenitApp</Text>
        </View>

        {/* Conteúdo central com rolagem controlada */}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {/* Logo principal */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image source={Logo} style={styles.logo} resizeMode="contain" />
              </View>
              <Text style={styles.appName}>ZenitApp</Text>
            </View>

            {/* Botões */}
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
        </ScrollView>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 ZenitApp. Todos os direitos reservados.</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  headerText: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  card: {
    width: width * 0.85,
    borderRadius: 25,
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    padding: 15,
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#22C55E',
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  orText: {
    color: '#E2E8F0',
    fontSize: 16,
    marginVertical: 10,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});
