import React, { useState } from 'react';
import { Student, StudyMaterial, MaterialCategory } from '../../types';
import {
  FileMusic,
  Headphones,
  BookOpen,
  FileText,
  Clock,
  ExternalLink,
  CheckCircle2,
  Circle,
  Play,
  Search,
  Sliders,
  Sparkles,
  Music2,
  Volume2,
  Check,
} from 'lucide-react';

interface MaterialsViewProps {
  student: Student;
  materials: StudyMaterial[];
  onToggleMaterialCompleted: (materialId: string) => void;
  onOpenMetronomeAtBpm: (bpm: number) => void;
}

const CATEGORY_LABELS: Record<MaterialCategory, { label: string; icon: React.ReactNode; color: string }> = {
  partitura: {
    label: 'Partitura',
    icon: <FileMusic className="w-3.5 h-3.5" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  tablatura: {
    label: 'Tablatura / Cifra',
    icon: <Music2 className="w-3.5 h-3.5" />,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  audio_playalong: {
    label: 'Áudio / Backing Track',
    icon: <Headphones className="w-3.5 h-3.5" />,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  exercicio: {
    label: 'Exercício Técnico',
    icon: <Sliders className="w-3.5 h-3.5" />,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  video_aula: {
    label: 'Vídeo Aula',
    icon: <Play className="w-3.5 h-3.5" />,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  teoria: {
    label: 'Teoria & Harmonia',
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
};

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  student,
  materials,
  onToggleMaterialCompleted,
  onOpenMetronomeAtBpm,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTabMaterial, setActiveTabMaterial] = useState<StudyMaterial | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Filter materials for this student or general instrument
  const studentMaterials = materials.filter(
    (m) => m.studentId === student.id || m.studentId === 'all' || m.instrument === student.instrument,
  );

  const filteredMaterials = studentMaterials.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.teacherNotes && m.teacherNotes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const completedCount = studentMaterials.filter((m) => m.isCompleted).length;
  const progressPercent = studentMaterials.length > 0 ? Math.round((completedCount / studentMaterials.length) * 100) : 0;

  return (
    <div id="student-materials-view" className="space-y-6">
      {/* Header & Study Progress */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Material para Estudo em Casa</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Partituras, Exercícios & Áudios
          </h2>
          <p className="text-xs text-slate-500">
            Materiais enviados pelo teu professor especificamente para {student.instrument} ({student.level})
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Progresso dos Exercícios</span>
            <span className="text-indigo-600 font-mono">
              {completedCount} de {studentMaterials.length} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Marca os materiais como estudados à medida que praticas.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({studentMaterials.length})
          </button>

          {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => {
            const count = studentMaterials.filter((m) => m.category === catKey).length;
            if (count === 0) return null;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === catKey
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {info.icon}
                <span>{info.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar material..."
            className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMaterials.map((material) => {
            const catInfo = CATEGORY_LABELS[material.category] || CATEGORY_LABELS.exercicio;

            return (
              <div
                key={material.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                  material.isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${catInfo.color}`}
                    >
                      {catInfo.icon}
                      {catInfo.label}
                    </span>

                    <button
                      onClick={() => onToggleMaterialCompleted(material.id)}
                      title={material.isCompleted ? 'Marcar como não concluído' : 'Marcar como estudado'}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
                        material.isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {material.isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Estudado</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Por praticar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {material.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {material.description}
                  </p>

                  {/* Badges: BPM, Tom, Estimated practice */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                    {material.targetBpm && (
                      <button
                        onClick={() => onOpenMetronomeAtBpm(material.targetBpm!)}
                        title="Configurar metrónomo para esta velocidade"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-mono font-bold transition-colors cursor-pointer"
                      >
                        <Clock className="w-3 h-3 text-amber-600" />
                        {material.targetBpm} BPM
                        <span className="text-[10px] underline font-sans ml-0.5">Tocar</span>
                      </button>
                    )}

                    {material.keySignature && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                        Tom: {material.keySignature}
                      </span>
                    )}

                    {material.estimatedPracticeMinutes && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">
                        ⏱️ ~{material.estimatedPracticeMinutes} min diários
                      </span>
                    )}
                  </div>

                  {/* Teacher Guidance Notes */}
                  {material.teacherNotes && (
                    <div className="mt-4 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-slate-700">
                      <span className="font-bold text-indigo-900 block mb-0.5">
                        💬 Dica do Professor André:
                      </span>
                      {material.teacherNotes}
                    </div>
                  )}

                  {/* Audio Player for audio tracks */}
                  {material.category === 'audio_playalong' && material.contentUrl && (
                    <div className="mt-4 p-3 bg-slate-900 text-white rounded-2xl">
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-slate-200">
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          Pista de Acompanhamento (Playalong)
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">Áudio MP3/OGG</span>
                      </div>
                      <audio
                        controls
                        className="w-full h-8 accent-emerald-500 rounded-lg"
                        src={material.contentUrl}
                        onPlay={() => setPlayingAudioId(material.id)}
                        onPause={() => setPlayingAudioId(null)}
                      >
                        O teu navegador não suporta áudio HTML5.
                      </audio>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-5 mt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Enviado a {new Date(material.assignedDate).toLocaleDateString('pt-PT')}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* View Text / Tab */}
                    {material.textContent && (
                      <button
                        onClick={() => setActiveTabMaterial(material)}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver Tab / Cifra
                      </button>
                    )}

                    {/* PDF or Link Download */}
                    {material.contentUrl && material.category !== 'audio_playalong' && (
                      <a
                        href={material.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        Abrir Partitura
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Nenhum material encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Não existem materiais para o filtro selecionado. O professor adicionará novas partituras após a próxima aula!
          </p>
        </div>
      )}

      {/* Tab/Chords Viewer Modal */}
      {activeTabMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {activeTabMaterial.instrument} • {activeTabMaterial.category}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {activeTabMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveTabMaterial(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 flex-1">
              {activeTabMaterial.teacherNotes && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold">Orientação de estudo: </span>
                  {activeTabMaterial.teacherNotes}
                </div>
              )}

              <div className="bg-slate-950 text-emerald-400 font-mono p-4 rounded-2xl text-xs overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                {activeTabMaterial.textContent}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {activeTabMaterial.targetBpm && (
                <button
                  onClick={() => {
                    onOpenMetronomeAtBpm(activeTabMaterial.targetBpm!);
                  }}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Praticar a {activeTabMaterial.targetBpm} BPM no Metrónomo
                </button>
              )}

              <button
                onClick={() => setActiveTabMaterial(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold ml-auto"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
