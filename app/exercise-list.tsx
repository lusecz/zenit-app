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
  ImageBackground,
  ViewStyle, 
  TextStyle, 
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
// Importando os dados de exercícios (caminho corrigido para a pasta 'constants')
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

// Importe o asset do fundo (Caminho corrigido para a raiz /assets/images)
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

// --- NOVO COMPONENTE: CABEÇALHO DE SELEÇÃO (ADICIONAR AO TREINO) ---
interface SelectionHeaderProps {
    selectedDay: string | null;
    setSelectedDay: (day: string) => void;
}
const SelectionHeader: React.FC<SelectionHeaderProps> = ({ selectedDay, setSelectedDay }) => (
    <View style={listStyles.selectionHeaderContainer}>
        <View style={listStyles.fullWidthButton}>
            <Text style={listStyles.footerTitleText}>ADICIONAR AO TREINO</Text>
        </View>
        <DayButtons onSelectDay={setSelectedDay} selectedDay={selectedDay} />
    </View>
);


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
            Alert.alert("Dia Não Selecionado", "Escolha um dia da semana (na parte superior) para adicionar o exercício.");
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
    

    return (
        <ImageBackground
            source={FundoAcademia}
            style={styles.background as ViewStyle}
            imageStyle={styles.bgImage as ImageStyle}
        >
            {/* CONTAINER PRINCIPAL: flex: 1, usa space-between para fixar o footer */}
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />
                
                {/* 1. CABEÇALHO CUSTOMIZADO */}
                {renderHeader()}
                
                {/* 2. CONTEÚDO SCROLLÁVEL (Preenche o espaço) */}
                <View style={styles.container}>
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
                        // CRÍTICO: Usa o SelectionHeader no ListHeaderComponent
                        ListHeaderComponent={
                            <SelectionHeader selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
                        }
                    />
                </View>
                
                {/* 3. RODAPÉ FIXO (DE DIREITOS AUTORAIS) */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2025 ZenitApp. Todos os direitos reservados.
                    </Text>
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
        borderColor: '#22C55E',
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

    // NOVO ESTILO: Container para o cabeçalho de seleção
    selectionHeaderContainer: {
        padding: scaleSize(20),
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        borderBottomWidth: 1,
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
        borderColor: '#E2E8F0',
    } as ViewStyle,
    footerTitleText: {
        color: '#E2E8F0',
        fontSize: scaleFont(18),
        fontWeight: 'bold',
    } as TextStyle,

    sectionHeader: {
        fontSize: scaleFont(20),
        fontWeight: 'bold',
        color: '#E2E8F0',
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        borderBottomWidth: 1,
        borderColor: '#1E293B',
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
});


// --- ESTILOS PRINCIPAIS DA TELA ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
        // Removido paddingTop aqui, pois o HeaderBar customizado já trata disso
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
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between', // CRÍTICO: Para fixar o footer
    } as ViewStyle,
    list: {
        flex: 1,
        backgroundColor: 'transparent',
    } as ViewStyle,
    listContent: {
        paddingBottom: scaleSize(20),
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