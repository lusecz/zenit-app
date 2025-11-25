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
  // Importando os tipos
  ViewStyle, 
  TextStyle, 
  ImageStyle 
} from 'react-native';
import { useRouter } from 'expo-router'; 

// --- CONSTANTES DE ESCALA RESPONSIVA (Baseado no seu index.tsx) ---
const { width, height } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;
const scaleW = width / DESIGN_WIDTH;
const scaleH = height / DESIGN_HEIGHT;

const scaleSize = (size: number) => Math.round(size * Math.min(scaleW, scaleH));
const scaleFont = (size: number) => size * Math.min(scaleW, 1.15);

// Importe os assets 
const FundoAcademia = require('../assets/images/gym_background.jpg');


// --- COMPONENTE: ITEM DE CONFIGURAÇÃO ---
interface SettingItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    isDestructive?: boolean;
}
const SettingItem: React.FC<SettingItemProps> = ({ icon, title, onPress, isDestructive = false }) => (
    <TouchableOpacity style={profileStyles.settingItem} onPress={onPress}>
        <View style={profileStyles.settingLeft}>
            <Ionicons name={icon} size={scaleSize(20)} color={isDestructive ? '#FF4500' : '#E2E8F0'} style={profileStyles.settingIcon} />
            <Text style={[profileStyles.settingTitle, isDestructive && profileStyles.destructiveText]}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={scaleSize(20)} color="#94A3B8" />
    </TouchableOpacity>
);


// --- TELA PRINCIPAL ---
export default function UserProfileScreen() {
  const router = useRouter(); 

  const handleLogout = () => {
      console.log('Usuário deslogado!');
      // Implementar a lógica real de logout e redirecionar para a tela inicial (index)
      router.replace('/'); 
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
      
      {/* Container Principal */}
      <View style={styles.overlay}>
        
        {/* CABEÇALHO CUSTOMIZADO (Com botão de volta) */}
        <SafeAreaView style={profileStyles.headerContainer}>
            <TouchableOpacity onPress={handleBack} style={profileStyles.backButton}>
                <Ionicons name="arrow-back" size={scaleSize(24)} color="#E2E8F0" />
            </TouchableOpacity>
            <Text style={profileStyles.headerTitle}>Meu Perfil</Text>
            <View style={profileStyles.backButton} /> {/* Espaçador */}
        </SafeAreaView> 

        {/* CONTEÚDO PRINCIPAL (COM SCROLL) */}
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollFlex}>
          
          {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
          <View style={profileStyles.profileHeader}>
              <Ionicons name="person-circle-outline" size={scaleSize(100)} color="#22C55E" />
              <Text style={profileStyles.userName}>Bruno Lima</Text>
              <Text style={profileStyles.userEmail}>bruno.lima@zenit.app</Text>
          </View>
          
          {/* SEÇÃO 2: MÉTRICAS RÁPIDAS */}
          <View style={profileStyles.metricContainer}>
              <View style={profileStyles.metricBox}>
                  <Text style={profileStyles.metricValue}>88 kg</Text>
                  <Text style={profileStyles.metricLabel}>Peso Atual</Text>
              </View>
              <View style={profileStyles.metricBox}>
                  <Text style={profileStyles.metricValue}>1.80 m</Text>
                  <Text style={profileStyles.metricLabel}>Altura</Text>
              </View>
              <View style={profileStyles.metricBox}>
                  <Text style={profileStyles.metricValue}>24%</Text>
                  <Text style={profileStyles.metricLabel}>Gordura</Text>
              </View>
          </View>

          {/* SEÇÃO 3: CONFIGURAÇÕES */}
          <View style={styles.section}>
              <Text style={profileStyles.sectionHeaderTitle}>Conta e Preferências</Text>
              <SettingItem 
                icon="body-outline" 
                title="Editar Dados Biométricos" 
                onPress={() => console.log('Editar Dados')} 
              />
              <SettingItem 
                icon="notifications-outline" 
                title="Configurações de Notificação" 
                onPress={() => console.log('Notificações')} 
              />
              <SettingItem 
                icon="lock-closed-outline" 
                title="Alterar Senha" 
                onPress={() => console.log('Alterar Senha')} 
              />
          </View>
          
          {/* SEÇÃO 4: SUPORTE E LOGOUT */}
          <View style={styles.section}>
              <Text style={profileStyles.sectionHeaderTitle}>Suporte</Text>
              <SettingItem 
                icon="help-circle-outline" 
                title="Ajuda e FAQ" 
                onPress={() => console.log('Ajuda')} 
              />
              <SettingItem 
                icon="log-out-outline" 
                title="Sair (Logout)" 
                onPress={handleLogout} 
                isDestructive={true}
              />
          </View>

          <View style={{height: scaleSize(20)}} /> {/* Espaçador */}
          
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


// --- ESTILOS ESPECÍFICOS DO PERFIL ---
const profileStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scaleSize(18),
        paddingVertical: scaleSize(15),
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || scaleSize(15)) : scaleSize(15),
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Fundo escuro opaco
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    } as ViewStyle,
    backButton: {
        width: scaleSize(40),
        height: scaleSize(24),
        justifyContent: 'center',
    } as ViewStyle,
    headerTitle: {
        color: '#E2E8F0',
        fontSize: scaleFont(20),
        fontWeight: 'bold',
    } as TextStyle,

    // Seção de Informações Principais
    profileHeader: {
        alignItems: 'center',
        paddingVertical: scaleSize(20),
        marginBottom: scaleSize(20),
    } as ViewStyle,
    userName: {
        fontSize: scaleFont(28),
        fontWeight: 'bold',
        color: '#E2E8F0',
        marginTop: scaleSize(10),
    } as TextStyle,
    userEmail: {
        fontSize: scaleFont(16),
        color: '#94A3B8',
    } as TextStyle,
    
    // Seção de Métricas
    metricContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: scaleSize(15),
        paddingVertical: scaleSize(15),
        marginBottom: scaleSize(30),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    } as ViewStyle,
    metricBox: {
        alignItems: 'center',
    } as ViewStyle,
    metricValue: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: '#22C55E', // Cor de destaque
    } as TextStyle,
    metricLabel: {
        fontSize: scaleFont(14),
        color: '#94A3B8',
        marginTop: scaleSize(2),
    } as TextStyle,

    // Itens de Configuração (ListView)
    sectionHeaderTitle: {
        fontSize: scaleFont(16),
        color: '#94A3B8',
        marginBottom: scaleSize(10),
        paddingHorizontal: scaleSize(10),
        fontWeight: '600',
    } as TextStyle,
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        paddingVertical: scaleSize(15),
        paddingHorizontal: scaleSize(15),
        marginBottom: 1, // Pequena linha divisória
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    } as ViewStyle,
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    settingIcon: {
        marginRight: scaleSize(15),
    } as TextStyle,
    settingTitle: {
        fontSize: scaleFont(16),
        color: '#E2E8F0',
    } as TextStyle,
    destructiveText: {
        color: '#FF4500',
    } as TextStyle,
});


// --- ESTILOS PRINCIPAIS DA TELA (Reutilizados do index.tsx) ---
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
    opacity: 0.35, // Um pouco mais opaco que a Home para destacar o conteúdo
  } as ImageStyle,
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', 
    justifyContent: 'space-between',
  } as ViewStyle,
  scrollFlex: {
    flex: 1,
  } as ViewStyle,
  scrollContainer: {
    paddingHorizontal: scaleSize(20),
    paddingTop: scaleSize(10),
  } as ViewStyle,
  section: {
    marginBottom: scaleSize(25),
    width: '100%',
  } as ViewStyle,
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
