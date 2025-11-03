import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { 
  SafeAreaView, 
  SectionList, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Dimensions,
  Platform,
  Linking,
  Alert,
  ImageBackground, // Importado para o fundo de academia
  // Importando os tipos para evitar erros de TypeScript
  ViewStyle, 
  TextStyle, 
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
// Importação do arquivo de dados (ATENÇÃO: Mantenha o caminho correto!)
import { EXERCISE_DATA, MuscleGroup, Exercise } from '../constants/exercises'; 

// --- CONSTANTES DE ESCALA RESPONSIVA ---
const { width } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;
const scaleW = width / DESIGN_WIDTH;
const scaleH = DESIGN_HEIGHT / 812;
const scale = Math.min(scaleW, scaleH);

const scaleSize = (size: number) => Math.round(size * scale);
const scaleFont = (size: number) => size * Math.min(scaleW, 1.15);

// Importe o asset do fundo (Caminho corrigido)
const FundoAcademia = require('../assets/images/gym_background.jpg');


// --- COMPONENTE DE BOTÕES DOS DIAS DA SEMANA ---
const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
interface DayButtonsProps {
    onSelectDay: (day: string) => void;
    selectedDay: string | null;
}
const DayButtons: React.FC<DayButtonsProps> = ({ onSelectDay, selectedDay }) => {
    return (
        <View style={dayStyles.container}>
            {diasDaSemana.map((dia, index) => (
                <TouchableOpacity 
                    key={index}
                    style={[
                        dayStyles.button, 
                        selectedDay === dia && dayStyles.activeButton
                    ]}
                    onPress={() => onSelectDay(dia)}
                >
                    <Text style={dayStyles.text}>{dia}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

// --- ITEM DE EXERCÍCIO ---
interface ExerciseItemProps {
    item: Exercise;
    onAdd: (exercise: Exercise) => void;
}
const ExerciseItem: React.FC<ExerciseItemProps> = ({ item, onAdd }) => {
    
    const handleOpenVideo = async () => {
        const url = item.videoUrl;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Erro`, `Não foi possível abrir o link: ${url}`);
        }
    };
    
    return (
        <View style={listStyles.itemContainer}>
            
            {/* Coluna 1: Nome do Exercício */}
            <View style={listStyles.col1}>
                <Text style={listStyles.exerciseName}>{item.name}</Text>
            </View>
            
            {/* Coluna 2: Músculo de Atuação */}
            <View style={listStyles.col2}>
                <Text style={listStyles.muscleGroup}>{item.muscleGroup}</Text>
            </View>
            
            {/* Coluna 3: Ações (Vídeo e Adicionar) */}
            <View style={listStyles.col3}>
                <TouchableOpacity onPress={handleOpenVideo} style={listStyles.videoButton}>
                    <Ionicons name="play-circle" size={scaleSize(28)} color="#22C55E" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onAdd(item)} style={listStyles.addButton}>
                    <Feather name="plus-circle" size={scaleSize(24)} color="#E2E8F0" />
                </TouchableOpacity>
            </View>
        </View>
    );
};


// --- TELA PRINCIPAL ---
export default function ExerciseListScreen() {
    const router = useRouter();
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const sections = EXERCISE_DATA.map((group: MuscleGroup) => ({
        title: group.groupName,
        data: group.exercises
    }));
    
    const handleAddExerciseToTraining = (exercise: Exercise) => {
        if (!selectedDay) {
            Alert.alert("Dia Não Selecionado", "Escolha um dia da semana (na parte inferior) para adicionar o exercício.");
            return;
        }
        Alert.alert("Adicionado!", `${exercise.name} adicionado ao treino de ${selectedDay}.`);
    };
    
    // Header customizado (Título e botão de voltar)
    const renderHeader = () => (
        <View style={listStyles.headerContainer}>
            {/* Botão de Voltar */}
            <TouchableOpacity onPress={() => router.back()} style={listStyles.backButton}>
                <Ionicons name="arrow-back" size={scaleSize(24)} color="#E2E8F0" />
            </TouchableOpacity>
            <Text style={listStyles.mainTitle}>Listagem de Exercícios</Text>
        </View>
    );
    
    // Footer customizado com os botões de dia (Apoio na imagem)
    const renderFooter = () => (
        <View style={listStyles.footerContainer}>
            
            {/* Título e Botão ADICIONAR AO TREINO (Grande) */}
            <View style={listStyles.fullWidthButton}>
                <Text style={listStyles.footerTitleText}>ADICIONAR AO TREINO</Text>
            </View>
            
            {/* Botões de Dias */}
            <DayButtons onSelectDay={setSelectedDay} selectedDay={selectedDay} />
        </View>
    );


    return (
        <ImageBackground
            source={FundoAcademia}
            style={styles.background as ViewStyle}
            imageStyle={styles.bgImage as ImageStyle}
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />
                
                <View style={styles.container}>
                    {renderHeader()}
                    
                    <SectionList
                        sections={sections}
                        keyExtractor={(item, index) => item.name + index}
                        renderItem={({ item }) => <ExerciseItem item={item} onAdd={handleAddExerciseToTraining} />}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={listStyles.sectionHeader}>{title}</Text>
                        )}
                        stickySectionHeadersEnabled={false}
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        ListFooterComponent={renderFooter()}
                    />
                </View>
                
            </SafeAreaView>
        </ImageBackground>
    );
}

// --- ESTILOS DOS BOTÕES DE DIA DA SEMANA (REUTILIZADOS E AJUSTADOS) ---
const dayStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: scaleSize(15),
        marginBottom: scaleSize(5),
        width: '100%',
        paddingHorizontal: scaleSize(10),
    } as ViewStyle,
    button: {
        width: scaleSize(35),
        height: scaleSize(35),
        borderRadius: scaleSize(17.5),
        borderWidth: 2,
        borderColor: '#E2E8F0', // Borda branca/clara para consistência
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


// --- ESTILOS DA LISTAGEM DE EXERCÍCIOS ---
const listStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: scaleSize(20),
        paddingVertical: scaleSize(15),
        // Fundo semi-transparente
        backgroundColor: 'rgba(15, 23, 42, 0.85)', 
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    } as ViewStyle,
    backButton: {
        paddingRight: scaleSize(15),
    } as ViewStyle,
    mainTitle: {
        color: '#E2E8F0',
        fontSize: scaleFont(24),
        fontWeight: 'bold',
    } as TextStyle,

    sectionHeader: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: '#E2E8F0',
        // Fundo mais claro e semi-transparente para o cabeçalho de seção
        backgroundColor: 'rgba(30, 41, 59, 0.9)', 
        paddingHorizontal: scaleSize(20),
        paddingVertical: scaleSize(10),
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginTop: scaleSize(15),
    } as TextStyle,
    
    // ESTILOS DO ITEM DA LISTA
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: scaleSize(15),
        paddingHorizontal: scaleSize(20),
        // Fundo muito transparente (fundo de academia visível)
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)', // Linha divisória suave
    } as ViewStyle,
    col1: {
        width: '45%',
    } as ViewStyle,
    col2: {
        width: '30%',
    } as ViewStyle,
    col3: {
        width: '25%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    } as ViewStyle,
    exerciseName: {
        color: '#E2E8F0',
        fontSize: scaleFont(15),
        fontWeight: '600',
    } as TextStyle,
    muscleGroup: {
        color: '#94A3B8',
        fontSize: scaleFont(13),
    } as TextStyle,
    videoButton: {
        padding: scaleSize(5),
    } as ViewStyle,
    addButton: {
        padding: scaleSize(5),
        marginLeft: scaleSize(10),
    } as ViewStyle,

    // ESTILOS DO RODAPÉ INFERIOR (ADICIONAR AO TREINO)
    footerContainer: {
        padding: scaleSize(20),
        paddingBottom: Platform.OS === 'web' ? scaleSize(20) : 0, 
        backgroundColor: 'rgba(30, 41, 59, 0.95)', // Fundo quase opaco para botões
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        width: '100%',
    } as ViewStyle,
    fullWidthButton: {
        backgroundColor: 'transparent',
        paddingVertical: scaleSize(15),
        borderRadius: scaleSize(10),
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0', // Borda branca
    } as ViewStyle,
    footerTitleText: {
        color: '#E2E8F0',
        fontSize: scaleFont(18),
        fontWeight: 'bold',
    } as TextStyle,
});


// --- ESTILOS PRINCIPAIS DA TELA ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent', // O SafeAreaView agora é transparente para não cobrir o fundo
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
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
        opacity: 0.25, // Transparência na imagem de fundo
    } as ImageStyle,
    container: {
        flex: 1,
        backgroundColor: 'transparent', // Container também transparente
    } as ViewStyle,
    list: {
        flex: 1,
        backgroundColor: 'transparent', // Lista transparente
    } as ViewStyle,
    listContent: {
        paddingBottom: scaleSize(20),
    } as ViewStyle,
});
