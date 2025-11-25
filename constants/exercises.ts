export interface Exercise {
  name: string;
  muscleGroup: string;
  videoUrl: string;
}

export interface MuscleGroup {
  groupName: string;
  exercises: Exercise[];
}

export const EXERCISE_DATA: MuscleGroup[] = [
  {
    groupName: 'Peito',
    exercises: [
      { name: 'Supino reto com barra', muscleGroup: 'Peitoral maior', videoUrl: 'https://www.youtube.com/watch?v=WwXS2TeFmeg' },
      { name: 'Supino inclinado', muscleGroup: 'Peitoral superior', videoUrl: 'https://www.youtube.com/watch?v=1Tdm1czsrRc' },
      { name: 'Crucifixo', muscleGroup: 'Peitoral maior/lateral', videoUrl: 'https://www.youtube.com/watch?v=Etbg6HcMrfw' },
      { name: 'Flexão de braço', muscleGroup: 'Peitoral, tríceps, ombro', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
      { name: 'Crossover no cabo', muscleGroup: 'Peitoral maior/lateral', videoUrl: 'https://www.youtube.com/watch?v=qvzh8RwRYJw' },
    ]
  },
  {
    groupName: 'Costas',
    exercises: [
      { name: 'Puxada frontal/pulley', muscleGroup: 'Grande dorsal', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
      { name: 'Remada curvada', muscleGroup: 'Dorsal, trapézio', videoUrl: 'https://www.youtube.com/watch?v=vT2GjY_Umpw' },
      { name: 'Barra fixa', muscleGroup: 'Grande dorsal, bíceps', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
      { name: 'Remada baixa', muscleGroup: 'Dorsal, trapézio', videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8' },
      { name: 'Pullover', muscleGroup: 'Dorsal, peitoral menor', videoUrl: 'https://www.youtube.com/watch?v=6YDy89ZpWkg' },
    ]
  },
  {
    groupName: 'Quadríceps',
    exercises: [
      { name: 'Agachamento livre', muscleGroup: 'Quadríceps, glúteos', videoUrl: 'https://www.youtube.com/watch?v=70FUAa1m7rA' },
      { name: 'Agachamento frontal', muscleGroup: 'Quadríceps', videoUrl: 'https://www.youtube.com/watch?v=5xBc5tF4KJQ' },
      { name: 'Leg press', muscleGroup: 'Quadríceps', videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ' },
      { name: 'Cadeira extensora', muscleGroup: 'Quadríceps', videoUrl: 'https://www.youtube.com/watch?v=ELOCsoDSmrg' },
      { name: 'Avanço (afundo)', muscleGroup: 'Quadríceps, glúteos', videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U' },
    ]
  },
  {
    groupName: 'Posterior de Coxa',
    exercises: [
      { name: 'Stiff', muscleGroup: 'Posterior de coxa, glúteos', videoUrl: 'https://www.youtube.com/watch?v=Yb7eYk9g8D8' },
      { name: 'Mesa flexora', muscleGroup: 'Posterior de coxa', videoUrl: 'https://www.youtube.com/watch?v=vS3UAlh5PAc' },
      { name: 'Levantamento terra', muscleGroup: 'Posterior de coxa, glúteos', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
      { name: 'Flexão nórdica', muscleGroup: 'Posterior de coxa', videoUrl: 'https://www.youtube.com/watch?v=SwFzXvQwS1s' },
      { name: 'Agachamento búlgaro', muscleGroup: 'Quadríceps/posterior coxa', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE' },
    ]
  },
  {
    groupName: 'Deltoide',
    exercises: [
      { name: 'Elevação lateral', muscleGroup: 'Deltoide lateral', videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo' },
      { name: 'Desenvolvimento', muscleGroup: 'Deltoide, tríceps', videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
      { name: 'Elevação frontal', muscleGroup: 'Deltoide anterior', videoUrl: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA' },
      { name: 'Crucifixo inverso', muscleGroup: 'Deltoide posterior', videoUrl: 'https://www.youtube.com/watch?v=SAgyh7Sjsq8' },
      { name: 'Remada alta', muscleGroup: 'Deltoide/trapézio', videoUrl: 'https://www.youtube.com/watch?v=GJO0FBOmBbA' },
    ]
  },
  {
    groupName: 'Trapézio',
    exercises: [
      { name: 'Encolhimento de ombros', muscleGroup: 'Trapézio', videoUrl: 'https://www.youtube.com/watch?v=nghOSQGxYv4' },
      { name: 'Remada alta', muscleGroup: 'Trapézio/deltoides', videoUrl: 'https://www.youtube.com/watch?v=GJO0FBOmBbA' },
      { name: 'Crucifixo inverso', muscleGroup: 'Trapézio, deltoide', videoUrl: 'https://www.youtube.com/watch?v=SAgyh7Sjsq8' },
      { name: 'Levantamento terra', muscleGroup: 'Trapézio, costas', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
      { name: 'Face pull', muscleGroup: 'Trapézio/deltoide', videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk' },
    ]
  },
  {
    groupName: 'Bíceps',
    exercises: [
      { name: 'Rosca direta', muscleGroup: 'Bíceps', videoUrl: 'https://www.youtube.com/watch?v=av7-8igSXTs' },
      { name: 'Rosca alternada', muscleGroup: 'Bíceps', videoUrl: 'https://www.youtube.com/watch?v=twF3HjV0yFM' },
      { name: 'Rosca martelo', muscleGroup: 'Bíceps, braquiorradial', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
      { name: 'Rosca Scott', muscleGroup: 'Bíceps', videoUrl: 'https://www.youtube.com/watch?v=zoGwA_Ac2L0' },
      { name: 'Rosca concentrada', muscleGroup: 'Bíceps', videoUrl: 'https://www.youtube.com/watch?v=WyX7d-OMwQY' },
    ]
  },
  {
    groupName: 'Tríceps',
    exercises: [
      { name: 'Tríceps corda (pulley)', muscleGroup: 'Tríceps', videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU' },
      { name: 'Tríceps francês', muscleGroup: 'Tríceps', videoUrl: 'https://www.youtube.com/watch?v=YbX7Wd8jQ-Q' },
      { name: 'Supino fechado', muscleGroup: 'Tríceps, peitoral', videoUrl: 'https://www.youtube.com/watch?v=_GQvu3kBzpc' },
      { name: 'Tríceps banco', muscleGroup: 'Tríceps', videoUrl: 'https://www.youtube.com/watch?v=6kALZikXxLc' },
      { name: 'Tríceps coice', muscleGroup: 'Tríceps', videoUrl: 'https://www.youtube.com/watch?v=6SS6K3lAwZ8' },
    ]
  },
  {
    groupName: 'Panturrilha',
    exercises: [
      { name: 'Elevação de panturrilha em pé', muscleGroup: 'Gastrocnêmio', videoUrl: 'https://www.youtube.com/watch?v=-M4-G8p8fmc' },
      { name: 'Elevação de panturrilha sentado', muscleGroup: 'Sóleo, gastrocnêmio', videoUrl: 'https://www.youtube.com/watch?v=XQa2SprZlMA' },
      { name: 'Elevação unilateral', muscleGroup: 'Panturrilha', videoUrl: 'https://www.youtube.com/watch?v=OH9hrQ7Y4xA' },
      { name: 'Panturrilha no leg press', muscleGroup: 'Gastrocnêmio, sóleo', videoUrl: 'https://www.youtube.com/watch?v=1PKiK2yFfPU' },
      { name: 'Saltos no step', muscleGroup: 'Panturrilha, glúteo', videoUrl: 'https://www.youtube.com/watch?v=V1SkTkc6N0k' },
    ]
  },
  {
    groupName: 'Abdominais',
    exercises: [
      { name: 'Abdominal supra tradicional', muscleGroup: 'Reto abdominal', videoUrl: 'https://www.youtube.com/watch?v=twF3HjV0yFM' },
      { name: 'Abdominal infra', muscleGroup: 'Abdômen inferior', videoUrl: 'https://www.youtube.com/watch?v=JB2oyawG9KI' },
      { name: 'Prancha abdominal', muscleGroup: 'Core', videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
      { name: 'Abdominal bicicleta', muscleGroup: 'Oblíquos, core', videoUrl: 'https://www.youtube.com/watch?v=9FGilxCbdz8' },
      { name: 'Elevação de pernas', muscleGroup: 'Abdômen inferior', videoUrl: 'https://www.youtube.com/watch?v=JB2oyawG9KI' },
    ]
  },
];
