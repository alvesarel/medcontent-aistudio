
import React, { useState, useCallback, useEffect } from 'react';
import { UserData, Platform, ContentResult, SuggestedTheme, User, AccountSettings, SelectedPlan, VideoStoryboard, Tone, Profession, AiModelId, AppView, UserTier } from './types';
import { Template } from './types/templates';
import * as contentService from './services/contentService';
import * as complianceService from './services/complianceService';
import * as userService from './services/userService';
import * as analyticsService from './services/analyticsService';
import { DEFAULT_TONES, GUEST_SETTINGS } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import InputForm from './components/InputForm';
import ThemeSelector from './components/ThemeSelector';
import ContentPreview from './components/ContentPreview';
import LoadingSpinner from './components/LoadingSpinner';
import StepIndicator from './components/StepIndicator';
import Auth from './components/Auth';
import AccountSettingsComponent from './components/AccountSettings';
import PricingPage from './components/PricingPage';
import CheckoutPage from './components/CheckoutPage';
import ImageCreator from './components/ImageCreator';
import AboutPage from './components/AboutPage';
import IdeaSearch from './components/IdeaSearch';
import VideoCreator from './components/VideoCreator';
import ComplianceChecker from './components/ComplianceChecker';
import AnalyticsPage from './components/AnalyticsPage';
import TemplateLibrary from './components/TemplateLibrary';
import TemplateForm from './components/TemplateForm';
import MyPostsPage from './components/MyPostsPage';

export type AppStep = 'input' | 'generating_research' | 'theme_selection' | 'generating_content' | 'image_creation' | 'generating_image' | 'video_creation' | 'generating_video_storyboard' | 'results';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>('app');
  const [step, setStep] = useState<AppStep>('input');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [currentGenerationStep, setCurrentGenerationStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [userData, setUserData] = useState<Omit<UserData, 'model'> | null>(null);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [themeSuggestions, setThemeSuggestions] = useState<SuggestedTheme[]>([]);
  const [contentResult, setContentResult] = useState<ContentResult | null>(null);
  const [imageSuggestion, setImageSuggestion] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [videoStoryboard, setVideoStoryboard] = useState<VideoStoryboard | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);


  useEffect(() => {
    const user = userService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    userService.setCurrentUser(user);
    setShowAuthModal(false);
    if (selectedPlan) {
      setView('checkout');
    } else if (view !== 'ideas' && view !== 'analytics' && view !== 'templates' && view !== 'my-posts') {
      handleReset();
    }
  };

  const handleLogout = () => {
    userService.logoutUser();
    setCurrentUser(null);
    setView('app');
    handleReset();
  };
  
  const handleNavigation = (targetView: AppView) => {
    setError(null);
    if(targetView === 'app' && view === 'app') {
        handleReset();
    }
    if (targetView !== 'templates') {
        setSelectedTemplate(null);
    }
    setView(targetView);
    window.scrollTo(0, 0);
  }

  const handleSettingsSave = async (newSettings: AccountSettings) => {
      if (!currentUser) return;
      try {
          const updatedUser = await userService.updateUserSettings(currentUser.id, newSettings);
          setCurrentUser(updatedUser);
          setView('app');
      } catch (err) {
          console.error(err);
          setError("Falha ao salvar as configurações. Tente novamente.");
      }
  };

  const handleSubscriptionStart = (plan: SelectedPlan) => {
    setSelectedPlan(plan);
    if (currentUser) {
        setView('checkout');
    } else {
        setShowAuthModal(true);
    }
  };

  const handleReset = () => {
    setStep('input');
    setError(null);
    setUserData(null);
    setPlatform(null);
    setThemeSuggestions([]);
    setContentResult(null);
    setCurrentGenerationStep('');
    setSelectedPlan(null);
    setImageSuggestion('');
    setGeneratedImage('');
    setVideoStoryboard(null);
    setSelectedTemplate(null);
  };

  const handleStartGeneration = useCallback(async (newUserData: Omit<UserData, 'model'>, newPlatform: Platform) => {
    setStep('generating_research');
    setError(null);
    setUserData(newUserData);
    setPlatform(newPlatform);

    try {
      setCurrentGenerationStep('Pesquisando temas virais...');
      const themes = await contentService.performMarketResearch({
          profession: newUserData.profession,
          services: newUserData.services,
          specialty: newUserData.area,
          region: newUserData.location || ''
      });
      setThemeSuggestions(themes);
      setStep('theme_selection');

    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro durante a pesquisa inicial. Por favor, tente novamente.');
      setStep('input');
    } finally {
       setCurrentGenerationStep('');
    }
  }, []);
  
  const handleContentGeneration = useCallback(async (selectedTheme: SuggestedTheme, selectedModel: AiModelId) => {
    if (!userData || !platform) {
        setError('Dados da sessão perdidos. Por favor, comece de novo.');
        handleReset();
        return;
    }
    setStep('generating_content');
    setError(null);
    
    const settingsToUse = currentUser?.settings || GUEST_SETTINGS;
    const userTier = currentUser?.tier || 'Iniciante';

    try {
      setCurrentGenerationStep(`Gerando conteúdo com ${selectedModel}...`);

      const rawContent = await contentService.generateContentWithModel({
          theme: selectedTheme,
          platform,
          model: selectedModel,
          userTier,
          userData,
          settings: settingsToUse,
      });
      
      const { post, suggestion } = contentService.parseGeneratedContent(rawContent);
      
      setCurrentGenerationStep('Analisando conformidade ética e médica...');
      const complianceResult = await complianceService.analyzeCompliance(post, platform);
      
      if (currentUser) {
        analyticsService.addGenerationRecord({
            userId: currentUser.id,
            platform,
            modelUsed: selectedModel,
            complianceScore: complianceResult.score,
            postSnippet: post,
        });
      }

      setContentResult({
        post: post,
        imageSuggestion: suggestion,
        generatedImage: '',
        complianceResult: complianceResult
      });
      
      const isProUser = userTier === 'Pro' || userTier === 'Ultra' || userTier === 'Agência';
      const isUltraUser = userTier === 'Ultra' || userTier === 'Agência';

      if (isProUser && suggestion) {
        setImageSuggestion(suggestion);
        setStep('image_creation');
      } else if (isUltraUser && (platform === Platform.Instagram || platform === Platform.TikTok)) {
        setStep('video_creation');
      }
      else {
        setStep('results');
      }
    } catch (err: any) {
       console.error(err);
       setError(err.message || 'Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.');
       setStep('input');
    } finally {
       setCurrentGenerationStep('');
    }

  }, [userData, platform, currentUser]);

  const handleTemplateContentGeneration = useCallback(async (
    template: Template,
    placeholderValues: Record<string, string>,
    platform: Platform,
    model: AiModelId
  ) => {
    setStep('generating_content');
    setView('app'); // Switch to main app flow view
    setError(null);
    setCurrentGenerationStep(`Gerando conteúdo com o template "${template.name}"...`);

    const settingsToUse = currentUser?.settings || GUEST_SETTINGS;
    const userTier = currentUser?.tier || 'Iniciante';

    try {
        const rawContent = await contentService.generateContentFromTemplate({
            template,
            placeholderValues,
            platform,
            model,
            settings: settingsToUse,
            userTier
        });

        const { post, suggestion } = contentService.parseGeneratedContent(rawContent);

        setCurrentGenerationStep('Analisando conformidade ética e médica...');
        const complianceResult = await complianceService.analyzeCompliance(post, platform);

        if (currentUser) {
            analyticsService.addGenerationRecord({
                userId: currentUser.id,
                platform,
                modelUsed: model,
                complianceScore: complianceResult.score,
                postSnippet: post,
            });
        }

        setContentResult({
            post: post,
            imageSuggestion: suggestion,
            generatedImage: '',
            complianceResult: complianceResult
        });
        
        // This flow doesn't use the initial form, so userData is null.
        // ContentPreview will handle this gracefully.
        setUserData(null);
        setPlatform(platform);

        const isProUser = userTier === 'Pro' || userTier === 'Ultra' || userTier === 'Agência';
        const isUltraUser = userTier === 'Ultra' || userTier === 'Agência';

        if (isProUser && suggestion) {
            setImageSuggestion(suggestion);
            setStep('image_creation');
        } else if (isUltraUser && (platform === Platform.Instagram || platform === Platform.TikTok)) {
            setStep('video_creation');
        } else {
            setStep('results');
        }
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.');
        // On error, go back to template form
        setView('templates');
        setStep('input');
    } finally {
        setCurrentGenerationStep('');
    }
  }, [currentUser]);


  const handleImageGeneration = useCallback(async (prompt: string) => {
    if (!contentResult || !platform) return;
    
    setStep('generating_image');
    setError(null);
    setCurrentGenerationStep('Criando sua imagem com IA...');

    try {
        const imageB64 = await contentService.generateImage(prompt);
        const imageUrl = `data:image/jpeg;base64,${imageB64}`;
        setGeneratedImage(imageUrl);
        setContentResult(prev => prev ? ({ ...prev, generatedImage: imageUrl }) : null);
        
        const isUltraUser = currentUser?.tier === 'Ultra' || currentUser?.tier === 'Agência';
        if (isUltraUser && (platform === Platform.Instagram || platform === Platform.TikTok)) {
          setStep('video_creation');
        } else {
          setStep('results');
        }
    } catch(err: any) {
        console.error(err);
        setError(err.message || 'Ocorreu um erro ao gerar a imagem. Por favor, tente novamente.');
        setStep('image_creation');
    } finally {
        setCurrentGenerationStep('');
    }
  }, [contentResult, currentUser, platform]);

  const handleSkipImageGeneration = () => {
    if (!contentResult || !platform) return;
    const isUltraUser = currentUser?.tier === 'Ultra' || currentUser?.tier === 'Agência';
    if (isUltraUser && (platform === Platform.Instagram || platform === Platform.TikTok)) {
      setStep('video_creation');
    } else {
      setStep('results');
    }
  };

  const handleVideoStoryboardGeneration = useCallback(async () => {
    if (!contentResult) return;

    setStep('generating_video_storyboard');
    setError(null);
    setCurrentGenerationStep('Criando roteiro de vídeo...');

    try {
        const settingsToUse = currentUser?.settings || GUEST_SETTINGS;
        const storyboardTemplate = await contentService.generateVideoStoryboard(contentResult.post, settingsToUse.brandVoice);
        
        setCurrentGenerationStep(`Gerando imagens para ${storyboardTemplate.scenes.length} cenas...`);

        const scenesWithImages = await Promise.all(storyboardTemplate.scenes.map(async (scene) => {
            const imageB64 = await contentService.generateImage(scene.visualPrompt);
            return {
                ...scene,
                generatedImage: `data:image/jpeg;base64,${imageB64}`
            };
        }));
        
        const finalStoryboard = { ...storyboardTemplate, scenes: scenesWithImages };
        setVideoStoryboard(finalStoryboard);
        setContentResult(prev => prev ? ({ ...prev, videoStoryboard: finalStoryboard }) : null);
        setStep('results');

    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Ocorreu um erro ao gerar o roteiro do vídeo. Por favor, tente novamente.');
        setStep('video_creation');
    } finally {
        setCurrentGenerationStep('');
    }
  }, [contentResult, currentUser]);

  const handleSkipVideoGeneration = () => {
    if (!contentResult) return;
    setStep('results');
  };


  const renderAppContent = () => {
    switch (step) {
      case 'input':
        return <InputForm onGenerate={handleStartGeneration} userTier={currentUser?.tier || 'Iniciante'}/>;
      case 'generating_research':
      case 'generating_content':
      case 'generating_image':
      case 'generating_video_storyboard':
        return (
          <div className="text-center p-8 bg-surface rounded-lg shadow-sm">
            <LoadingSpinner />
            <p className="mt-4 text-lg font-semibold text-copy-text">{currentGenerationStep}</p>
            <p className="text-copy-text-secondary">Aguarde, nossa IA está trabalhando para você...</p>
          </div>
        );
      case 'theme_selection':
        return <ThemeSelector 
                    suggestions={themeSuggestions} 
                    onConfirm={handleContentGeneration}
                    userTier={currentUser?.tier || 'Iniciante'}
                />;
      case 'image_creation':
        return <ImageCreator 
                  textPost={contentResult?.post || ''}
                  initialPrompt={imageSuggestion}
                  onGenerate={handleImageGeneration}
                  onSkip={handleSkipImageGeneration}
                />;
      case 'video_creation':
        return <VideoCreator
            textPost={contentResult?.post || ''}
            onGenerate={handleVideoStoryboardGeneration}
            onSkip={handleSkipVideoGeneration}
        />;
      case 'results':
        return contentResult && platform && currentUser ? (
          <ContentPreview 
            result={contentResult} 
            originalPlatform={platform}
            onReset={handleReset} 
            userData={userData || undefined}
            onGenerateNewContent={handleContentGeneration}
            user={currentUser}
          />
        ) : null;
    }
  };
  
  const AuthWall: React.FC<{children: React.ReactNode, title: string, message: string}> = ({ children, title, message }) => {
    if (currentUser) {
      return <>{children}</>;
    }
    return (
      <div className="text-center bg-surface p-8 rounded-xl border border-custom-border shadow-sm">
        <h3 className="text-xl font-bold text-copy-text">{title}</h3>
        <p className="text-copy-text-secondary mt-2 max-w-md mx-auto">{message}</p>
        <button
          onClick={() => {
              setSelectedPlan(null);
              setShowAuthModal(true);
          }}
          className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-primary-600 transition-colors"
        >
          Fazer Login ou Criar Conta
        </button>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (view) {
        case 'about':
            return <AboutPage />;
        case 'ideas':
            return <IdeaSearch user={currentUser} onLoginRequest={() => setShowAuthModal(true)} />;
        case 'compliance':
            return <ComplianceChecker />;
        case 'my-posts':
            return (
              <AuthWall title="Minhas Publicações" message="Acesse seu histórico de posts salvos para reutilizar e gerenciar seu conteúdo. Faça login para visualizar suas publicações.">
                 <MyPostsPage user={currentUser!} />
              </AuthWall>
            );
        case 'templates':
            return selectedTemplate ? (
                <TemplateForm
                    template={selectedTemplate}
                    onGenerate={handleTemplateContentGeneration}
                    onBack={() => setSelectedTemplate(null)}
                    userTier={currentUser?.tier || 'Iniciante'}
                />
            ) : (
                <TemplateLibrary
                    onSelectTemplate={setSelectedTemplate}
                    user={currentUser}
                />
            );
        case 'analytics':
             return (
                <AuthWall title="Recurso Exclusivo para Membros" message="Acompanhe a performance e o histórico de suas criações. Faça login para acessar o painel de Analytics.">
                    <AnalyticsPage user={currentUser!} />
                </AuthWall>
             );
        case 'settings':
            return currentUser ? (
                <AccountSettingsComponent 
                    user={currentUser} 
                    onSave={handleSettingsSave}
                    onCancel={() => handleNavigation('app')}
                />
            ) : null;
        case 'pricing':
            return <PricingPage onStartSubscription={handleSubscriptionStart} />;
        case 'checkout':
            return currentUser && selectedPlan ? (
                <CheckoutPage 
                    user={currentUser} 
                    plan={selectedPlan}
                    setPlan={setSelectedPlan}
                    onBack={() => setView('pricing')} 
                />
            ) : null;
        case 'app':
        default:
            return (
                <>
                    <StepIndicator currentStep={step} userTier={currentUser?.tier || 'Iniciante'} />
                    <div className="mt-8">
                        {renderAppContent()}
                    </div>
                </>
            );
    }
  }

  return (
    <div className="min-h-screen bg-background text-copy-text font-sans flex flex-col">
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        onNavigate={handleNavigation} 
        currentView={view} 
        onShowAuth={() => {
            setSelectedPlan(null);
            setShowAuthModal(true);
        }}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-4 mb-6 rounded-md" role="alert">
              <p className="font-bold">Erro</p>
              <p>{error}</p>
            </div>
          )}
          {renderCurrentView()}
        </div>
      </main>
      <Footer onNavigate={handleNavigation} />
      {showAuthModal && (
        <Auth onLoginSuccess={handleLoginSuccess} onClose={() => {
            setShowAuthModal(false)
            setSelectedPlan(null);
        }} />
      )}
    </div>
  );
};

export default App;