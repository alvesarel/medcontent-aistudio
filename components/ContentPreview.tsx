

import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import { ContentResult, Platform, VideoStoryboard, SuggestedTheme, AiModelId, User, UserData } from '../types';
import * as postService from '../services/postService';
import * as contentService from '../services/contentService';
import { PLATFORM_OPTIONS } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import ComplianceReport from './ComplianceReport';
import HashtagTool from './HashtagTool';

interface ContentPreviewProps {
  result: ContentResult;
  originalPlatform: Platform;
  onReset: () => void;
  userData?: Omit<UserData, 'model'>; // Made optional for template flow
  user: User;
  onGenerateNewContent: (theme: SuggestedTheme, model: AiModelId) => void;
}

const VideoStoryboardPreview: React.FC<{ storyboard: VideoStoryboard }> = ({ storyboard }) => {
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
          setCopiedStates(prev => ({ ...prev, [id]: true }));
          setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
        });
    };

    return (
        <div className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm">
            <h2 className="text-2xl font-bold text-copy-text">{storyboard.title || 'Roteiro de Vídeo (Storyboard)'}</h2>
            <p className="text-copy-text-secondary mt-1">Use este roteiro e imagens para criar um vídeo curto para Reels ou TikTok.</p>

            <div className="mt-6 space-y-8">
                {storyboard.scenes.map((scene, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-custom-border pt-6 first:border-t-0 first:pt-0">
                        {scene.generatedImage && (
                            <img src={scene.generatedImage} alt={`Imagem para cena ${scene.sceneNumber}`} className="w-full h-auto object-cover rounded-lg aspect-square" />
                        )}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-copy-text">Cena {scene.sceneNumber}</h3>
                            <div className="text-sm text-copy-text-secondary leading-relaxed space-y-1">
                                <p className="font-semibold text-copy-text">Narração:</p>
                                <p>{scene.narration}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(scene.narration, `scene_${scene.sceneNumber}`)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center space-x-2 border ${
                                copiedStates[`scene_${scene.sceneNumber}`]
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                                }`}
                                >
                                {copiedStates[`scene_${scene.sceneNumber}`] ? "Copiado!" : "Copiar Narração"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ContentPreview: React.FC<ContentPreviewProps> = ({ result, originalPlatform, onReset, userData, user, onGenerateNewContent }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [adaptedContent, setAdaptedContent] = useState<Record<string, { loading: boolean; content: string | null; error: string | null }>>({});
  const [editedPost, setEditedPost] = useState(result.post);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);


  const handleCopy = (text: string, id: string) => {
    if(!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setCopiedStates(prev => ({ ...prev, [id]: false })), 2000);
    });
  };

  const handleAdaptContent = async (targetPlatform: Platform) => {
    setAdaptedContent(prev => ({ ...prev, [targetPlatform]: { loading: true, content: null, error: null } }));
    try {
      const adaptedText = await contentService.adaptContentForPlatform(editedPost, targetPlatform);
      setAdaptedContent(prev => ({ ...prev, [targetPlatform]: { loading: false, content: adaptedText, error: null } }));
    } catch (err: any) {
      setAdaptedContent(prev => ({ ...prev, [targetPlatform]: { loading: false, content: null, error: err.message } }));
    }
  };

  const handleSavePost = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await postService.savePost(user.id, {
        postContent: editedPost,
        imageUrl: result.generatedImage,
        hashtags: Array.from(selectedHashtags),
        platform: originalPlatform,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (error) {
      console.error("Failed to save post", error);
      alert("Falha ao salvar o post. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };


  const CopyButton: React.FC<{ textToCopy: string, id: string }> = ({ textToCopy, id }) => {
    const copied = copiedStates[id] || false;
    return (
      <button
        onClick={() => handleCopy(textToCopy, id)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center space-x-2 border ${
          copied
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
        }`}
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.052-.143Z" clipRule="evenodd" /></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7V3.5ZM9 4.5a1.5 1.5 0 0 1 1.5-1.5h.379a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .44 1.061V9A1.5 1.5 0 0 1 13 10.5h-1.5a3 3 0 0 0-3-3V4.5Z" /><path d="M4.5 6.5A1.5 1.5 0 0 0 3 8v6.5A1.5 1.5 0 0 0 4.5 16h6.5a1.5 1.5 0 0 0 1.5-1.5V8a1.5 1.5 0 0 0-1.5-1.5h-5v1A1.5 1.5 0 0 1 6 6.5H4.5Z" /></svg>
        )}
        <span className="ml-2">{copied ? 'Copiado!' : 'Copiar'}</span>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      {result.videoStoryboard && <VideoStoryboardPreview storyboard={result.videoStoryboard} />}
      
      {result.complianceResult && <ComplianceReport result={result.complianceResult} />}

      <div className="bg-surface p-6 sm:p-8 rounded-xl border border-custom-border shadow-sm">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
                <h2 className="text-2xl font-bold text-copy-text">Conteúdo Gerado para {originalPlatform}</h2>
                <p className="text-copy-text-secondary mt-1">Aqui está o conteúdo criado pela IA. Use os botões para copiar ou adaptar.</p>
            </div>
             <div className="flex gap-2">
                <button
                    onClick={onReset}
                    className="bg-slate-200 text-slate-800 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-300 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M15.312 5.312a.75.75 0 0 1 0 1.061L11.873 10l3.439 3.439a.75.75 0 1 1-1.06 1.061L10.812 11.06l-3.439 3.44a.75.75 0 1 1-1.06-1.061L9.752 10 6.313 6.561a.75.75 0 0 1 1.06-1.061L10.812 8.94l3.439-3.439a.75.75 0 0 1 1.061 0Z" clipRule="evenodd" /></svg>
                    Criar Novo
                </button>
                 <button
                    onClick={handleSavePost}
                    disabled={isSaving || saveSuccess}
                    className={`font-bold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2 ${saveSuccess ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-600'}`}
                >
                   {isSaving ? <LoadingSpinner /> : (saveSuccess ? 'Salvo!' : 'Salvar Post')}
                </button>
            </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-copy-text">Post Principal</h3>
                    <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-semibold text-primary hover:underline">
                        {isEditing ? 'Visualizar' : 'Editar'}
                    </button>
                 </div>
                 {isEditing ? (
                    <textarea 
                        value={editedPost}
                        onChange={(e) => setEditedPost(e.target.value)}
                        className="w-full h-96 p-4 bg-slate-50 border border-custom-border rounded-lg focus:ring-primary focus:border-primary text-copy-text-secondary leading-relaxed"
                    />
                 ) : (
                    <div className="p-6 bg-slate-50 rounded-lg border border-custom-border h-full min-h-96">
                        <div className="whitespace-pre-wrap text-copy-text-secondary leading-relaxed markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(editedPost) }} />
                    </div>
                 )}
            </div>
             <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold text-copy-text">Ações Rápidas</h3>
                    <div className="flex gap-2">
                        <CopyButton textToCopy={editedPost} id="main_post" />
                        {result.imageSuggestion && <CopyButton textToCopy={result.imageSuggestion} id="image_suggestion" />}
                    </div>
                </div>

                {result.generatedImage && (
                    <div>
                        <h3 className="font-semibold text-copy-text mb-2">Imagem Gerada</h3>
                        <img src={result.generatedImage} alt="Imagem gerada por IA" className="rounded-lg w-full h-auto object-cover border border-custom-border aspect-square" />
                    </div>
                )}

                <div>
                     <h3 className="font-semibold text-copy-text">Adaptar para outra plataforma</h3>
                     <div className="mt-2 grid grid-cols-2 gap-2">
                        {PLATFORM_OPTIONS.filter(p => p !== originalPlatform).map(p => (
                            <button
                                key={p}
                                onClick={() => handleAdaptContent(p)}
                                disabled={adaptedContent[p]?.loading}
                                className="w-full text-center py-2 px-3 border border-custom-border rounded-lg text-sm font-semibold text-copy-text-secondary hover:border-primary hover:text-primary transition"
                            >
                                {adaptedContent[p]?.loading ? 'Adaptando...' : `Adaptar para ${p}`}
                            </button>
                        ))}
                     </div>
                </div>
             </div>
        </div>

         {Object.entries(adaptedContent).map(([platform, data]) => {
            if(data.error) {
                 return (
                    <div key={platform} className="mt-6 pt-6 border-t border-custom-border">
                        <h3 className="text-xl font-bold text-red-600">Falha ao adaptar para {platform}</h3>
                        <p className="text-copy-text-secondary mt-2">{data.error}</p>
                    </div>
                );
            }
            if(data.content) {
                return (
                    <div key={platform} className="mt-6 pt-6 border-t border-custom-border">
                        <h3 className="text-xl font-bold text-copy-text">Conteúdo Adaptado para {platform}</h3>
                        <div className="mt-4 p-6 bg-slate-50 rounded-lg border border-custom-border relative">
                            <div className="absolute top-3 right-3">
                               <CopyButton textToCopy={data.content} id={`adapted_${platform}`} />
                            </div>
                            <div className="whitespace-pre-wrap text-copy-text-secondary leading-relaxed pr-24 markdown-content" dangerouslySetInnerHTML={{ __html: marked.parse(data.content) }} />
                        </div>
                    </div>
                )
            }
            return null;
        })}
      </div>
       {userData && (
        <HashtagTool
          content={editedPost}
          specialty={userData.area}
          location={userData.location || ''}
          selectedTags={selectedHashtags}
          onSelectionChange={setSelectedHashtags}
        />
      )}
    </div>
  );
};

export default ContentPreview;