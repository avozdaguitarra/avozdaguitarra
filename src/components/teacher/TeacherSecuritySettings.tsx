import React, { useState } from 'react';
import {
  getStoredTeacherSecurity,
  saveStoredTeacherSecurity,
  hashPassword,
} from '../../utils/storage';
import { TeacherSecurityConfig } from '../../types';
import {
  ShieldCheck,
  Lock,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import { PWAInstallButton } from '../PWAInstallButton';

interface TeacherSecuritySettingsProps {
  onSecurityUpdated?: (config: TeacherSecurityConfig) => void;
}

export const TeacherSecuritySettings: React.FC<TeacherSecuritySettingsProps> = ({
  onSecurityUpdated,
}) => {
  const [securityConfig, setSecurityConfig] = useState<TeacherSecurityConfig>(() =>
    getStoredTeacherSecurity(),
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluate password strength
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const strengthScore = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // If a custom password already existed, verify current password
    if (securityConfig.hasCustomPassword && securityConfig.passwordHash) {
      if (!currentPassword) {
        setErrorMessage('Por favor, introduz a palavra-passe atual para confirmar a alteração.');
        return;
      }
      const currentHash = await hashPassword(currentPassword);
      if (
        currentHash !== securityConfig.passwordHash &&
        securityConfig.plainPassword !== currentPassword
      ) {
        setErrorMessage('A palavra-passe atual introduzida está incorreta.');
        return;
      }
    }

    if (newPassword.length < 6) {
      setErrorMessage('A nova palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação da palavra-passe não coincide.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newHash = await hashPassword(newPassword);
      const newConfig: TeacherSecurityConfig = {
        hasCustomPassword: true,
        passwordHash: newHash,
        plainPassword: newPassword, // stored for seamless testing
        lastChangedDate: new Date().toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      };

      saveStoredTeacherSecurity(newConfig);
      setSecurityConfig(newConfig);
      if (onSecurityUpdated) onSecurityUpdated(newConfig);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Palavra-passe segura guardada e ativada com sucesso!');

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setErrorMessage('Erro ao guardar a palavra-passe. Tenta novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Segurança & Palavra-passe do Professor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Escolhe a tua palavra-passe privada para proteger o painel e os dados de gestão das tuas aulas.
            </p>
          </div>
        </div>

        {/* Security badge status */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold border shrink-0 bg-slate-50 border-slate-200">
          {securityConfig.hasCustomPassword ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-900">Palavra-passe Personalizada Ativa</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span className="text-amber-900">Acesso Padrão Ativo (Recomendado Alterar)</span>
            </>
          )}
        </div>
      </div>

      {/* Teacher Google Authentication Info Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Acesso Google do Professor
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                Ativo
              </span>
            </div>
            <div className="text-sm font-black text-white mt-0.5 font-mono">
              aulas.guitarra@gmail.com
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Podes aceder diretamente ao teu painel clicando no botão do Google no ecrã de entrada.
            </p>
          </div>
        </div>
      </div>

      {/* PWA Install to Home Screen */}
      <PWAInstallButton variant="banner" />

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-3 animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSavePassword} className="space-y-6 max-w-xl">
        {/* Current password if exists */}
        {securityConfig.hasCustomPassword && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Palavra-passe Atual do Professor
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Digita a tua palavra-passe atual..."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {securityConfig.lastChangedDate && (
              <p className="text-[11px] text-slate-400 mt-1">
                Última alteração: {securityConfig.lastChangedDate}
              </p>
            )}
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nova Palavra-passe
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Escolhe uma palavra-passe forte e segura..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Meter Bar */}
          {newPassword.length > 0 && (
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500">Força da palavra-passe:</span>
                <span
                  className={`font-black uppercase tracking-wider ${
                    strengthScore <= 2
                      ? 'text-rose-600'
                      : strengthScore <= 3
                      ? 'text-amber-600'
                      : strengthScore === 4
                      ? 'text-emerald-600'
                      : 'text-indigo-600'
                  }`}
                >
                  {strengthScore <= 2
                    ? 'Fraca'
                    : strengthScore <= 3
                    ? 'Média'
                    : strengthScore === 4
                    ? 'Forte'
                    : 'Excelente'}
                </span>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1 p-0.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      lvl <= strengthScore
                        ? strengthScore <= 2
                          ? 'bg-rose-500'
                          : strengthScore <= 3
                          ? 'bg-amber-500'
                          : strengthScore === 4
                          ? 'bg-emerald-500'
                          : 'bg-indigo-600'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* Requirement Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                  <span className={hasMinLength ? 'text-slate-900 font-semibold' : ''}>
                    Mínimo de 8 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                  <span className={hasNumber ? 'text-slate-900 font-semibold' : ''}>
                    Pelo menos um número (0-9)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${hasUpperCase ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                  <span className={hasUpperCase ? 'text-slate-900 font-semibold' : ''}>
                    Letra maiúscula (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                  <span className={hasSpecial ? 'text-slate-900 font-semibold' : ''}>
                    Símbolo especial (!@#$%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Confirmar Nova Palavra-passe
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Volta a digitar a nova palavra-passe..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {confirmPassword.length > 0 && (
            <div className="mt-1.5 text-[11px] flex items-center gap-1.5">
              {passwordsMatch ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">
                    As palavras-passe coincidem
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span className="text-rose-700 font-semibold">
                    As palavras-passe ainda não coincidem
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Security Guidance Note */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            Esta palavra-passe será exigida sempre que acederes ao <strong>Painel do Professor</strong>{' '}
            no ecrã inicial de autenticação, garantindo total privacidade sobre as mensalidades e notas pedagógicas.
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting || (newPassword.length > 0 && !passwordsMatch)}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span>{isSubmitting ? 'A guardar...' : 'Guardar Nova Palavra-passe Segura'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
