import React, { useState, useEffect } from 'react';
import { SavedPost, User } from '../types';
import * as postService from '../services/postService';
import LoadingSpinner from './LoadingSpinner';

interface MyPostsPageProps {
  user: User;
}

const PostCard: React.FC<{
  post: SavedPost;
  onDelete: (postId: string) => void;
  onCopy: (text: string) => void;
}> = ({ post, onDelete, onCopy }) => {

  const fullContentToCopy = `${post.postContent}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}`;

  return (
    <div className="bg-surface border border-custom-border rounded-xl shadow-sm flex flex-col overflow-hidden group">
      {post.imageUrl ? (
        <img src={post.imageUrl} alt="Post image" className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-xs text-copy-text-secondary">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
        <p className="text-sm text-copy-text mt-2 flex-grow max-h-24 overflow-hidden">
          {post.postContent.substring(0, 120)}...
        </p>
        <div className="mt-4 pt-4 border-t border-custom-border flex items-center gap-2">
           <button 
              onClick={() => onCopy(fullContentToCopy)}
              className="flex-1 text-center py-2 px-3 border border-primary/20 bg-primary/10 rounded-lg text-sm font-semibold text-primary hover:bg-primary/20 transition"
            >
              Copiar
            </button>
            <button 
              onClick={() => onDelete(post.id)}
              className="flex-1 text-center py-2 px-3 border border-red-500/20 bg-red-500/10 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-500/20 transition"
            >
              Excluir
            </button>
        </div>
      </div>
    </div>
  );
};

const MyPostsPage: React.FC<MyPostsPageProps> = ({ user }) => {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const userPosts = await postService.getPosts(user.id);
        setPosts(userPosts);
      } catch (err) {
        setError("Não foi possível carregar suas publicações.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user.id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDeleteRequest = (postId: string) => {
    setPostToDelete(postId);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(user.id, postToDelete);
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete));
    } catch (err) {
      setError("Falha ao excluir a publicação.");
      console.error(err);
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };


  if (isLoading) {
    return (
      <div className="text-center p-8">
        <LoadingSpinner />
        <p className="mt-4 text-copy-text-secondary">Carregando suas publicações...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-copy-text">Minhas Publicações</h2>
        <p className="text-copy-text-secondary mt-2 max-w-2xl mx-auto">
          Aqui estão todos os conteúdos que você salvou. Gerencie, copie ou revise seus posts.
        </p>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center bg-surface p-12 rounded-xl border-2 border-dashed border-custom-border">
            <h3 className="text-xl font-semibold text-copy-text">Nenhuma publicação salva ainda</h3>
            <p className="text-copy-text-secondary mt-2">Comece a gerar conteúdo e salve-o para vê-lo aqui!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDeleteRequest} onCopy={handleCopy}/>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-surface rounded-xl shadow-lg p-6 w-full max-w-sm m-4 text-center">
                <h3 className="text-lg font-bold text-copy-text">Confirmar Exclusão</h3>
                <p className="text-sm text-copy-text-secondary mt-2">
                    Tem certeza de que deseja excluir esta publicação? Esta ação não pode ser desfeita.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={() => setPostToDelete(null)} disabled={isDeleting} className="px-6 py-2 rounded-md font-semibold text-copy-text-secondary bg-slate-200 hover:bg-slate-300 transition">
                        Cancelar
                    </button>
                    <button onClick={handleConfirmDelete} disabled={isDeleting} className="px-6 py-2 rounded-md font-semibold text-white bg-red-600 hover:bg-red-700 transition">
                        {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Copy Success Toast */}
      {copySuccess && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-copy-text text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            Conteúdo copiado para a área de transferência!
        </div>
      )}

    </div>
  );
};

export default MyPostsPage;