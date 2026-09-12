import React, { useState } from 'react';
import {
  UserAccount,
  Student,
  ScheduleItem,
  PaymentRecord,
  StudentRegistrationData,
  PaymentPlanType,
} from '../../types';
import {
  registerNewStudent,
  saveStoredCurrentUser,
  getStoredRememberedStudentId,
  saveStoredRememberedStudentId,
  verifyTeacherPassword,
  getStoredTeacherSecurity,
  PRIMARY_TEACHER_EMAIL,
  isAuthorizedTeacherEmail,
} from '../../utils/storage';
import { GoogleAuthModal } from './GoogleAuthModal';
import { BrandLogo } from '../common/BrandLogo';
import {
  ShieldCheck,
  User,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthPortalProps {
  accounts: UserAccount[];
  students: Student[];
  schedules: ScheduleItem[];
  payments: PaymentRecord[];
  onLoginSuccess: (
    user: UserAccount,
    newStudents?: Student[],
    newSchedules?: ScheduleItem[],
    newPayments?: PaymentRecord[],
  ) => void;
  defaultRole?: 'aluno' | 'professor';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  accounts,
  students,
  schedules,
  payments,
  onLoginSuccess,
  defaultRole = 'aluno',
}) => {
  const [activeTab, setActiveTab] = useState<'aluno' | 'professor'>(defaultRole);
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleModalMode, setGoogleModalMode] = useState<'login' | 'register'>('login');
  const [googleRoleTarget, setGoogleRoleTarget] = useState<'aluno' | 'professor'>('aluno');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [teacherEmail, setTeacherEmail] = useState(PRIMARY_TEACHER_EMAIL);
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberedStudentId, setRememberedStudentId] = useState<string | null>(() =>
    getStoredRememberedStudentId(),
  );

  const teacherSecurity = getStoredTeacherSecurity();

  // Helper to check if student is one of the initial default/mock accounts
  const isDefaultDemoStudent = (id?: string | null) =>
    !id || id === 'student-1' || id === 'student-2' || id === 'student-3' || id === 'student-4' || id === 'student-5';

  // Only show remembered student if genuinely authenticated by the user, never default demo profiles
  const rememberedStudent =
    rememberedStudentId && !isDefaultDemoStudent(rememberedStudentId)
      ? students.find((s) => s.id === rememberedStudentId)
      : null;

  // Real-time matched student if student types their email (excluding default mock profiles)
  const matchedCandidate =
    loginEmail.trim().length >= 3
      ? students.find((s) => s.email.toLowerCase() === loginEmail.trim().toLowerCase())
      : null;
  const typedMatchedStudent =
    matchedCandidate && !isDefaultDemoStudent(matchedCandidate.id)
      ? matchedCandidate
      : null;

  // Student registration form state (simplified: no instrument, level, or modality menus)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPlan, setRegPlan] = useState<PaymentPlanType>('mensal');
  const [regNotes, setRegNotes] = useState('');

  // Handle student login
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailClean = loginEmail.trim().toLowerCase();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === emailClean && a.role === 'aluno',
    );

    if (!account) {
      // Check if email belongs to student in student list
      const studentMatch = students.find((s) => s.email.toLowerCase() === emailClean);
      if (studentMatch) {
        // Create an on-the-fly linked account
        const autoAccount: UserAccount = {
          id: `acc-${studentMatch.id}`,
          email: studentMatch.email,
          name: studentMatch.name,
          role: 'aluno',
          studentId: studentMatch.id,
          instrument: studentMatch.instrument,
          phone: studentMatch.phone,
          avatarUrl: studentMatch.avatarUrl,
          createdAt: new Date().toISOString().split('T')[0],
        };
        saveStoredCurrentUser(autoAccount);
        saveStoredRememberedStudentId(studentMatch.id);
        setRememberedStudentId(studentMatch.id);
        onLoginSuccess(autoAccount);
        return;
      }

      setErrorMsg('Não foi encontrada nenhuma conta de aluno com este email. Por favor, verifica ou faz o teu registo.');
      return;
    }

    // Optional password verification if account has one
    if (account.password && account.password.trim() !== '') {
      if (account.password !== loginPassword) {
        setErrorMsg('Palavra-passe incorreta. Por favor tenta novamente.');
        return;
      }
    }

    if (account.studentId) {
      saveStoredRememberedStudentId(account.studentId);
      setRememberedStudentId(account.studentId);
    }
    saveStoredCurrentUser(account);
    onLoginSuccess(account);
  };

  // Quick 1-click login for remembered student
  const handleRememberedLogin = () => {
    if (!rememberedStudent) return;
    const existingAcc = accounts.find(
      (a) => a.studentId === rememberedStudent.id || a.email === rememberedStudent.email,
    );
    const userToLogin: UserAccount = existingAcc || {
      id: `acc-${rememberedStudent.id}`,
      email: rememberedStudent.email,
      name: rememberedStudent.name,
      role: 'aluno',
      studentId: rememberedStudent.id,
      instrument: rememberedStudent.instrument,
      phone: rememberedStudent.phone,
      avatarUrl: rememberedStudent.avatarUrl,
      createdAt: '2025-01-01',
    };
    saveStoredCurrentUser(userToLogin);
    onLoginSuccess(userToLogin);
  };

  // Switch to another student account
  const handleForgetRemembered = () => {
    saveStoredRememberedStudentId('');
    setRememberedStudentId(null);
  };

  // Handle student registration (simplified: no instrument, level, or modality menus)
  const handleStudentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Por favor, preenche todos os campos obrigatórios (*).');
      return;
    }

    const emailClean = regEmail.trim().toLowerCase();
    const existing = accounts.find((a) => a.email.toLowerCase() === emailClean);
    if (existing) {
      setErrorMsg('Já existe uma conta associada a este email. Por favor, inicia sessão.');
      return;
    }

    const regData: StudentRegistrationData = {
      name: regName.trim(),
      email: emailClean,
      password: regPassword,
      phone: regPhone.trim() || '+351 910 000 000',
      instrument: 'Guitarra Clássica',
      level: 'Iniciante',
      paymentPlan: regPlan,
      preferredDayOfWeek: 2,
      preferredTime: '17:30',
      modality: 'presencial',
      notes: regNotes,
    };

    const { newStudent, newSchedule, newPayment, newAccount } = registerNewStudent(
      regData,
      students,
      schedules,
      payments,
      accounts,
    );

    onLoginSuccess(
      newAccount,
      [newStudent, ...students],
      [...schedules, newSchedule],
      [newPayment, ...payments],
    );
  };

  // Handle teacher login with strict email & password authorization
  const handleTeacherLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const emailClean = teacherEmail.trim().toLowerCase();
    if (!isAuthorizedTeacherEmail(emailClean)) {
      setErrorMsg(
        `Acesso Negado: O email "${teacherEmail}" não tem autorização para aceder à área de professor. Apenas o professor (${PRIMARY_TEACHER_EMAIL}) pode aceder.`,
      );
      return;
    }

    if (!teacherPassword || teacherPassword.trim().length === 0) {
      setErrorMsg('Por favor introduz a palavra-passe do professor para desbloquear a área privada.');
      return;
    }

    const isValid = await verifyTeacherPassword(teacherPassword);
    if (!isValid) {
      setErrorMsg('Palavra-passe de professor incorreta. Acesso não autorizado.');
      return;
    }

    // Verify teacher account
    let teacherAcc = accounts.find((a) => a.role === 'professor');
    if (!teacherAcc) {
      teacherAcc = {
        id: 'teacher-account-1',
        email: PRIMARY_TEACHER_EMAIL,
        name: 'Prof. André Martins (A Voz da Guitarra)',
        role: 'professor',
        createdAt: '2025-01-01',
      };
    } else {
      teacherAcc = {
        ...teacherAcc,
        email: PRIMARY_TEACHER_EMAIL,
      };
    }

    saveStoredCurrentUser(teacherAcc);
    onLoginSuccess(teacherAcc);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Brand Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <BrandLogo size="lg" className="w-16 h-16 shadow-lg ring-4 ring-white/10 mb-4" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-indigo-300 mb-1">
              Escola de Música Online & Presencial
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">A Voz da Guitarra</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
              Área Exclusiva de Acesso e Gestão das Aulas
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            id="tab-btn-aluno"
            onClick={() => {
              setActiveTab('aluno');
              setErrorMsg(null);
            }}
            className={`flex-1 py-4 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'aluno'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Área do Aluno</span>
          </button>

          <button
            type="button"
            id="tab-btn-professor"
            onClick={() => {
              setActiveTab('professor');
              setErrorMsg(null);
            }}
            className={`flex-1 py-4 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'professor'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Área do Professor</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
              Restrito
            </span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-3 animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* TAB: ALUNO */}
        {activeTab === 'aluno' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Quick Remembered Student Card */}
            {rememberedStudent && studentMode === 'login' && (
              <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      rememberedStudent.avatarUrl ||
                      `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(
                        rememberedStudent.name,
                      )}`
                    }
                    alt={rememberedStudent.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-300 shadow-xs"
                  />
                  <div>
                    <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      Sessão Rápida
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      {rememberedStudent.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {rememberedStudent.email}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    id="btn-quick-login-student"
                    onClick={handleRememberedLogin}
                    className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Entrar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleForgetRemembered}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline p-1 text-center cursor-pointer"
                  >
                    Trocar
                  </button>
                </div>
              </div>
            )}

            {/* Mode Switcher: Login vs Registar */}
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                id="tab-aluno-login"
                onClick={() => {
                  setStudentMode('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  studentMode === 'login'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 inline mr-1.5" />
                Já sou Aluno (Entrar)
              </button>

              <button
                type="button"
                id="tab-aluno-register"
                onClick={() => {
                  setStudentMode('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  studentMode === 'register'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
                Novo Aluno (Registar)
              </button>
            </div>

            {/* FORM: REGISTO DE NOVO ALUNO (SIMPLIFICADO) */}
            {studentMode === 'register' ? (
              <div className="space-y-4">
                {/* Google Quick Registration Option */}
                <div className="space-y-3">
                  <button
                    type="button"
                    id="btn-google-register"
                    onClick={() => {
                      setGoogleRoleTarget('aluno');
                      setGoogleModalMode('register');
                      setIsGoogleModalOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold rounded-2xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-all hover:border-slate-400 cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Registar Aluno com Conta Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative">
                      ou preencher dados
                    </span>
                  </div>
                </div>

                <form onSubmit={handleStudentRegister} className="space-y-4">
                  <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
                    <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Regista-te para aceder à tua área pessoal:</span>
                      Consulta o teu horário semanal, estado dos pagamentos e materiais de estudo enviados pelo teu professor.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: João Miguel Silva"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="joao.silva@email.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Telemóvel / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+351 912 345 678"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Palavra-passe
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plano de Aulas
                    </label>
                    <select
                      value={regPlan}
                      onChange={(e) => setRegPlan(e.target.value as PaymentPlanType)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
                    >
                      <option value="mensal">Mensalidade (Aulas Regulares Semanais)</option>
                      <option value="por_aula">Aulas Avulsas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Objetivos ou observações (opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Quero aprender a tocar fado e dedilhado clássico..."
                      value={regNotes}
                      onChange={(e) => setRegNotes(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    id="btn-concluir-registo-aluno"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Concluir Registo e Entrar na Minha Área</span>
                  </button>
                </form>
              </div>
            ) : (
              /* FORM: LOGIN DO ALUNO */
              <div className="space-y-6">
                {/* Google Login Option Button */}
                <div className="space-y-3">
                  <button
                    type="button"
                    id="btn-google-login"
                    onClick={() => {
                      setGoogleRoleTarget('aluno');
                      setGoogleModalMode('login');
                      setIsGoogleModalOpen(true);
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold rounded-2xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-all hover:border-slate-400 cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Entrar com Conta Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative">
                      ou entrar com email e palavra-passe
                    </span>
                  </div>
                </div>

                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email do Aluno
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="teu.email@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                    {typedMatchedStudent && (
                      <div className="mt-1.5 text-[11px] text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aluno reconhecido: <strong>{typedMatchedStudent.name}</strong></span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Palavra-passe (opcional se não definida)
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-login-aluno"
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Entrar na Minha Área de Aluno</span>
                  </button>
                </form>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-400">
                    Privacidade garantida: cada aluno acede unicamente aos seus horários, pagamentos e materiais.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: PROFESSOR (TEACHER ACCESS ONLY) */}
        {activeTab === 'professor' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Acesso Restrito ao Professor
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Apenas o professor ({PRIMARY_TEACHER_EMAIL}) tem acesso a todos os alunos, controlo de pagamentos e envio de materiais. Os alunos só conseguem aceder à sua própria área individual.
                </p>
              </div>
            </div>

            {/* Google Login for Teacher */}
            <div className="space-y-3">
              <button
                type="button"
                id="btn-google-teacher-login"
                onClick={() => {
                  setGoogleRoleTarget('professor');
                  setGoogleModalMode('login');
                  setIsGoogleModalOpen(true);
                }}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold rounded-2xl border-2 border-slate-300 hover:border-slate-400 shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer ring-1 ring-slate-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Conta Google (Professor)</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative">
                  ou entrar com palavra-passe protegida
                </span>
              </div>
            </div>

            <form onSubmit={handleTeacherLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email do Professor (Autorizado)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Palavra-passe do Professor
                  </label>
                  {teacherSecurity.hasCustomPassword ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Palavra-passe Personalizada Ativa
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">
                      (Acesso inicial padrão)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    required
                    placeholder="Digita a tua palavra-passe do professor..."
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {teacherSecurity.hasCustomPassword
                    ? 'Protegido com a tua palavra-passe personalizada definida nas configurações.'
                    : 'Podes aceder diretamente através do botão do Google acima ou com a tua palavra-passe.'}
                </p>
              </div>

              <button
                type="submit"
                id="btn-login-professor"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Entrar no Painel do Professor</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer Note */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>A Voz da Guitarra • Sistema de Gestão</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            Acesso Protegido
          </span>
        </div>
      </div>

      {/* Google Authentication Dialog */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        mode={googleModalMode}
        roleTarget={googleRoleTarget}
        students={students}
        schedules={schedules}
        payments={payments}
        accounts={accounts}
        onSuccess={(loggedUser, updatedStudents, updatedAccounts) => {
          onLoginSuccess(loggedUser, updatedStudents, schedules, payments);
        }}
      />
    </div>
  );
};
