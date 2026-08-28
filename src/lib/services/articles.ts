import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Article, ArticleRevision } from '../../types';
import { INITIAL_ARTICLES } from '../../data/initialContent';
import slugify from 'slugify';

const COLLECTION_NAME = 'articles';

export const articleService = {
  async getAll(): Promise<Article[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      return docs.length > 0 ? docs : INITIAL_ARTICLES;
    } catch (err) {
      if (err instanceof Error && err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
      }
      console.warn('Firestore error, returning initial articles:', err);
      return INITIAL_ARTICLES;
    }
  },
  
  async getPublished(): Promise<Article[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('status', '==', 'published'),
        orderBy('publishDate', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      return docs.length > 0 ? docs : INITIAL_ARTICLES;
    } catch (err) {
      if (err instanceof Error && err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, COLLECTION_NAME);
      }
      console.warn('Firestore error, returning published initial articles:', err);
      return INITIAL_ARTICLES;
    }
  },

  async getBySlug(slug: string): Promise<Article | null> {
    try {
      const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Article;
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.GET, COLLECTION_NAME);
      }
      console.warn('Firestore error in getBySlug:', err);
    }
    return INITIAL_ARTICLES.find(a => a.slug === slug) || null;
  },

  async create(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    const newDocRef = doc(collection(db, COLLECTION_NAME));
    const now = Date.now();
    
    let safeSlug = slugify(data.slug, { lower: true, strict: true });
    const existing = await this.getBySlug(safeSlug);
    if (existing) {
      safeSlug = `${safeSlug}-${Date.now().toString().slice(-4)}`;
    }
    
    const article: Article = {
      ...data,
      id: newDocRef.id,
      slug: safeSlug,
      createdAt: now,
      updatedAt: now,
    };
    
    try {
      await setDoc(newDocRef, article);
      await this.createRevision(article.id, article.title, article.content, 'Initial creation');
      return article;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
      throw error;
    }
  },

  async update(id: string, data: Partial<Omit<Article, 'id' | 'createdAt' | 'updatedAt'>>, saveRevision = false): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    if (data.slug) {
      let safeSlug = slugify(data.slug, { lower: true, strict: true });
      const existing = await this.getBySlug(safeSlug);
      if (existing && existing.id !== id) {
        data.slug = `${safeSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        data.slug = safeSlug;
      }
    }

    try {
      await updateDoc(docRef, {
        ...data,
        updatedAt: Date.now()
      });

      if (saveRevision && data.content && data.title) {
        await this.createRevision(id, data.title, data.content, 'Manual save');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, COLLECTION_NAME);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COLLECTION_NAME);
    }
  },

  async createRevision(articleId: string, title: string, content: string, note?: string): Promise<void> {
    const revRef = doc(collection(db, `${COLLECTION_NAME}/${articleId}/revisions`));
    const revision: ArticleRevision = {
      id: revRef.id,
      articleId,
      title,
      content,
      createdAt: Date.now(),
      note,
    };
    try {
      await setDoc(revRef, revision);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${articleId}/revisions`);
    }
  },

  async getRevisions(articleId: string): Promise<ArticleRevision[]> {
    const path = `${COLLECTION_NAME}/${articleId}/revisions`;
    try {
      const q = query(
        collection(db, path),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArticleRevision));
    } catch (err) {
      if (err instanceof Error && err.message.includes('permission')) {
        handleFirestoreError(err, OperationType.LIST, path);
      }
      return [];
    }
  }
};
