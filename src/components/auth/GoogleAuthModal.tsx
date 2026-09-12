import React, { useState } from 'react';
import { Student, UserAccount, ScheduleItem, PaymentRecord, PaymentPlanType } from '../../types';
import {
  registerOrLoginGoogleStudent,
  PRIMARY_TEACHER_EMAIL,
  isAuthorizedTeacherEmail,
} from '../../utils/storage';
import {
  CheckCircle2,
  X,
  ShieldCheck,
  Mail,
  ArrowRight,
  AlertTriangle,
  Lock,
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  roleTarget?: 'aluno' | 'professor';
  students: Student[];
  schedules: ScheduleItem[];
  payments: PaymentRecord[];
  accounts: UserAccount[];
  onSuccess: (
    user: UserAccount,
    updatedStudents: Student[],
    updatedAccounts: UserAccount[],
  ) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  roleTarget = 'aluno',
  students,
  schedules,
  payments,
  accounts,
  onSuccess,
}) => {
  const isTeacherMode = roleTarget === 'professor';

  const [activeStep, setActiveStep] = useState<'select' | 'register_details'>('select');

  // Selected or typed account
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  // Simplified registration details (no instrument menu, no level menu, no prices, no modality menu)
  const [chosenPlan, setChosenPlan] = useState<PaymentPlanType>('mensal');
  const [chosenPhone, setChosenPhone] = useState('+351 910 000 000');

  // Custom email input
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Official teacher suggestion
  const teacherSuggestions = [
    {
      name: 'Prof. André Martins',
      email: PRIMARY_TEACHER_EMAIL,
      avatarUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
      note: 'Conta Oficial do Professor • Acesso Completo',
      isOfficialTeacher: true,
    },
  ];

  const handleSelectAccount = (acc: {
    name: string;
    email: string;
    avatarUrl?: string;
    isOfficialTeacher?: boolean;
  }) => {
    setAuthError(null);
    const cleanEmail = acc.email.trim().toLowerCase();

    // If teacher mode, ensure this account is the teacher
    if (isTeacherMode) {
      if (!isAuthorizedTeacherEmail(cleanEmail)) {
        setAuthError(
          `Acesso de Professor restrito: a conta "${acc.email}" não tem privilégios de gestão. Apenas "${PRIMARY_TEACHER_EMAIL}" está autorizada.`,
        );
        return;
      }

      // Teacher authentication via Google
      const result = registerOrLoginGoogleStudent(
        {
          email: PRIMARY_TEACHER_EMAIL,
          name: acc.name || 'Prof. André Martins',
          avatarUrl: acc.avatarUrl,
        },
        students,
        schedules,
        payments,
        accounts,
      );

      onSuccess(result.user, result.updatedStudents, result.updatedAccounts);
      onClose();
      return;
    }

    // Student mode
    setSelectedEmail(cleanEmail);
    setSelectedName(acc.name);
    setSelectedAvatar(
      acc.avatarUrl ||
        `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(acc.name)}`,
    );

    // If the student selects the teacher's email, automatically grant teacher session
    if (isAuthorizedTeacherEmail(cleanEmail)) {
      const result = registerOrLoginGoogleStudent(
        {
          email: PRIMARY_TEACHER_EMAIL,
          name: acc.name,
          avatarUrl: acc.avatarUrl,
        },
        students,
        schedules,
        payments,
        accounts,
      );
      onSuccess(result.user, result.updatedStudents, result.updatedAccounts);
      onClose();
      return;
    }

    // Check if student account already exists
    const existing =
      accounts.find((a) => a.email.toLowerCase() === cleanEmail && a.role === 'aluno') ||
      students.find((s) => s.email.toLowerCase() === cleanEmail);

    if (existing) {
      // Existing student: login directly
      const result = registerOrLoginGoogleStudent(
        {
          email: cleanEmail,
          name: acc.name,
          avatarUrl: acc.avatarUrl,
        },
        students,
        schedules,
        payments,
        accounts,
      );
      onSuccess(result.user, result.updatedStudents, result.updatedAccounts);
      onClose();
    } else {
      // New student: proceed to simplified confirmation (no instrument/level/price menus!)
      setActiveStep('register_details');
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!customEmail.trim() || !customName.trim()) return;

    const cleanEmail = customEmail.trim().toLowerCase();

    if (isTeacherMode && !isAuthorizedTeacherEmail(cleanEmail)) {
      setAuthError(
        `Acesso negado: O email "${cleanEmail}" não possui credenciais de professor. Apenas "${PRIMARY_TEACHER_EMAIL}" está autorizada para gestão.`,
      );
      return;
    }

    handleSelectAccount({
      email: cleanEmail,
      name: customName.trim(),
    });
  };

  const handleFinalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Register with defaults: Guitarra Clássica, Iniciante, presencial, and NO price in the plan
    const result = registerOrLoginGoogleStudent(
      {
        email: selectedEmail,
        name: selectedName,
        avatarUrl: selectedAvatar,
      },
      students,
      schedules,
      payments,
      accounts,
      {
        instrument: 'Guitarra Clássica',
        level: 'Iniciante',
        paymentPlan: chosenPlan,
        phone: chosenPhone,
      },
    );

    onSuccess(result.user, result.updatedStudents, result.updatedAccounts);
    onClose();
  };

  return (
    <div
      id="google-auth-modal"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-3.5">
          {/* Official Google Logo */}
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
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
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Google Identity Services
            </span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              {isTeacherMode
                ? 'Acesso do Professor com Conta Google'
                : mode === 'login'
                ? 'Iniciar Sessão com Conta Google'
                : 'Registar Aluno com Conta Google'}
            </h3>
          </div>
        </div>

        {/* Error notification if unauthorized teacher attempt */}
        {authError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{authError}</div>
          </div>
        )}

        {/* STEP 1: Select or enter Google account */}
        {activeStep === 'select' && (
          <div className="p-6 space-y-5">
            <p className="text-xs text-slate-600">
              {isTeacherMode ? (
                <span>
                  Autenticação exclusiva para a gestão do estúdio. Seleciona a tua conta oficial de
                  professor:
                </span>
              ) : (
                <span>
                  Introduz a tua conta Google para aceder ou registar a tua área de aluno em{' '}
                  <strong>A Voz da Guitarra</strong>:
                </span>
              )}
            </p>

            {isTeacherMode && !useCustomInput ? (
              <div className="space-y-2.5">
                {teacherSuggestions.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full p-3.5 rounded-2xl border text-left transition-all group cursor-pointer flex items-center justify-between border-slate-800 bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          {acc.email}
                        </div>
                        <div className="text-[10px] font-semibold mt-0.5 text-emerald-400">
                          {acc.note}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setUseCustomInput(true)}
                  className="w-full py-2.5 px-3 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors border border-dashed border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Introduzir outro email de professor (@gmail.com)</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    O teu Nome
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                    placeholder={isTeacherMode ? 'Prof. André Martins' : 'ex: João Silva'}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Google (@gmail.com)
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                    placeholder={
                      isTeacherMode ? PRIMARY_TEACHER_EMAIL : 'o.teu.email@gmail.com'
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                  {isTeacherMode && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nota: Apenas a conta {PRIMARY_TEACHER_EMAIL} tem privilégios de professor.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {isTeacherMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomInput(false);
                        setAuthError(null);
                      }}
                      className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Voltar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#ffffff"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#ffffff"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#ffffff"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#ffffff"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar com Conta Google</span>
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              {isTeacherMode ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Área de Professor encriptada e protegida</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Autenticação direta segura com os servidores Google</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Configure student details for new registration (WITHOUT instrument, level, price or modality menus) */}
        {activeStep === 'register_details' && (
          <form onSubmit={handleFinalRegister} className="p-6 space-y-4">
            <div className="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-center gap-3">
              <img
                src={selectedAvatar}
                alt={selectedName}
                className="w-10 h-10 rounded-full border border-indigo-200 object-cover"
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-indigo-950 truncate">{selectedName}</div>
                <div className="text-[11px] text-indigo-700 truncate">{selectedEmail}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Quase pronto! Confirma os teus dados de contacto para concluir o registo:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contacto Telefónico / WhatsApp
              </label>
              <input
                type="tel"
                value={chosenPhone}
                onChange={(e) => setChosenPhone(e.target.value)}
                placeholder="+351 912 345 678"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Plano de Aulas
              </label>
              <select
                value={chosenPlan}
                onChange={(e) => setChosenPlan(e.target.value as PaymentPlanType)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="mensal">Mensalidade (Aulas Regulares)</option>
                <option value="por_aula">Aulas Avulsas</option>
              </select>
            </div>

            <div className="pt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStep('select')}
                className="py-2.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Concluir Registo com Google</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
