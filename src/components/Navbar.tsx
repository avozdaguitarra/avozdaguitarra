import React from 'react';
import { Student, UserAccount } from '../types';
import { Music, User, ShieldCheck, Clock, RotateCcw, LogOut, Lock } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { BrandLogo } from './common/BrandLogo';

interface NavbarProps {
  mode: 'aluno' | 'professor';
  onModeChange: (mode: 'aluno' | 'professor') => void;
  students: Student[];
  currentStudent: Student | undefined;
  onStudentChange: (studentId: string) => void;
  isMetronomeOpen: boolean;
  onToggleMetronome: () => void;
  onResetData: () => void;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  students,
  currentStudent,
  onStudentChange,
  isMetronomeOpen,
  onToggleMetronome,
  onResetData,
  currentUser,
  onLogout,
  onOpenAuth,
}) => {
  const isTeacher = currentUser?.role === 'professor';
  const isStudent = currentUser?.role === 'aluno';

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" className="w-10 h-10 ring-2 ring-slate-900/10 shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  A Voz da Guitarra
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                  Portal do Aluno
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Horários • Pagamentos • Materiais de Estudo
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If Teacher is logged in */}
            {isTeacher && (
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  id="tab-professor-mode"
                  onClick={() => onModeChange('professor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'professor'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Painel Professor</span>
                </button>

                <button
                  id="tab-aluno-mode"
                  onClick={() => onModeChange('aluno')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'aluno'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ver como Aluno</span>
                  <span className="sm:hidden">Aluno</span>
                </button>
              </div>
            )}

            {/* Quick Student Switcher for Teacher in preview mode only */}
            {isTeacher && mode === 'aluno' && (
              <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                  A ver aluno:
                </span>
                <select
                  id="student-switcher-select"
                  value={currentStudent?.id || ''}
                  onChange={(e) => onStudentChange(e.target.value)}
                  aria-label="Selecionar Aluno"
                  className="text-xs font-semibold bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.instrument})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Student is logged in: STRICT ISOLATION, shows only student profile info */}
            {isStudent && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/80 border border-indigo-100 rounded-xl">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-indigo-200"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-indigo-950 block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-indigo-600 block">
                    Área do Aluno {currentUser.instrument ? `• ${currentUser.instrument}` : ''}
                  </span>
                </div>
              </div>
            )}

            {/* PWA Install to Home Screen */}
            <PWAInstallButton variant="navbar" />

            {/* Metronome Tool Toggle */}
            <button
              id="navbar-metronome-btn"
              onClick={onToggleMetronome}
              title="Abrir / Fechar Metrónomo"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                isMetronomeOpen
                  ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-200/50'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${isMetronomeOpen ? 'text-amber-600 animate-spin' : 'text-slate-500'}`} />
              <span className="hidden xs:inline">Metrónomo</span>
            </button>

            {/* Auth / Logout actions */}
            {currentUser ? (
              <button
                id="navbar-logout-btn"
                onClick={onLogout}
                title="Terminar Sessão"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar / Registar</span>
              </button>
            )}

            {/* Reset data for testing demo */}
            <button
              id="navbar-reset-data-btn"
              onClick={onResetData}
              title="Restaurar dados de demonstração"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notice banner if Teacher is viewing student preview */}
        {isTeacher && mode === 'aluno' && (
          <div className="py-1.5 px-3 bg-amber-50 border-t border-amber-200/70 flex items-center justify-between text-xs text-amber-800">
            <span className="font-medium">
              👁️ Modo de visualização: A pré-visualizar a área do aluno <strong>{currentStudent?.name}</strong>.
            </span>
            <button
              onClick={() => onModeChange('professor')}
              className="font-bold underline text-amber-900 hover:text-amber-950 ml-2"
            >
              Voltar ao Painel do Professor
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

