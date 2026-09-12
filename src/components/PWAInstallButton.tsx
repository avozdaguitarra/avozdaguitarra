import React, { useState, useEffect, useRef } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import {
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  CheckCircle2,
  X,
  Download,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Monitor,
  HelpCircle,
  Check,
} from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, isMobileOrTablet, isInIframe, install, openInNewTab } =
    usePWAInstall();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Set default tab according to device
  useEffect(() => {
    if (isIOS) {
      setActiveTab('ios');
    } else {
      setActiveTab('android');
    }
  }, [isIOS]);

  // Click outside listener for dropdown menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle "Instalar aplicação" action button
  const handleInstallApp = async () => {
    setIsProcessing(true);
    setFeedbackMessage('A processar a ação «Instalar aplicação»...');

    if (isInstallable) {
      const success = await install();
      if (success) {
        setFeedbackMessage('✓ Aplicação instalada com sucesso no teu dispositivo!');
        setTimeout(() => {
          setFeedbackMessage(null);
          setShowGuideModal(false);
        }, 4000);
        setIsProcessing(false);
        return;
      }
    }

    // If running inside an iframe (like AI Studio or sandboxes), browser requires top-level window
    if (isInIframe) {
      setFeedbackMessage('✓ Ação «Instalar aplicação» ativada! A abrir em novo separador para permitir a instalação direta pelo navegador...');
      setTimeout(() => {
        openInNewTab();
        setIsProcessing(false);
      }, 700);
      return;
    }

    // Otherwise show instructions modal with action highlighted
    setShowGuideModal(true);
    setFeedbackMessage('✓ Ação «Instalar aplicação» selecionada! Segue os passos de confirmação abaixo.');
    setIsProcessing(false);
  };

  // Handle "Adicionar ao ecrã inicial" action button
  const handleAddToHomeScreen = async () => {
    setIsProcessing(true);
    setFeedbackMessage('A processar a ação «Adicionar ao ecrã inicial»...');

    if (isInstallable) {
      const success = await install();
      if (success) {
        setFeedbackMessage('✓ Atalho adicionado ao ecrã inicial com sucesso!');
        setTimeout(() => {
          setFeedbackMessage(null);
          setShowGuideModal(false);
        }, 4000);
        setIsProcessing(false);
        return;
      }
    }

    if (isIOS) {
      setActiveTab('ios');
      setShowGuideModal(true);
      setFeedbackMessage('✓ Ação «Adicionar ao ecrã inicial» selecionada! Segue o guia para Safari no teu iPhone ou iPad.');
      setIsProcessing(false);
      return;
    }

    if (isInIframe) {
      setFeedbackMessage('✓ Ação «Adicionar ao ecrã inicial» selecionada! A abrir em novo separador...');
      setTimeout(() => {
        openInNewTab();
        setIsProcessing(false);
      }, 700);
      return;
    }

    setActiveTab('android');
    setShowGuideModal(true);
    setFeedbackMessage('✓ Ação «Adicionar ao ecrã inicial» selecionada! Segue os passos no teu navegador.');
    setIsProcessing(false);
  };

  // If already installed in standalone mode, show subtle indicator
  if (isInstalled) {
    if (variant === 'banner') return null;
    return (
      <div
        title="Aplicação instalada no ecrã principal"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Instalada no Ecrã</span>
        <span className="sm:hidden">Instalada</span>
      </div>
    );
  }

  return (
    <>
      {/* NAVBAR VARIANT: Button with Action Dropdown */}
      {variant === 'navbar' && (
        <div className="relative" ref={menuRef}>
          <button
            id="pwa-install-nav-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Menu de Instalação e Ecrã Inicial"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Instalar / Ecrã Inicial</span>
            <span className="sm:hidden">Instalar</span>
            <ChevronDown
              className={`w-3 h-3 text-indigo-500 transition-transform ${
                isMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Action Dropdown Menu */}
          {isMenuOpen && (
            <div
              id="pwa-nav-dropdown-menu"
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fade-in"
            >
              <div className="px-2 py-1.5 mb-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Acesso Direto à Aplicação
                </span>
                <p className="text-xs font-extrabold text-slate-900">
                  Opções de Instalação no Dispositivo:
                </p>
              </div>

              {/* Botão 1: Instalar aplicação */}
              <button
                id="navbar-btn-instalar-aplicacao"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleInstallApp();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/80 border border-slate-100 hover:border-indigo-200 transition-all flex items-start gap-3 group cursor-pointer mb-2 bg-slate-50/50"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 group-hover:text-indigo-900">
                      «Instalar aplicação»
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                      Web App
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Instalar como aplicação no computador, telemóvel ou tablet.
                  </p>
                </div>
              </button>

              {/* Botão 2: Adicionar ao ecrã inicial */}
              <button
                id="navbar-btn-adicionar-ecra"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleAddToHomeScreen();
                }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/80 border border-slate-100 hover:border-amber-200 transition-all flex items-start gap-3 group cursor-pointer mb-2 bg-slate-50/50"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 group-hover:text-amber-900">
                      «Adicionar ao ecrã inicial»
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                      Atalho
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Cria o ícone no teu ecrã inicial com acesso rápido sem barra de URL.
                  </p>
                </div>
              </button>

              {/* Link para abrir o guia */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
                <button
                  id="navbar-btn-abrir-guia"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowGuideModal(true);
                  }}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Ver guia detalhado com botões</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BANNER VARIANT */}
      {variant === 'banner' && (
        <div
          id="pwa-install-banner"
          className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-lg border border-indigo-500/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <img
              src="/pwa-192x192.png"
              alt="A Voz da Guitarra"
              className="w-12 h-12 rounded-2xl shadow-md border border-white/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Instalação e Atalho no Ecrã Principal
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-950 rounded-full">
                  Disponível
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Acede a «A Voz da Guitarra» diretamente no teu ecrã com suporte offline e sem barra de navegação.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
            {/* Botão 1: Instalar aplicação */}
            <button
              id="banner-btn-instalar-aplicacao"
              onClick={handleInstallApp}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>«Instalar aplicação»</span>
            </button>

            {/* Botão 2: Adicionar ao ecrã inicial */}
            <button
              id="banner-btn-adicionar-ecra"
              onClick={handleAddToHomeScreen}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusSquare className="w-4 h-4" />
              <span>«Adicionar ao ecrã inicial»</span>
            </button>
          </div>
        </div>
      )}

      {/* FULL INSTRUCTIONAL & INTERACTIVE MODAL */}
      {showGuideModal && (
        <div
          id="pwa-install-guide-modal"
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[92vh] flex flex-col">
            {/* Close button */}
            <button
              id="modal-btn-close-x"
              onClick={() => {
                setShowGuideModal(false);
                setFeedbackMessage(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer z-10"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with App Icon */}
            <div className="flex items-center gap-3.5 mb-4 pr-8 shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="A Voz da Guitarra"
                className="w-13 h-13 rounded-2xl shadow-md border border-slate-200 shrink-0"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                  Aplicação Web Progressiva (PWA)
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  Instalar Aplicação & Ecrã Inicial
                </h3>
                <p className="text-xs text-slate-500">
                  Completa a ação pretendida através dos botões dedicados abaixo:
                </p>
              </div>
            </div>

            {/* Feedback Alert Toast */}
            {feedbackMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-2xs shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              {/* OS DOIS BOTÕES DE AÇÃO SOLICITADOS */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-amber-50/50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Botões para completar a ação:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Botão 1: Instalar aplicação */}
                  <button
                    id="modal-btn-instalar-aplicacao"
                    onClick={handleInstallApp}
                    disabled={isProcessing}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-3 text-left group border border-indigo-700"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-black block leading-tight">
                        «Instalar aplicação»
                      </span>
                      <span className="text-[10px] text-indigo-100 font-medium block mt-0.5">
                        Instalar no dispositivo
                      </span>
                    </div>
                  </button>

                  {/* Botão 2: Adicionar ao ecrã inicial */}
                  <button
                    id="modal-btn-adicionar-ecra"
                    onClick={handleAddToHomeScreen}
                    disabled={isProcessing}
                    className="p-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-3 text-left group border border-amber-500"
                  >
                    <div className="w-9 h-9 rounded-lg bg-black/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <PlusSquare className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <span className="text-xs font-black block leading-tight">
                        «Adicionar ao ecrã inicial»
                      </span>
                      <span className="text-[10px] text-slate-800 font-medium block mt-0.5">
                        Criar atalho na tela principal
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Special action if running in iframe / preview */}
              {isInIframe && (
                <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="text-[11px] text-slate-600 font-medium">
                      Para aceder ao instalador nativo do browser sem restrições de moldura:
                    </span>
                  </div>
                  <button
                    id="modal-btn-open-new-tab"
                    onClick={openInNewTab}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                  >
                    <span>Abrir em Separador Completo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* OS / Browser Selector Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab('android')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'android'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android & Chrome / Edge</span>
                </button>

                <button
                  onClick={() => setActiveTab('ios')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'ios'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone & iPad (Safari)</span>
                </button>
              </div>

              {/* Tab 1: Android & Chrome / Edge */}
              {activeTab === 'android' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      No navegador Google Chrome ou Microsoft Edge, clica no menu de{' '}
                      <strong>três pontos (⋮)</strong> no canto superior direito do navegador.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <span>Clica diretamente numa das opções disponíveis:</span>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <button
                          id="step-btn-instalar-aplicacao"
                          onClick={handleInstallApp}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5 text-white" />
                          <span>«Instalar aplicação»</span>
                        </button>
                        <span className="text-slate-400 font-bold text-xs">ou</span>
                        <button
                          id="step-btn-adicionar-ecra"
                          onClick={handleAddToHomeScreen}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <PlusSquare className="w-3.5 h-3.5 text-slate-950" />
                          <span>«Adicionar ao ecrã inicial»</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      Confirma no botão <strong>«Instalar»</strong> que surge na janela de confirmação. O ícone oficial de <em>A Voz da Guitarra</em> surgirá imediatamente no teu ecrã!
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: iOS Safari */}
              {activeTab === 'ios' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      No navegador Safari, toca no botão de <strong>Partilhar</strong>{' '}
                      <span className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-md text-indigo-600 font-bold">
                        <Share className="w-3.5 h-3.5 inline" />
                      </span>{' '}
                      na barra inferior do iPhone ou no topo do iPad.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      Desliza para baixo no menu de opções e toca no botão:{' '}
                      <div className="mt-1.5">
                        <button
                          id="step-btn-ios-adicionar-ecra"
                          onClick={handleAddToHomeScreen}
                          className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <PlusSquare className="w-3.5 h-3.5 text-slate-950" />
                          <span>«Adicionar ao Ecrã Principal»</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      Toca em <strong>«Adicionar»</strong> no canto superior direito para concluir. O aplicativo abrirá em ecrã total sem qualquer barra do navegador!
                    </div>
                  </div>
                </div>
              )}

              {/* Features summary checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Abre em ecrã inteiro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Carregamento instantâneo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Acesso offline aos estudos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Sem ocupar espaço na memória</span>
                </div>
              </div>
            </div>

            {/* Bottom action button to close */}
            <div className="mt-4 pt-3 border-t border-slate-100 shrink-0">
              <button
                id="modal-btn-close-bottom"
                onClick={() => {
                  setShowGuideModal(false);
                  setFeedbackMessage(null);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
