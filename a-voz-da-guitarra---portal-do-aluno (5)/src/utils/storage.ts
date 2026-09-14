import {
  Student,
  ScheduleItem,
  PaymentRecord,
  StudyMaterial,
  UserAccount,
  StudentRegistrationData,
  TeacherStudioSettings,
  TeacherSecurityConfig,
  InstrumentType,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SCHEDULES,
  INITIAL_PAYMENTS,
  INITIAL_MATERIALS,
  INITIAL_ACCOUNTS,
} from '../mockData';

const STORAGE_KEYS = {
  STUDENTS: 'music_school_students_v1',
  SCHEDULES: 'music_school_schedules_v1',
  PAYMENTS: 'music_school_payments_v2',
  MATERIALS: 'music_school_materials_v1',
  CURRENT_STUDENT_ID: 'music_school_current_student_v1',
  APP_MODE: 'music_school_app_mode_v1',
  ACCOUNTS: 'music_school_accounts_v1',
  CURRENT_USER: 'music_school_current_user_v1',
  REMEMBERED_STUDENT_ID: 'music_school_remembered_student_id_v1',
  TEACHER_SETTINGS: 'music_school_teacher_settings_v1',
  TEACHER_SECURITY: 'music_school_teacher_security_v1',
};

export const PRIMARY_TEACHER_EMAIL = 'aulas.guitarra@gmail.com';
export const AUTHORIZED_TEACHER_EMAILS = [
  'aulas.guitarra@gmail.com',
  'avodaguitarra@gmail.com',
];

export const ALLOWED_INSTRUMENTS: InstrumentType[] = [
  'Guitarra Clássica',
  'Piano',
  'Ukulele',
  'Guitarra Portuguesa',
];

export const isAuthorizedTeacherEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return AUTHORIZED_TEACHER_EMAILS.some((t) => t.toLowerCase() === clean);
};

export const DEFAULT_TEACHER_SETTINGS: TeacherStudioSettings = {
  teacherName: 'Prof. Sérgio Gomes',
  email: PRIMARY_TEACHER_EMAIL,
  phone: '+351 910 000 111',
  mainInstrument: 'Guitarra Clássica',
  instrumentsTaught: [
    'Guitarra Clássica',
    'Piano',
    'Ukulele',
    'Guitarra Portuguesa',
  ],
  defaultMonthlyFee: 75,
  defaultPerLessonFee: 22,
  currency: '€',
  lessonDurationMinutes: 60,
  studioAddress: 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
  paymentInfo: {
    mbwayPhone: '910 000 111',
    iban: 'PT50 0033 0000 1234 5678 9012 3',
    accountHolder: 'Sérgio Gomes (A Voz da Guitarra)',
    acceptsCash: true,
    cashInstructions:
      'Pagamento presencial em numerário entregue no estúdio (Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga) no início da aula.',
  },
  studioBio: 'Aulas personalizadas no estúdio e online com foco na técnica, expressividade musical e repertório à escolha do aluno.',
  updatedAt: '2026-03-01',
};

export async function hashPassword(password: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + '_voz_da_guitarra_salt_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // fallback
  }
  let hash = 0;
  const str = password + '_voz_da_guitarra_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}

export const getStoredTeacherSettings = (): TeacherStudioSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TEACHER_SETTINGS, JSON.stringify(DEFAULT_TEACHER_SETTINGS));
      return DEFAULT_TEACHER_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const validInstruments = (parsed.instrumentsTaught || []).filter((i: string) =>
      ALLOWED_INSTRUMENTS.includes(i as InstrumentType),
    );
    const instrumentsTaught =
      validInstruments.length > 0 ? validInstruments : ALLOWED_INSTRUMENTS;
    const mainInstrument = ALLOWED_INSTRUMENTS.includes(parsed.mainInstrument)
      ? parsed.mainInstrument
      : 'Guitarra Clássica';

    // Migrate old teacher name if present in localStorage
    let teacherName = parsed.teacherName || 'Prof. Sérgio Gomes';
    if (teacherName.toLowerCase().includes('andré') || teacherName.toLowerCase().includes('andre')) {
      teacherName = 'Prof. Sérgio Gomes';
    }

    let accountHolder = parsed.paymentInfo?.accountHolder || 'Sérgio Gomes (A Voz da Guitarra)';
    if (accountHolder.toLowerCase().includes('andré') || accountHolder.toLowerCase().includes('andre')) {
      accountHolder = 'Sérgio Gomes (A Voz da Guitarra)';
    }

    return {
      ...DEFAULT_TEACHER_SETTINGS,
      ...parsed,
      teacherName,
      instrumentsTaught,
      mainInstrument,
      lessonDurationMinutes: parsed.lessonDurationMinutes || 60,
      studioAddress: parsed.studioAddress || 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
      paymentInfo: {
        ...DEFAULT_TEACHER_SETTINGS.paymentInfo,
        ...(parsed.paymentInfo || {}),
        accountHolder,
        acceptsCash: parsed.paymentInfo?.acceptsCash ?? true,
      },
    };
  } catch {
    return DEFAULT_TEACHER_SETTINGS;
  }
};

export const saveStoredTeacherSettings = (settings: TeacherStudioSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHER_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save teacher settings:', e);
  }
};

export const getStoredTeacherSecurity = (): TeacherSecurityConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_SECURITY);
    if (!raw) {
      return { hasCustomPassword: false };
    }
    return JSON.parse(raw);
  } catch {
    return { hasCustomPassword: false };
  }
};

export const saveStoredTeacherSecurity = (config: TeacherSecurityConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEACHER_SECURITY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save teacher security:', e);
  }
};

export const verifyTeacherPassword = async (enteredPassword: string): Promise<boolean> => {
  if (!enteredPassword || enteredPassword.trim().length === 0) {
    return false;
  }
  const config = getStoredTeacherSecurity();
  if (!config.hasCustomPassword || !config.passwordHash) {
    // If no custom password configured yet, strictly allow the authorized master passwords
    const trimmed = enteredPassword.trim();
    return trimmed === 'guitarra2026' || trimmed === 'professor123' || trimmed === 'aulas.guitarra';
  }
  const enteredHash = await hashPassword(enteredPassword);
  return enteredHash === config.passwordHash || (!!config.plainPassword && config.plainPassword === enteredPassword);
};

export const getStoredRememberedStudentId = (): string | null => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.REMEMBERED_STUDENT_ID);
    // Never remember or suggest default mock profiles
    if (!val || val === 'student-1' || val === 'student-2' || val === 'student-3' || val === 'student-4' || val === 'student-5') {
      return null;
    }
    return val;
  } catch {
    return null;
  }
};

export const saveStoredRememberedStudentId = (studentId: string | null): void => {
  try {
    if (studentId) {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_STUDENT_ID, studentId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBERED_STUDENT_ID);
    }
  } catch (e) {
    console.error('Failed to save remembered student id:', e);
  }
};

export const getStoredAccounts = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    const parsed: UserAccount[] = JSON.parse(raw);
    const defaultMockStudentIds = new Set(['student-1', 'student-2', 'student-3', 'student-4', 'student-5']);
    const defaultMockAccountIds = new Set(['account-student-1', 'account-student-2', 'account-student-3', 'account-student-4', 'account-student-5']);
    
    // Filter out default mock student accounts to ensure clean login and registration
    const cleaned = parsed.filter(
      (acc) =>
        !defaultMockAccountIds.has(acc.id) &&
        (!acc.studentId || !defaultMockStudentIds.has(acc.studentId)),
    );

    let modified = cleaned.length !== parsed.length;
    const updated = cleaned.map((acc) => {
      if (acc.role === 'professor' && (acc.email === 'aulas.guitarra@gmail.com' || !acc.email)) {
        modified = true;
        return { ...acc, email: 'avodaguitarra@gmail.com' };
      }
      return acc;
    });
    if (modified) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    }
    return updated;
  } catch {
    return INITIAL_ACCOUNTS;
  }
};

export const saveStoredAccounts = (accounts: UserAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts:', e);
  }
};

export const getStoredCurrentUser = (): UserAccount | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    const user: UserAccount = JSON.parse(raw);
    if (user.role === 'professor' && user.email === 'aulas.guitarra@gmail.com') {
      user.email = 'avodaguitarra@gmail.com';
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
    return user;
  } catch {
    return null;
  }
};

export const saveStoredCurrentUser = (user: UserAccount | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  } catch (e) {
    console.error('Failed to save current user:', e);
  }
};

export const registerNewStudent = (
  regData: StudentRegistrationData,
  existingStudents: Student[],
  existingSchedules: ScheduleItem[],
  existingPayments: PaymentRecord[],
  existingAccounts: UserAccount[],
): {
  newStudent: Student;
  newSchedule: ScheduleItem;
  newPayment: PaymentRecord;
  newAccount: UserAccount;
} => {
  const newStudentId = `student-${Date.now()}`;
  const now = new Date();
  const currentMonthName = now.toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric',
  });
  const formattedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const teacherSettings = getStoredTeacherSettings();
  const selectedInstrument = (regData.instrument || 'Guitarra Clássica') as InstrumentType;
  const selectedLevel = regData.level || 'Iniciante';
  const selectedPlan = regData.paymentPlan || 'mensal';
  const selectedPhone = regData.phone?.trim() || '+351 910 000 000';
  const selectedModality = regData.modality || 'presencial';

  const calculatedMonthly = selectedPlan === 'mensal' ? teacherSettings.defaultMonthlyFee : 0;
  const calculatedPerLesson = teacherSettings.defaultPerLessonFee;

  const newStudent: Student = {
    id: newStudentId,
    name: regData.name.trim(),
    email: regData.email.trim().toLowerCase(),
    phone: selectedPhone,
    instrument: selectedInstrument,
    level: selectedLevel,
    avatarUrl: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(regData.name)}`,
    paymentPlan: selectedPlan,
    monthlyFee: calculatedMonthly || teacherSettings.defaultMonthlyFee,
    perLessonFee: calculatedPerLesson,
    currentMonthStatus: 'pendente',
    currentMonthName: formattedMonth,
    notes: regData.notes || 'Novo aluno registado no portal.',
    joinedDate: now.toISOString().split('T')[0],
  };

  const newSchedule: ScheduleItem = {
    id: `sch-${Date.now()}`,
    studentId: newStudentId,
    dayOfWeek: regData.preferredDayOfWeek ?? 2, // Default Terça-feira
    startTime: regData.preferredTime || '17:30',
    durationMinutes: teacherSettings.lessonDurationMinutes || 60,
    modality: selectedModality,
    locationOrLink:
      selectedModality === 'online'
        ? 'https://meet.google.com/voz-guitarra-aula'
        : (teacherSettings.studioAddress || 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga'),
    roomName: selectedModality === 'online' ? 'Sala Virtual (Google Meet)' : 'Sala 6 (1º Andar)',
    teacherName: teacherSettings.teacherName || 'Prof. Sérgio Gomes',
    focusArea: `Iniciação e desenvolvimento musical`,
  };

  // Due date: 7 days from now
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const newPayment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    studentId: newStudentId,
    title: `Mensalidade ${formattedMonth}`,
    type: selectedPlan === 'mensal' ? 'mensalidade' : 'aula_avulso',
    amount: selectedPlan === 'mensal' ? newStudent.monthlyFee : newStudent.perLessonFee,
    dueDate: dueDate,
    status: 'pendente',
    notes: 'Inscrição efetuada online pelo aluno.',
  };

  const newAccount: UserAccount = {
    id: `acc-${Date.now()}`,
    email: regData.email.trim().toLowerCase(),
    name: regData.name.trim(),
    role: 'aluno',
    studentId: newStudentId,
    instrument: selectedInstrument,
    phone: selectedPhone,
    avatarUrl: newStudent.avatarUrl,
    createdAt: now.toISOString().split('T')[0],
  };

  // Update storage
  saveStoredStudents([newStudent, ...existingStudents]);
  saveStoredSchedules([...existingSchedules, newSchedule]);
  saveStoredPayments([newPayment, ...existingPayments]);
  saveStoredAccounts([...existingAccounts, newAccount]);
  saveStoredCurrentUser(newAccount);
  saveStoredCurrentStudentId(newStudentId);
  saveStoredRememberedStudentId(newStudentId);

  return { newStudent, newSchedule, newPayment, newAccount };
};

export const registerOrLoginGoogleStudent = (
  googleUser: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId?: string;
  },
  existingStudents: Student[],
  existingSchedules: ScheduleItem[],
  existingPayments: PaymentRecord[],
  existingAccounts: UserAccount[],
  options?: {
    instrument?: InstrumentType;
    level?: 'Iniciante' | 'Intermédio' | 'Avançado';
    paymentPlan?: 'mensal' | 'por_aula';
    phone?: string;
  },
): {
  isNewUser: boolean;
  user: UserAccount;
  student?: Student;
  updatedStudents: Student[];
  updatedAccounts: UserAccount[];
} => {
  const normEmail = googleUser.email.trim().toLowerCase();

  // If this email is the authorized teacher, log in directly as professor!
  if (isAuthorizedTeacherEmail(normEmail)) {
    let teacherAcc = existingAccounts.find((a) => a.role === 'professor');
    if (!teacherAcc) {
      teacherAcc = {
        id: 'teacher-account-1',
        email: PRIMARY_TEACHER_EMAIL,
        name: googleUser.name || 'Prof. Sérgio Gomes (A Voz da Guitarra)',
        role: 'professor',
        avatarUrl:
          googleUser.avatarUrl ||
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
        phone: '+351 910 000 111',
        authProvider: 'google',
        createdAt: '2025-01-01',
      };
      const updatedAccounts = [teacherAcc, ...existingAccounts];
      saveStoredAccounts(updatedAccounts);
      saveStoredCurrentUser(teacherAcc);
      return {
        isNewUser: false,
        user: teacherAcc,
        student: existingStudents[0],
        updatedStudents: existingStudents,
        updatedAccounts,
      };
    } else {
      const updatedTeacherAcc: UserAccount = {
        ...teacherAcc,
        email: PRIMARY_TEACHER_EMAIL,
        name: googleUser.name || teacherAcc.name,
        avatarUrl: googleUser.avatarUrl || teacherAcc.avatarUrl,
        authProvider: 'google',
        googleId: googleUser.googleId || teacherAcc.googleId,
      };
      const updatedAccounts = existingAccounts.map((a) =>
        a.id === updatedTeacherAcc.id ? updatedTeacherAcc : a,
      );
      saveStoredAccounts(updatedAccounts);
      saveStoredCurrentUser(updatedTeacherAcc);
      return {
        isNewUser: false,
        user: updatedTeacherAcc,
        student: existingStudents[0],
        updatedStudents: existingStudents,
        updatedAccounts,
      };
    }
  }

  const existingAcc = existingAccounts.find(
    (a) => a.email.toLowerCase() === normEmail && a.role === 'aluno',
  );
  const existingStud = existingStudents.find((s) => s.email.toLowerCase() === normEmail);

  if (existingAcc && existingStud) {
    const updatedAcc: UserAccount = {
      ...existingAcc,
      avatarUrl: googleUser.avatarUrl || existingAcc.avatarUrl,
      authProvider: 'google',
      googleId: googleUser.googleId || existingAcc.googleId,
    };
    const updatedAccounts = existingAccounts.map((a) => (a.id === updatedAcc.id ? updatedAcc : a));
    saveStoredAccounts(updatedAccounts);
    saveStoredCurrentUser(updatedAcc);
    saveStoredCurrentStudentId(existingStud.id);
    saveStoredRememberedStudentId(existingStud.id);

    return {
      isNewUser: false,
      user: updatedAcc,
      student: existingStud,
      updatedStudents: existingStudents,
      updatedAccounts,
    };
  }

  // Register new student from Google profile
  const teacherSettings = getStoredTeacherSettings();
  const defaultInst = (options?.instrument || 'Guitarra Clássica') as InstrumentType;
  const regResult = registerNewStudent(
    {
      name: googleUser.name || 'Aluno Google',
      email: normEmail,
      phone: options?.phone || '+351 900 000 000',
      instrument: defaultInst,
      level: options?.level || 'Iniciante',
      paymentPlan: options?.paymentPlan || 'mensal',
      notes: 'Conta registada via autenticação Google.',
    },
    existingStudents,
    existingSchedules,
    existingPayments,
    existingAccounts,
  );

  // Update account with Google provider and avatar
  const googleAccount: UserAccount = {
    ...regResult.newAccount,
    avatarUrl: googleUser.avatarUrl || regResult.newAccount.avatarUrl,
    authProvider: 'google',
    googleId: googleUser.googleId,
  };

  const updatedAccounts = [googleAccount, ...existingAccounts];
  saveStoredAccounts(updatedAccounts);
  saveStoredCurrentUser(googleAccount);

  return {
    isNewUser: true,
    user: googleAccount,
    student: regResult.newStudent,
    updatedStudents: [regResult.newStudent, ...existingStudents],
    updatedAccounts,
  };
};

const normalizeInstrument = (inst?: string): InstrumentType => {
  if (!inst) return 'Guitarra Clássica';
  if (ALLOWED_INSTRUMENTS.includes(inst as InstrumentType)) {
    return inst as InstrumentType;
  }
  if (inst.toLowerCase().includes('elétrica') || inst.toLowerCase().includes('violino')) {
    return 'Guitarra Portuguesa';
  }
  if (inst.toLowerCase().includes('bateria') || inst.toLowerCase().includes('baixo')) {
    return 'Ukulele';
  }
  if (inst.toLowerCase().includes('teclado')) {
    return 'Piano';
  }
  return 'Guitarra Clássica';
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed: Student[] = JSON.parse(raw);
    return parsed.map((s) => ({
      ...s,
      instrument: normalizeInstrument(s.instrument),
    }));
  } catch {
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students:', e);
  }
};

export const getStoredSchedules = (): ScheduleItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
      return INITIAL_SCHEDULES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SCHEDULES;
  }
};

export const saveStoredSchedules = (schedules: ScheduleItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  } catch (e) {
    console.error('Failed to save schedules:', e);
  }
};

export const getStoredPayments = (): PaymentRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
};

export const saveStoredPayments = (payments: PaymentRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error('Failed to save payments:', e);
  }
};

export const getStoredMaterials = (): StudyMaterial[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(INITIAL_MATERIALS));
      return INITIAL_MATERIALS;
    }
    const parsed: StudyMaterial[] = JSON.parse(raw);
    return parsed.map((m) => ({
      ...m,
      instrument: normalizeInstrument(m.instrument),
    }));
  } catch {
    return INITIAL_MATERIALS;
  }
};

export const saveStoredMaterials = (materials: StudyMaterial[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  } catch (e) {
    console.error('Failed to save materials:', e);
  }
};

export const getStoredCurrentStudentId = (): string => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
    return val || 'student-1';
  } catch {
    return 'student-1';
  }
};

export const saveStoredCurrentStudentId = (id: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, id);
  } catch (e) {
    console.error(e);
  }
};

export const removeStudentFromStorage = (
  studentId: string,
  currentStudents: Student[],
  currentSchedules: ScheduleItem[],
  currentPayments: PaymentRecord[],
  currentMaterials: StudyMaterial[],
  currentAccounts: UserAccount[],
): {
  updatedStudents: Student[];
  updatedSchedules: ScheduleItem[];
  updatedPayments: PaymentRecord[];
  updatedMaterials: StudyMaterial[];
  updatedAccounts: UserAccount[];
} => {
  const updatedStudents = currentStudents.filter((s) => s.id !== studentId);
  const updatedSchedules = currentSchedules.filter((sch) => sch.studentId !== studentId);
  const updatedPayments = currentPayments.filter((p) => p.studentId !== studentId);
  const updatedMaterials = currentMaterials.filter((m) => m.studentId !== studentId);
  const updatedAccounts = currentAccounts.filter((a) => a.studentId !== studentId);

  saveStoredStudents(updatedStudents);
  saveStoredSchedules(updatedSchedules);
  saveStoredPayments(updatedPayments);
  saveStoredMaterials(updatedMaterials);
  saveStoredAccounts(updatedAccounts);

  const remembered = getStoredRememberedStudentId();
  if (remembered === studentId) {
    saveStoredRememberedStudentId(null);
  }

  return {
    updatedStudents,
    updatedSchedules,
    updatedPayments,
    updatedMaterials,
    updatedAccounts,
  };
};

export const resetToDefaults = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(INITIAL_MATERIALS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, 'student-1');
  } catch (e) {
    console.error(e);
  }
};
