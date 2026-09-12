export type UserRole = 'professor' | 'aluno';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string; // Links to Student.id if role === 'aluno'
  avatarUrl?: string;
  phone?: string;
  instrument?: InstrumentType;
  authProvider?: 'email' | 'google';
  googleId?: string;
  createdAt: string;
}

export interface TeacherStudioSettings {
  teacherName: string;
  email: string;
  phone: string;
  mainInstrument: string;
  instrumentsTaught: string[];
  defaultMonthlyFee: number; // e.g. 75
  defaultPerLessonFee: number; // e.g. 22
  currency: string; // "€"
  lessonDurationMinutes: number; // 60
  studioAddress?: string; // "Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga"
  paymentInfo: {
    mbwayPhone: string;
    iban: string;
    accountHolder: string;
    acceptsCash?: boolean;
    cashInstructions?: string;
  };
  studioBio?: string;
  updatedAt: string;
}

export interface TeacherSecurityConfig {
  hasCustomPassword: boolean;
  passwordHash?: string;
  plainPassword?: string;
  lastChangedDate?: string;
}

export interface StudentRegistrationData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  instrument?: InstrumentType;
  level?: 'Iniciante' | 'Intermédio' | 'Avançado';
  paymentPlan?: PaymentPlanType;
  preferredDayOfWeek?: number; // 1-6
  preferredTime?: string; // e.g. "17:00"
  modality?: ModalityType;
  notes?: string;
}

export type InstrumentType =
  | 'Guitarra Clássica'
  | 'Piano'
  | 'Ukulele'
  | 'Guitarra Portuguesa';

export type PaymentPlanType = 'mensal' | 'por_aula';

export type PaymentStatus = 'pago' | 'pendente' | 'atrasado';

export type ModalityType = 'presencial' | 'online';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  instrument: InstrumentType;
  level: 'Iniciante' | 'Intermédio' | 'Avançado';
  avatarUrl?: string;
  paymentPlan: PaymentPlanType;
  monthlyFee: number; // e.g. 75€
  perLessonFee: number; // e.g. 20€
  currentMonthStatus: PaymentStatus;
  currentMonthName: string; // e.g. "Março 2026"
  notes?: string;
  joinedDate: string;
}

export interface ScheduleItem {
  id: string;
  studentId: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  startTime: string; // "16:00"
  durationMinutes: number; // 50
  modality: ModalityType;
  locationOrLink: string; // "Sala 2 (Pisos 1)" ou "https://meet.google.com/abc-defg-hij"
  roomName: string;
  teacherName: string;
  focusArea?: string; // "Técnica de escalas e dedilhado"
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  title: string; // "Mensalidade Março 2026" ou "Aula de 04/03 - Modos Gregos"
  type: 'mensalidade' | 'aula_avulso';
  amount: number;
  dueDate: string; // "2026-03-08"
  paidDate?: string;
  status: PaymentStatus;
  paymentMethod?: 'MB WAY' | 'Transferência Bancária' | 'Dinheiro' | 'Multibanco' | 'Cartão';
  receiptCode?: string;
  notes?: string;
}

export type MaterialCategory =
  | 'partitura'
  | 'tablatura'
  | 'audio_playalong'
  | 'exercicio'
  | 'video_aula'
  | 'teoria';

export interface StudyMaterial {
  id: string;
  studentId?: string | 'all'; // 'all' means available to all students of the instrument
  instrument: InstrumentType;
  title: string;
  category: MaterialCategory;
  description: string;
  targetBpm?: number;
  keySignature?: string;
  fileType: 'pdf' | 'audio' | 'tab' | 'video' | 'link' | 'cifra';
  contentUrl?: string; // link or audio url
  textContent?: string; // for tab or chords text preview
  teacherNotes?: string;
  assignedDate: string;
  isCompleted?: boolean;
  estimatedPracticeMinutes?: number;
}
