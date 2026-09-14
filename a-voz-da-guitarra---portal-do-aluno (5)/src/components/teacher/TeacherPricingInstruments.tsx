import React, { useState } from 'react';
import { TeacherStudioSettings, InstrumentType } from '../../types';
import {
  getStoredTeacherSettings,
  saveStoredTeacherSettings,
  DEFAULT_TEACHER_SETTINGS,
} from '../../utils/storage';
import {
  DollarSign,
  Music,
  Trash2,
  CheckCircle2,
  Sliders,
  Sparkles,
  CreditCard,
  Clock,
  Info,
  ShieldCheck,
  MapPin,
  Banknote,
} from 'lucide-react';

interface TeacherPricingInstrumentsProps {
  onSettingsUpdated?: (settings: TeacherStudioSettings) => void;
}

const COMMON_INSTRUMENTS: InstrumentType[] = [
  'Guitarra Clássica',
  'Piano',
  'Ukulele',
  'Guitarra Portuguesa',
];

export const TeacherPricingInstruments: React.FC<TeacherPricingInstrumentsProps> = ({
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<TeacherStudioSettings>(() => getStoredTeacherSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [mainInstrument, setMainInstrument] = useState(() => {
    if (COMMON_INSTRUMENTS.includes(settings.mainInstrument as InstrumentType)) {
      return settings.mainInstrument;
    }
    return 'Guitarra Clássica';
  });

  const [instrumentsTaught, setInstrumentsTaught] = useState<string[]>(() => {
    const raw = settings.instrumentsTaught || DEFAULT_TEACHER_SETTINGS.instrumentsTaught;
    const filtered = raw.filter((i) => COMMON_INSTRUMENTS.includes(i as InstrumentType));
    return filtered.length > 0 ? filtered : COMMON_INSTRUMENTS;
  });
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState(settings.defaultMonthlyFee);
  const [defaultPerLessonFee, setDefaultPerLessonFee] = useState(settings.defaultPerLessonFee);
  const [lessonDurationMinutes, setLessonDurationMinutes] = useState(
    settings.lessonDurationMinutes || 60,
  );
  const [studioAddress, setStudioAddress] = useState(
    settings.studioAddress || 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
  );
  const [acceptsCash, setAcceptsCash] = useState(
    settings.paymentInfo?.acceptsCash ?? true,
  );
  const [mbwayPhone, setMbwayPhone] = useState(settings.paymentInfo?.mbwayPhone || '910 000 111');
  const [iban, setIban] = useState(settings.paymentInfo?.iban || '');
  const [accountHolder, setAccountHolder] = useState(settings.paymentInfo?.accountHolder || '');
  const [studioBio, setStudioBio] = useState(settings.studioBio || '');

  const handleToggleCommonInstrument = (inst: string) => {
    if (instrumentsTaught.includes(inst)) {
      if (instrumentsTaught.length > 1) {
        const next = instrumentsTaught.filter((i) => i !== inst);
        setInstrumentsTaught(next);
        if (mainInstrument === inst) {
          setMainInstrument(next[0] || 'Guitarra Clássica');
        }
      }
    } else {
      setInstrumentsTaught([...instrumentsTaught, inst]);
    }
  };

  const handleRemoveInstrument = (inst: string) => {
    if (instrumentsTaught.length > 1) {
      const next = instrumentsTaught.filter((i) => i !== inst);
      setInstrumentsTaught(next);
      if (mainInstrument === inst) {
        setMainInstrument(next[0] || 'Guitarra Clássica');
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TeacherStudioSettings = {
      ...settings,
      mainInstrument,
      instrumentsTaught,
      defaultMonthlyFee: Number(defaultMonthlyFee) || 75,
      defaultPerLessonFee: Number(defaultPerLessonFee) || 22,
      lessonDurationMinutes: Number(lessonDurationMinutes) || 60,
      studioAddress: studioAddress.trim() || 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
      paymentInfo: {
        mbwayPhone: mbwayPhone.trim(),
        iban: iban.trim(),
        accountHolder: accountHolder.trim(),
        acceptsCash,
        cashInstructions: 'Pagamento presencial em numerário entregue no estúdio no início da aula.',
      },
      studioBio: studioBio.trim(),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    saveStoredTeacherSettings(updated);
    setSettings(updated);
    if (onSettingsUpdated) onSettingsUpdated(updated);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Preços & Instrumentos Ensinados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configura a tabela de mensalidades, preço por aula e os instrumentos disponíveis no estúdio.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Preços e instrumentos guardados com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* BLOCK 1: PRICING CONFIGURATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            <span>1. Tabela de Preços das Aulas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Monthly Fee */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/80">
              <label className="block text-xs font-bold text-indigo-950 mb-1">
                Preço da Mensalidade (€)
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={defaultMonthlyFee}
                  onChange={(e) => setDefaultMonthlyFee(Number(e.target.value))}
                  required
                  className="w-full text-lg font-black text-slate-900 bg-white border border-indigo-200 rounded-xl px-3 py-2 pl-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-indigo-600">
                  €
                </span>
              </div>
              <p className="text-[11px] text-indigo-700 mt-2">
                Valor padrão para o plano mensal (ex: 4 aulas / mês).
              </p>
            </div>

            {/* Per Lesson Fee */}
            <div className="p-4 bg-violet-50/60 rounded-2xl border border-violet-100/80">
              <label className="block text-xs font-bold text-violet-950 mb-1">
                Preço por Aula Avulsa (€)
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={defaultPerLessonFee}
                  onChange={(e) => setDefaultPerLessonFee(Number(e.target.value))}
                  required
                  className="w-full text-lg font-black text-slate-900 bg-white border border-violet-200 rounded-xl px-3 py-2 pl-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-violet-600">
                  €
                </span>
              </div>
              <p className="text-[11px] text-violet-700 mt-2">
                Valor cobrado por aula individual avulsa.
              </p>
            </div>

            {/* Duration */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Duração da Aula (Minutos)
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  min="30"
                  max="120"
                  step="5"
                  value={lessonDurationMinutes}
                  onChange={(e) => setLessonDurationMinutes(Number(e.target.value))}
                  required
                  className="w-full text-lg font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-3 py-2 pl-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Duração padrão por sessão (ex: 50 ou 60 minutos).
              </p>
            </div>
          </div>
        </div>

        {/* BLOCK 2: INSTRUMENTS TAUGHT */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            <Music className="w-4 h-4 text-indigo-600" />
            <span>2. Instrumentos Ensinados no Estúdio</span>
          </div>

          {/* Main instrument selection */}
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80">
            <label className="block text-xs font-bold text-amber-950 mb-1">
              Instrumento de Destaque / Principal Ensinado
            </label>
            <select
              value={mainInstrument}
              onChange={(e) => setMainInstrument(e.target.value)}
              className="w-full text-sm font-bold bg-white text-slate-900 border border-amber-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              {instrumentsTaught.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-amber-800 mt-1.5">
              Este instrumento é selecionado por defeito nas inscrições e no cabeçalho do portal.
            </p>
          </div>

          {/* Active instruments list */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Instrumentos Atualmente Disponíveis ({instrumentsTaught.length}):
            </label>
            <div className="flex flex-wrap gap-2">
              {instrumentsTaught.map((inst) => (
                <span
                  key={inst}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    inst === mainInstrument
                      ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-200/50'
                      : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                  }`}
                >
                  <Music className="w-3 h-3 text-indigo-600" />
                  <span>{inst}</span>
                  {inst === mainInstrument && (
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded">
                      Principal
                    </span>
                  )}
                  {instrumentsTaught.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstrument(inst)}
                      title={`Remover ${inst}`}
                      className="text-slate-400 hover:text-rose-600 ml-1 p-0.5 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Instrument selection checkboxes/toggles */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ativar / Desativar instrumentos lecionados no estúdio:
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Selecione os instrumentos disponíveis na sua escola (Guitarra Clássica, Piano, Ukulele e Guitarra Portuguesa):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_INSTRUMENTS.map((inst) => {
                const isSelected = instrumentsTaught.includes(inst);
                const isMain = inst === mainInstrument;
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => handleToggleCommonInstrument(inst)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isMain
                          ? 'bg-amber-50 text-amber-950 border-amber-300 ring-2 ring-amber-200'
                          : 'bg-indigo-50 text-indigo-950 border-indigo-200'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Music className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">Desativado</span>
                      )}
                    </div>
                    <span className="text-xs font-bold leading-tight">{inst}</span>
                    {isMain && (
                      <span className="text-[10px] font-semibold text-amber-700 mt-1">
                        ★ Principal
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BLOCK 3: PAYMENT DETAILS FOR STUDENTS */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>3. Coordenadas de Pagamento (Visíveis aos Alunos)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contacto MB WAY
              </label>
              <input
                type="text"
                value={mbwayPhone}
                onChange={(e) => setMbwayPhone(e.target.value)}
                placeholder="ex: 910 000 111"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                IBAN Bancário
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="PT50 0033 ..."
                className="w-full text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Titular da Conta
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="ex: Sérgio Gomes"
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nota Pedagógica / Apresentação do Estúdio
            </label>
            <textarea
              rows={2}
              value={studioBio}
              onChange={(e) => setStudioBio(e.target.value)}
              placeholder="Apresentação das aulas e condições para os alunos..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* BLOCK 4: STUDIO LOCATION & CASH PAYMENT */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>4. Local das Aulas & Pagamento Presencial</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Morada do Local das Aulas (Estúdio)
              </label>
              <input
                type="text"
                value={studioAddress}
                onChange={(e) => setStudioAddress(e.target.value)}
                placeholder="ex: Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga"
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Apresentada nos horários das aulas e nas instruções de pagamento aos alunos.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-start gap-3">
              <input
                id="accepts-cash-toggle"
                type="checkbox"
                checked={acceptsCash}
                onChange={(e) => setAcceptsCash(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="accepts-cash-toggle" className="cursor-pointer">
                <span className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  Permitir Pagamento em Dinheiro (Presencial)
                </span>
                <span className="block text-[11px] text-emerald-800/80 mt-0.5 leading-snug">
                  Os alunos poderão selecionar a opção de entrega em mão no início da aula de 60 minutos na morada do estúdio.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Guardar Preços e Instrumentos</span>
          </button>
        </div>
      </form>
    </div>
  );
};
