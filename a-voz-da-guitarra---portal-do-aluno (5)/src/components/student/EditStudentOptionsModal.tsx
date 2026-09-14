import React, { useState, useEffect } from 'react';
import { Student, ScheduleItem, InstrumentType } from '../../types';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Music,
  User,
  Phone,
  Mail,
  CreditCard,
  Check,
  Sparkles,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { getStoredTeacherSettings } from '../../utils/storage';

interface EditStudentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  schedule?: ScheduleItem;
  initialTab?: 'horario' | 'perfil';
  onSave: (updatedStudent: Student, updatedSchedule?: ScheduleItem) => void;
}

const INSTRUMENT_OPTIONS: InstrumentType[] = [
  'Guitarra Clássica',
  'Piano',
  'Ukulele',
  'Guitarra Portuguesa',
];

const DAYS_OF_WEEK = [
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
  { id: 0, name: 'Domingo', short: 'Dom' },
];

const QUICK_HOURS = ['10:00', '11:00', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30'];
const DURATION_PRESETS = [30, 45, 60, 90];

export const EditStudentOptionsModal: React.FC<EditStudentOptionsModalProps> = ({
  isOpen,
  onClose,
  student,
  schedule,
  initialTab = 'horario',
  onSave,
}) => {
  const teacherSettings = getStoredTeacherSettings();
  const defaultAddress =
    teacherSettings.studioAddress || 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga';

  const [activeTab, setActiveTab] = useState<'horario' | 'perfil'>(initialTab);

  // Student profile state
  const [name, setName] = useState(student.name);
  const [instrument, setInstrument] = useState<InstrumentType>(student.instrument);
  const [level, setLevel] = useState<'Iniciante' | 'Intermédio' | 'Avançado'>(student.level);
  const [phone, setPhone] = useState(student.phone);
  const [email, setEmail] = useState(student.email);
  const [paymentPlan, setPaymentPlan] = useState<'mensal' | 'por_aula'>(student.paymentPlan);
  const [monthlyFee, setMonthlyFee] = useState(student.monthlyFee || teacherSettings.defaultMonthlyFee || 75);
  const [perLessonFee, setPerLessonFee] = useState(student.perLessonFee || teacherSettings.defaultPerLessonFee || 22);
  const [notes, setNotes] = useState(student.notes || '');

  // Schedule state
  const [dayOfWeek, setDayOfWeek] = useState<number>(schedule ? schedule.dayOfWeek : 2);
  const [startTime, setStartTime] = useState<string>(schedule ? schedule.startTime : '17:30');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    schedule ? schedule.durationMinutes : teacherSettings.lessonDurationMinutes || 60,
  );
  const [modality, setModality] = useState<'presencial' | 'online'>(
    schedule ? schedule.modality : 'presencial',
  );
  const [locationOrLink, setLocationOrLink] = useState<string>(
    schedule
      ? schedule.locationOrLink
      : 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga',
  );
  const [roomName, setRoomName] = useState<string>(
    schedule ? schedule.roomName : 'Sala 6 (1º Andar)',
  );
  const [focusArea, setFocusArea] = useState<string>(
    schedule ? schedule.focusArea || '' : `Aulas e repertório de ${student.instrument}`,
  );

  // Synchronize when modal opens or student/schedule prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setName(student.name);
      setInstrument(student.instrument);
      setLevel(student.level);
      setPhone(student.phone);
      setEmail(student.email);
      setPaymentPlan(student.paymentPlan);
      setMonthlyFee(student.monthlyFee || teacherSettings.defaultMonthlyFee || 75);
      setPerLessonFee(student.perLessonFee || teacherSettings.defaultPerLessonFee || 22);
      setNotes(student.notes || '');

      if (schedule) {
        setDayOfWeek(schedule.dayOfWeek);
        setStartTime(schedule.startTime);
        setDurationMinutes(schedule.durationMinutes || 60);
        setModality(schedule.modality);
        setLocationOrLink(schedule.locationOrLink);
        setRoomName(schedule.roomName);
        setFocusArea(schedule.focusArea || '');
      } else {
        setDayOfWeek(2);
        setStartTime('17:30');
        setDurationMinutes(teacherSettings.lessonDurationMinutes || 60);
        setModality('presencial');
        setLocationOrLink(defaultAddress);
        setRoomName('Sala 6 (1º Andar)');
        setFocusArea(`Desenvolvimento prático e repertório de ${student.instrument}`);
      }
    }
  }, [isOpen, student, schedule, initialTab, teacherSettings.defaultMonthlyFee, teacherSettings.defaultPerLessonFee, teacherSettings.lessonDurationMinutes, defaultAddress]);

  if (!isOpen) return null;

  const handleModalityChange = (newModality: 'presencial' | 'online') => {
    setModality(newModality);
    if (newModality === 'online') {
      if (!locationOrLink || locationOrLink.includes('Largo')) {
        setLocationOrLink('https://meet.google.com/voz-guitarra-aula');
      }
      if (!roomName || roomName.includes('Sala 6')) {
        setRoomName('Sala Virtual (Google Meet)');
      }
    } else {
      if (!locationOrLink || locationOrLink.includes('meet.google.com')) {
        setLocationOrLink(defaultAddress);
      }
      if (!roomName || roomName.includes('Virtual')) {
        setRoomName('Sala 6 (1º Andar)');
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedStudent: Student = {
      ...student,
      name: name.trim() || student.name,
      instrument,
      level,
      phone: phone.trim() || student.phone,
      email: email.trim() || student.email,
      paymentPlan,
      monthlyFee: Number(monthlyFee) || 75,
      perLessonFee: Number(perLessonFee) || 22,
      notes: notes.trim(),
    };

    const updatedSchedule: ScheduleItem = {
      id: schedule ? schedule.id : `sch-${student.id}`,
      studentId: student.id,
      dayOfWeek: Number(dayOfWeek),
      startTime: startTime.trim() || '17:30',
      durationMinutes: Number(durationMinutes) || 60,
      modality,
      roomName: roomName.trim() || (modality === 'online' ? 'Sala Virtual' : 'Sala 6 (1º Andar)'),
      locationOrLink:
        locationOrLink.trim() ||
        (modality === 'online' ? 'https://meet.google.com/voz-guitarra-aula' : defaultAddress),
      teacherName: teacherSettings.teacherName || 'Prof. Sérgio Gomes',
      focusArea: focusArea.trim() || `Aula de ${instrument}`,
    };

    onSave(updatedStudent, updatedSchedule);
    onClose();
  };

  return (
    <div
      id="edit-student-options-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div
        id="edit-student-options-modal-content"
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 transition-all"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <SlidersHorizontal className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Editar Horário & Opções do Aluno</h2>
              <p className="text-xs text-indigo-200">
                Personaliza os horários semanais, modalidade e dados de {student.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('horario')}
            className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'horario'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. Horário da Aula Semanal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'perfil'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>2. Dados & Opções do Aluno</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {activeTab === 'horario' ? (
            <div className="space-y-5">
              {/* Day of week selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Dia da Semana da Aula
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = dayOfWeek === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDayOfWeek(d.id)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <div>{d.short}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hora de Início
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />

                  {/* Quick Hour Badges */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {QUICK_HOURS.map((qh) => (
                      <button
                        key={qh}
                        type="button"
                        onClick={() => setStartTime(qh)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium transition-colors cursor-pointer ${
                          startTime === qh
                            ? 'bg-indigo-100 text-indigo-700 font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {qh}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duração da Aula
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={15}
                      max={180}
                      step={5}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-24 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                    <span className="text-xs text-slate-500 font-medium">minutos</span>
                  </div>

                  {/* Duration presets */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {DURATION_PRESETS.map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDurationMinutes(dur)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          durationMinutes === dur
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {dur} min {dur === 60 ? '(Padrão)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modality Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Modalidade da Aula
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleModalityChange('presencial')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      modality === 'presencial'
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        modality === 'presencial' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Presencial (Estúdio)</div>
                      <div className="text-[10px] text-slate-500">Largo Senhora-a-Branca, Braga</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModalityChange('online')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      modality === 'online'
                        ? 'bg-cyan-50/70 border-cyan-300 ring-2 ring-cyan-500/20 text-cyan-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        modality === 'online' ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Online (Google Meet)</div>
                      <div className="text-[10px] text-slate-500">Videoconferência ao vivo</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Location or Online link & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {modality === 'online' ? 'Link da Videoconferência' : 'Local das Aulas (Morada)'}
                  </label>
                  <input
                    type="text"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    placeholder={
                      modality === 'online'
                        ? 'https://meet.google.com/...'
                        : 'Largo Senhora-a-Branca, Nº56 - 1º Andar - Sala 6, Braga'
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designação da Sala
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder={modality === 'online' ? 'Sala Virtual' : 'Sala 6 (1º Andar)'}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Focus area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Foco Musical / Notas da Aula
                </label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="ex: Dedilhados, técnica de afinação e repertório"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo do Aluno
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instrumento
                  </label>
                  <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value as InstrumentType)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {INSTRUMENT_OPTIONS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nível Musical
                  </label>
                  <select
                    value={level}
                    onChange={(e) =>
                      setLevel(e.target.value as 'Iniciante' | 'Intermédio' | 'Avançado')
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermédio">Intermédio</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telemóvel / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+351 910 000 000"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Payment Plan & Pricing options */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Opções de Mensalidade & Pagamento</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plano de Aulas
                    </label>
                    <select
                      value={paymentPlan}
                      onChange={(e) =>
                        setPaymentPlan(e.target.value as 'mensal' | 'por_aula')
                      }
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                    >
                      <option value="mensal">Mensalidade Regular (4 aulas/mês)</option>
                      <option value="por_aula">Avulso (Pagamento Por Aula)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {paymentPlan === 'mensal' ? 'Valor Mensalidade (€)' : 'Valor por Aula (€)'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={paymentPlan === 'mensal' ? monthlyFee : perLessonFee}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (paymentPlan === 'mensal') {
                            setMonthlyFee(val);
                          } else {
                            setPerLessonFee(val);
                          }
                        }}
                        className="w-full text-xs font-bold font-mono bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        €
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas Adicionais / Preferências
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações pedagógicas ou preferências de aula..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              id="save-student-options-btn"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
