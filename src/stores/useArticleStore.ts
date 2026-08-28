import { create } from 'zustand';
import { Article } from '../types';
import { articleService } from '../lib/services/articles';
import { activityLogService } from '../lib/services/activity';
import { auth } from '../lib/firebase';

interface ArticleState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  fetchArticles: () => Promise<void>;
  fetchPublished: () => Promise<Article[]>;
  addArticle: (data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Article>;
  updateArticle: (id: string, data: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  loading: false,
  error: null,

  fetchArticles: async () => {
    set({ loading: true, error: null });
    try {
      const articles = await articleService.getAll();
      set({ articles, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchPublished: async () => {
    try {
      return await articleService.getPublished();
    } catch (error: any) {
      return [];
    }
  },

  addArticle: async (data) => {
    const newArticle = await articleService.create(data);
    set(state => ({ articles: [newArticle, ...state.articles] }));
    
    activityLogService.logAction(
      auth.currentUser?.uid || 'unknown',
      'article_created',
      `Created article: ${newArticle.title}`,
      'article',
      newArticle.id,
      newArticle.title
    );

    return newArticle;
  },

  updateArticle: async (id, data) => {
    await articleService.update(id, data);
    
    const existing = get().articles.find(a => a.id === id);
    const wasPublished = existing?.status !== 'published' && data.status === 'published';
    const title = data.title || existing?.title;
    
    set(state => ({
      articles: state.articles.map(a => a.id === id ? { ...a, ...data, updatedAt: Date.now() } : a)
    }));
    
    activityLogService.logAction(
      auth.currentUser?.uid || 'unknown',
      wasPublished ? 'article_published' : 'article_updated',
      wasPublished ? `Published article: ${title}` : `Updated article: ${title}`,
      'article',
      id,
      title
    );
  },

  deleteArticle: async (id) => {
    const existing = get().articles.find(a => a.id === id);
    await articleService.delete(id);
    
    set(state => ({
      articles: state.articles.filter(a => a.id !== id)
    }));
    
    activityLogService.logAction(
      auth.currentUser?.uid || 'unknown',
      'article_deleted',
      `Deleted article: ${existing?.title || id}`,
      'article',
      id,
      existing?.title
    );
  }
}));
