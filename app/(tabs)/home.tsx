import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ImageBackground, 
  Dimensions, 
  Image, 
  Platform,
  // Importando os tipos para evitar erros de TypeScript
  ViewStyle, 
  TextStyle, 
  ImageStyle 
} from 'react-native';

// --- CONSTANTES DE ESCALA RESPONSIVA ---
const { width, height } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;
const scaleW = width / DESIGN_WIDTH;
const scaleH = height / DESIGN_HEIGHT;

const scaleSize = (size: number) => Math.round(size * Math.min(scaleW, scaleH));
const scaleFont = (size: number) => size * Math.min(scaleW, 1.15);

// Importe os assets (Certifique-se que o caminho está correto: dois '..' para sair de (tabs) e 'app')
const FundoAcademia = require('../../assets/images/gym_background.jpg');
const Logo = require('../../assets/images/zenit_logo.png');


// --- COMPONENTE DE CABEÇALHO FIXO (Baseado no index.tsx) ---
function HeaderBar() {
  const handleMenuPress = () => console.log('Abrir Menu Lateral');
  const handleProfilePress = () => console.log('Abrir Perfil');
  
  return (
    <SafeAreaView style={styles.header}>
      {/* ÍCONE DO MENU (Esquerda) */}
      <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
        <Feather name="menu" size={scaleSize(22)} color="#fff" />
      </TouchableOpacity>
      
      {/* NOME E LOGO CENTRALIZADOS */}
      <View style={styles.headerTitleContainer}>
        <Image source={Logo} style={styles.headerLogo} resizeMode="contain" />
        <Text style={styles.headerText}>ZenitApp</Text>
      </View>
      
      {/* Ícone de Perfil (Direita) */}
      <TouchableOpacity onPress={handleProfilePress} style={styles.menuButton}>
        <Ionicons name="person-circle-outline" size={scaleSize(26)} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- COMPONENTE: BOTÕES DOS DIAS DA SEMANA ---
const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DayButtons = () => {
    return (
        <View style={dayStyles.container}>
            {diasDaSemana.map((dia, index) => (
                <TouchableOpacity 
                    key={index}
                    style={[
                        dayStyles.button, 
                        // Exemplo de como destacar um dia (ex: T - Terça-feira)
                        index === 2 && dayStyles.activeButton
                    ]}
                    onPress={() => console.log(`Dia selecionado: ${dia}`)}
                >
                    <Text style={dayStyles.text}>{dia}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// --- COMPONENTE PRINCIPAL ---
export default function HomeScreen() {
  return (
    <ImageBackground
      source={FundoAcademia}
      style={styles.background as ViewStyle}
      imageStyle={styles.bgImage as ImageStyle}
    >
      <StatusBar barStyle="light-content" translucent />
      
      {/* O overlay/overlay é o container principal e usa space-between */}
      <View style={styles.overlay}>
        
        {/* CABEÇALHO FIXO */}
        <HeaderBar /> 
        
        {/* CONTEÚDO PRINCIPAL (COM SCROLL) */}
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollFlex}>
          
          {/* SEÇÃO 1: Boas-vindas e Motivacional */}
          <View style={styles.section}>
            <Text style={styles.titleWelcome}>Bem-vindo! 👋</Text>
            <Text style={styles.subtitleWelcome}>
              Controle seu treino diário com praticidade e incrível motivação.
            </Text>
          </View>

          {/* SEÇÃO 2: Seleção de Treino (Dias da Semana) */}
          <View style={styles.section}>
            <Text style={styles.title}>Selecione o Treino de Hoje</Text>
            <DayButtons /> 
          </View>
          
          {/* SEÇÃO 3: Progresso e Métricas */}
          <View style={styles.section}>
            <Text style={styles.title}>Progresso Semanal</Text>
            <Text style={styles.subtitle}>Você completou 4 de 5 treinos previstos</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.title}>Métricas da Semana</Text>
            <Text style={styles.subtitle}>Volume Total: 12.5KG</Text>
            <Text style={styles.subtitle}>Treinos Realizados: 4</Text>
          </View>

          {/* SEÇÃO 4: Ações Rápidas (Estilo de Botão do Novo Modelo) */}
          <View style={styles.section}>
            <Text style={styles.title}>Ações Rápidas</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Exercícios')}>
              <Text style={styles.actionButtonText}>Exercícios Cadastrados</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Organizar')}>
              <Text style={styles.actionButtonText}>Organizar Treinos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Histórico')}>
              <Text style={styles.actionButtonText}>Visualizar Histórico</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
        
        {/* RODAPÉ FIXO (Baseado no index.tsx) */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>
                © 2025 ZenitApp. Todos os direitos reservados.
            </Text>
        </View>

      </View>
    </ImageBackground>
  );
}


// --- ESTILOS DOS BOTÕES DE DIA DA SEMANA ---
const dayStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: scaleSize(10),
        marginBottom: scaleSize(15),
        width: '95%',
        alignSelf: 'center',
    } as ViewStyle,
    button: {
        width: scaleSize(35),
        height: scaleSize(35),
        borderRadius: scaleSize(17.5),
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    } as ViewStyle,
    activeButton: {
        backgroundColor: '#22C55E',
        borderColor: '#22C55E',
    } as ViewStyle,
    text: {
        color: '#E2E8F0',
        fontSize: scaleFont(16),
        fontWeight: 'bold',
    } as TextStyle,
});


// --- STYLESHEET PRINCIPAL (ADAPTADO) ---
const styles = StyleSheet.create({
  // BACKGROUND
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
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'space-between', // CRÍTICO: Fixa Header e Footer
  } as ViewStyle,

  // HEADER BAR (Fixo no topo)
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
  menuButton: {
    width: scaleSize(40),
    height: scaleSize(40),
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  } as TextStyle,
  
  // SCROLL CONTAINER FLEXÍVEL (Preenche o espaço entre Header e Footer)
  scrollFlex: {
      flex: 1, 
  } as ViewStyle,
  scrollContainer: {
    padding: scaleSize(20),
    paddingTop: scaleSize(10),
    alignItems: 'flex-start',
  } as ViewStyle,
  section: {
    marginBottom: scaleSize(28),
    width: '100%',
  } as ViewStyle,
  
  // TEXTOS E BOTÕES DE CONTEÚDO
  titleWelcome: {
    color: '#E2E8F0',
    fontSize: scaleFont(30),
    fontWeight: 'bold',
    marginBottom: scaleSize(10),
    marginTop: scaleSize(10), 
  } as TextStyle,
  subtitleWelcome: {
    color: '#E2E8F0',
    fontSize: scaleFont(16),
    marginBottom: scaleSize(15),
  } as TextStyle,
  title: {
    color: '#E2E8F0',
    fontSize: scaleFont(20),
    fontWeight: '600',
    marginBottom: scaleSize(8),
  } as TextStyle,
  subtitle: {
    color: '#94A3B8',
    fontSize: scaleFont(15),
  } as TextStyle,

  // BOTÕES DE AÇÃO RÁPIDA (Com Borda Branca/Transparente)
  actionButton: {
    backgroundColor: 'transparent', 
    paddingVertical: scaleSize(16),
    borderRadius: scaleSize(8),
    marginTop: scaleSize(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  } as ViewStyle,
  actionButtonText: {
    color: '#E2E8F0',
    fontSize: scaleFont(16),
    fontWeight: '600',
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