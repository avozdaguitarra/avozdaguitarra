import { Student, ScheduleItem, PaymentRecord, StudyMaterial, UserAccount } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Inês Santos',
    email: 'ines.santos@email.com',
    phone: '+351 912 345 678',
    instrument: 'Guitarra Clássica',
    level: 'Intermédio',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    paymentPlan: 'mensal',
    monthlyFee: 75,
    perLessonFee: 22,
    currentMonthStatus: 'pago',
    currentMonthName: 'Março 2026',
    notes: 'A preparar o Estudo nº 1 de Villa-Lobos e peças renascentistas.',
    joinedDate: '2025-09-15',
  },
  {
    id: 'student-2',
    name: 'Tiago Costa',
    email: 'tiago.costa@email.com',
    phone: '+351 963 852 741',
    instrument: 'Guitarra Portuguesa',
    level: 'Avançado',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    paymentPlan: 'mensal',
    monthlyFee: 80,
    perLessonFee: 25,
    currentMonthStatus: 'pendente',
    currentMonthName: 'Março 2026',
    notes: 'Trabalho de técnica de unhas, trinado e fado tradicional de Lisboa.',
    joinedDate: '2025-10-02',
  },
  {
    id: 'student-3',
    name: 'Mariana Silva',
    email: 'mariana.silva@email.com',
    phone: '+351 925 112 233',
    instrument: 'Piano',
    level: 'Iniciante',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    paymentPlan: 'por_aula',
    monthlyFee: 75,
    perLessonFee: 20,
    currentMonthStatus: 'pendente',
    currentMonthName: 'Março 2026',
    notes: 'Leitura na clave de Fá e coordenação de mãos em 3/4.',
    joinedDate: '2026-01-10',
  },
  {
    id: 'student-4',
    name: 'Diogo Ferreira',
    email: 'diogo.ferreira@email.com',
    phone: '+351 934 998 877',
    instrument: 'Ukulele',
    level: 'Intermédio',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    paymentPlan: 'mensal',
    monthlyFee: 85,
    perLessonFee: 25,
    currentMonthStatus: 'atrasado',
    currentMonthName: 'Março 2026',
    notes: 'Batidas rítmicas sincopadas, dedilhados e mudanças rápidas de acordes.',
    joinedDate: '2025-06-20',
  },
  {
    id: 'student-5',
    name: 'Beatriz Lima',
    email: 'beatriz.lima@email.com',
    phone: '+351 919 445 566',
    instrument: 'Guitarra Portuguesa',
    level: 'Iniciante',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    paymentPlan: 'mensal',
    monthlyFee: 80,
    perLessonFee: 24,
    currentMonthStatus: 'pago',
    currentMonthName: 'Março 2026',
    notes: 'Postura de arco e afinação na 1ª posição (Concerto em Lá menor de Vivaldi).',
    joinedDate: '2025-11-12',
  },
];

export const INITIAL_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-1',
    studentId: 'student-1',
    dayOfWeek: 2, // Terça-feira
    startTime: '17:30',
    durationMinutes: 60,
    modality: 'presencial',
    roomName: 'Sala 6 (1º Andar)',
    locationOrLink: 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
    teacherName: 'Prof. André Martins',
    focusArea: 'Estudo nº 1 de Villa-Lobos e afinação das pestanas',
  },
  {
    id: 'sch-2',
    studentId: 'student-2',
    dayOfWeek: 3, // Quarta-feira
    startTime: '18:30',
    durationMinutes: 60,
    modality: 'presencial',
    roomName: 'Sala 6 (1º Andar)',
    locationOrLink: 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
    teacherName: 'Prof. André Martins',
    focusArea: 'Solos Pentatónicos com Blue Note e fraseado Blues-Rock',
  },
  {
    id: 'sch-3',
    studentId: 'student-3',
    dayOfWeek: 1, // Segunda-feira
    startTime: '15:00',
    durationMinutes: 60,
    modality: 'online',
    roomName: 'Sala Virtual Zoom / Meet',
    locationOrLink: 'https://meet.google.com/mus-pno-aula',
    teacherName: 'Prof. André Martins',
    focusArea: 'Exercícios de Hanon e Minueto em Sol Maior (Bach)',
  },
  {
    id: 'sch-4',
    studentId: 'student-4',
    dayOfWeek: 4, // Quinta-feira
    startTime: '16:15',
    durationMinutes: 60,
    modality: 'presencial',
    roomName: 'Sala 6 (1º Andar)',
    locationOrLink: 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
    teacherName: 'Prof. André Martins',
    focusArea: 'Rudimentos e dedilhados de Ukulele',
  },
  {
    id: 'sch-5',
    studentId: 'student-5',
    dayOfWeek: 5, // Sexta-feira
    startTime: '17:00',
    durationMinutes: 60,
    modality: 'presencial',
    roomName: 'Sala 6 (1º Andar)',
    locationOrLink: 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
    teacherName: 'Prof. André Martins',
    focusArea: 'Fado de Coimbra e técnicas de trinado',
  },
];

const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  // Student 4 (Diogo - Mensalidade com Vencimento Já Ultrapassado)
  {
    id: 'pay-4',
    studentId: 'student-4',
    title: 'Mensalidade Estúdio (Bateria)',
    type: 'mensalidade',
    amount: 85,
    dueDate: getRelativeDate(-4), // Ultrapassada há 4 dias
    status: 'atrasado',
    notes: 'Data limite expirada. Aguarda regularização urgente.',
  },
  {
    id: 'pay-4-old',
    studentId: 'student-4',
    title: 'Mensalidade Anterior',
    type: 'mensalidade',
    amount: 85,
    dueDate: getRelativeDate(-34),
    paidDate: getRelativeDate(-32),
    status: 'pago',
    paymentMethod: 'Transferência Bancária',
    receiptCode: 'REC-2026-02-045',
  },

  // Student 2 (Tiago - Mensalidade com Vencimento Próximo)
  {
    id: 'pay-2',
    studentId: 'student-2',
    title: 'Mensalidade Estúdio (Guitarra Portuguesa)',
    type: 'mensalidade',
    amount: 80,
    dueDate: getRelativeDate(3), // Vence em 3 dias
    status: 'pendente',
    notes: 'Vencimento próximo em 3 dias. Aguarda envio de comprovativo.',
  },
  {
    id: 'pay-2-old',
    studentId: 'student-2',
    title: 'Mensalidade Anterior',
    type: 'mensalidade',
    amount: 80,
    dueDate: getRelativeDate(-28),
    paidDate: getRelativeDate(-28),
    status: 'pago',
    paymentMethod: 'MB WAY',
    receiptCode: 'REC-2026-02-033',
  },

  // Student 3 (Mariana - Aula com Vencimento Iminente / Amanhã)
  {
    id: 'pay-3',
    studentId: 'student-3',
    title: 'Aula de Piano & Harmonia (Semanal)',
    type: 'aula_avulso',
    amount: 20,
    dueDate: getRelativeDate(1), // Vence amanhã
    status: 'pendente',
    notes: 'Vence amanhã. Referente à aula individual de 45 min.',
  },
  {
    id: 'pay-3-old',
    studentId: 'student-3',
    title: 'Aula Avulso - Semana Anterior',
    type: 'aula_avulso',
    amount: 20,
    dueDate: getRelativeDate(-7),
    paidDate: getRelativeDate(-7),
    status: 'pago',
    paymentMethod: 'Dinheiro',
    receiptCode: 'REC-2026-02-098',
    notes: 'Pago no final da aula.',
  },

  // Student 1 (Inês - Paga / Regularizada)
  {
    id: 'pay-1',
    studentId: 'student-1',
    title: 'Mensalidade Estúdio (Guitarra Clássica)',
    type: 'mensalidade',
    amount: 75,
    dueDate: getRelativeDate(-2),
    paidDate: getRelativeDate(-4),
    status: 'pago',
    paymentMethod: 'MB WAY',
    receiptCode: 'REC-2026-03-019',
    notes: 'Pagamento recebido via MB WAY e validado com sucesso.',
  },
  {
    id: 'pay-1-old',
    studentId: 'student-1',
    title: 'Mensalidade Anterior',
    type: 'mensalidade',
    amount: 75,
    dueDate: getRelativeDate(-32),
    paidDate: getRelativeDate(-33),
    status: 'pago',
    paymentMethod: 'Transferência Bancária',
    receiptCode: 'REC-2026-02-014',
    notes: 'Comprovativo validado.',
  },

  // Student 5 (Beatriz - Paga Antecipadamente)
  {
    id: 'pay-5',
    studentId: 'student-5',
    title: 'Mensalidade Estúdio (Violino)',
    type: 'mensalidade',
    amount: 80,
    dueDate: getRelativeDate(5),
    paidDate: getRelativeDate(-1),
    status: 'pago',
    paymentMethod: 'Transferência Bancária',
    receiptCode: 'REC-2026-03-004',
    notes: 'Pago antecipadamente pelo encarregado de educação.',
  },
];

export const INITIAL_MATERIALS: StudyMaterial[] = [
  // Student 1 - Inês Santos (Guitarra Clássica)
  {
    id: 'mat-1',
    studentId: 'student-1',
    instrument: 'Guitarra Clássica',
    title: 'Estudo nº 1 em Mi menor - H. Villa-Lobos',
    category: 'partitura',
    description: 'Partitura com dedilhados originais de mão direita (p-i-m-a) para prática de arpejos fluidos.',
    targetBpm: 92,
    keySignature: 'Mi menor (Em)',
    fileType: 'pdf',
    contentUrl: 'https://imslp.org/wiki/Special:ImagefromIndex/244304/hca3',
    textContent: `Compasso 1 a 4:
Mão Direita: p - i - m - a - m - i (Arpejo contínuo)
Baixos: Mi (6ª corda) -> Lá (5ª corda) -> Si (5ª corda casa 2)
Cuidado com a tensão no polegar; manter o pulso arqueado e relaxado.`,
    teacherNotes: 'Começar a 65 BPM sem forçar velocidade. O objetivo é a igualdade sonora entre as notas da mão direita.',
    assignedDate: '2026-03-04',
    isCompleted: false,
    estimatedPracticeMinutes: 25,
  },
  {
    id: 'mat-2',
    studentId: 'student-1',
    instrument: 'Guitarra Clássica',
    title: 'Exercício de Pestanas e Resistência (Carcassi)',
    category: 'exercicio',
    description: 'Série de 8 compassos para treino de alinhamento do dedo indicador e pressão mínima nas casas 3 a 7.',
    targetBpm: 70,
    keySignature: 'Lá menor (Am)',
    fileType: 'tab',
    textContent: `E|---5---5---5---5-|---7---7---7---7-|
B|---5---5---5---5-|---7---7---7---7-|
G|---5---5---5---5-|---7---7---7---7-|
D|---7---7---7---7-|---9---9---9---9-|
A|---7---7---7---7-|---9---9---9---9-|
E|-5---------------|-7---------------|
   (Pestana Casa 5)   (Pestana Casa 7)`,
    teacherNotes: 'Não apertar o braço com força excessiva. Usar o peso do braço e antebraço para firmar a corda.',
    assignedDate: '2026-02-26',
    isCompleted: true,
    estimatedPracticeMinutes: 15,
  },
  {
    id: 'mat-3',
    studentId: 'student-1',
    instrument: 'Guitarra Clássica',
    title: 'Playalong: Greensleeves (Acompanhamento Áudio Lento)',
    category: 'audio_playalong',
    description: 'Pista de áudio guia gravada com contagem inicial para tocar a melodia por cima.',
    targetBpm: 80,
    keySignature: 'Lá Dórico',
    fileType: 'audio',
    contentUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    teacherNotes: 'Ouvir atentamente a entrada no tempo 3 do compasso em anacruse.',
    assignedDate: '2026-03-01',
    isCompleted: false,
    estimatedPracticeMinutes: 20,
  },

  // Student 2 - Tiago Costa (Guitarra Portuguesa)
  {
    id: 'mat-4',
    studentId: 'student-2',
    instrument: 'Guitarra Portuguesa',
    title: 'Variações em Lá menor para Guitarra Portuguesa (Estilo Lisboa)',
    category: 'partitura',
    description: 'Estudo de técnica de polegar e indicador, trinados e fraseado típico.',
    targetBpm: 105,
    keySignature: 'Lá menor',
    fileType: 'pdf',
    textContent: `Afinação de Lisboa: Ré - Lá - Si - Mi - Lá - Si
Dica: Praticar a técnica de unhas relaxada no polegar (figueta).`,
    teacherNotes: 'Presta atenção à clareza dos bordões e ao ataque limpo nas cordas duplas.',
    assignedDate: '2026-03-05',
    isCompleted: false,
    estimatedPracticeMinutes: 30,
  },
  {
    id: 'mat-5',
    studentId: 'student-2',
    instrument: 'Guitarra Portuguesa',
    title: 'Tablatura: Fado Corrido Tradicional',
    category: 'tablatura',
    description: 'Padrão rítmico e acompanhamento melódico tradicional.',
    targetBpm: 110,
    keySignature: 'Lá menor',
    fileType: 'tab',
    textContent: `B|-------0-1-0----------|-------1-3-1----------|
G|-----2-------2--------|-----2-------2--------|
D|---2-----------2------|---3-----------3------|`,
    teacherNotes: 'Manter a pulsação constante e o ritmo bem marcado.',
    assignedDate: '2026-03-04',
    isCompleted: true,
    estimatedPracticeMinutes: 20,
  },

  // Student 3 - Mariana Silva (Piano)
  {
    id: 'mat-6',
    studentId: 'student-3',
    instrument: 'Piano',
    title: 'Minueto em Sol Maior (BWV Anh. 114) - J. S. Bach',
    category: 'partitura',
    description: 'Partitura com indicação de dedilhados para mão direita e linha melódica do baixo na mão esquerda.',
    targetBpm: 84,
    keySignature: 'Sol Maior (1 sustenido: Fá#)',
    fileType: 'pdf',
    contentUrl: 'https://imslp.org/wiki/Special:ImagefromIndex/00748/toru',
    textContent: `Compassos 1-8:
Mão Direita: D5(3) - G4(1) A4(2) B4(3) C5(4) - D5(5) G4(1) G4(1) - E5(5) C5(3) D5(4) E5(5) F#5(5)
Mão Esquerda: G3(1) - B3(3) - A3(2) - G3(1) - F#3(2) - G3(1)`,
    teacherNotes: 'Treinar primeiro mãos separadas! Juntar só quando a mão esquerda tocar o tempo em 3/4 sem hesitação.',
    assignedDate: '2026-03-02',
    isCompleted: false,
    estimatedPracticeMinutes: 20,
  },
  {
    id: 'mat-7',
    studentId: 'student-3',
    instrument: 'Piano',
    title: 'Hanon - O Pianista Virtuoso (Exercício nº 1)',
    category: 'exercicio',
    description: 'Articulação independente de todos os 5 dedos com dedos 4 e 5 sem colapsar as falanges.',
    targetBpm: 75,
    keySignature: 'Dó Maior',
    fileType: 'pdf',
    teacherNotes: 'Elevar os dedos com firmeza e manter os pulsos estáveis sem balançar os ombros.',
    assignedDate: '2026-02-20',
    isCompleted: true,
    estimatedPracticeMinutes: 15,
  },

  // Student 4 - Diogo Ferreira (Ukulele)
  {
    id: 'mat-8',
    studentId: 'student-4',
    instrument: 'Ukulele',
    title: 'Estudo de Dedilhados e Batida Calypso para Ukulele',
    category: 'exercicio',
    description: 'Padrão rítmico clássico (Baixo - Baixo-Cima - Cima-Baixo-Cima) e transição C - G - Am - F.',
    targetBpm: 90,
    keySignature: 'Dó Maior (C)',
    fileType: 'pdf',
    textContent: `Afinação standard: G - C - E - A
Sequência de acordes:
| C   | G   | Am  | F   |
Ritmo: ↓  ↓↑  ↑↓↑`,
    teacherNotes: 'Manter a mão direita muito solta no pulso. Não usar tensão no antebraço.',
    assignedDate: '2026-03-01',
    isCompleted: false,
    estimatedPracticeMinutes: 25,
  },

  // Student 5 - Beatriz Lima (Guitarra Portuguesa)
  {
    id: 'mat-9',
    studentId: 'student-5',
    instrument: 'Guitarra Portuguesa',
    title: 'Balada de Coimbra para Guitarra Portuguesa',
    category: 'partitura',
    description: 'Tema tradicional com foco na afinação de Coimbra e fraseado expressivo cantabile.',
    targetBpm: 88,
    keySignature: 'Lá menor / Dó Maior',
    fileType: 'pdf',
    teacherNotes: 'Atenção aos trinados com dedo indicador e à dinâmica expressiva em piano/forte.',
    assignedDate: '2026-03-03',
    isCompleted: false,
    estimatedPracticeMinutes: 30,
  },
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'teacher-account-1',
    email: 'aulas.guitarra@gmail.com',
    name: 'Prof. André Martins (A Voz da Guitarra)',
    role: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    phone: '+351 910 000 111',
    createdAt: '2025-01-01',
  },
];
