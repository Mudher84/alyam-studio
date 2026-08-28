import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { StudioPage } from '../../types';

const COLLECTION_NAME = 'pages';

export const DEFAULT_PAGES: Omit<StudioPage, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Portfolio', name_ar: 'معرض الأعمال', slug: '/portfolio', categories: ['All', 'Covers', 'Booklets', 'Software', 'Apps'], status: 'active', order: 1 },
  { name: 'Educational Covers', name_ar: 'الأغلفة التعليمية', slug: '/covers', categories: ['Educational Covers', 'Book Covers'], status: 'active', order: 2 },
  { name: 'Booklets & Summaries', name_ar: 'الملازم', slug: '/booklets', categories: ['Booklets'], status: 'active', order: 3 },
  { name: 'Websites', name_ar: 'المواقع', slug: '/websites', categories: ['Web Applications', 'Scripts'], status: 'active', order: 4 },
  { name: 'Software Systems', name_ar: 'البرمجيات', slug: '/software', categories: ['Software'], status: 'active', order: 5 },
  { name: 'Mobile Apps', name_ar: 'التطبيقات', slug: '/apps', categories: ['Apps', 'Mobile Apps'], status: 'active', order: 6 },
  { name: 'Magazine & Articles', name_ar: 'المجلة', slug: '/magazine', categories: ['Articles'], status: 'active', order: 7 },
  { name: 'Services', name_ar: 'الخدمات', slug: '/services', categories: ['Services'], status: 'active', order: 8 },
  { name: 'About Studio', name_ar: 'عن الاستوديو', slug: '/about', categories: ['About'], status: 'active', order: 9 },
  { name: 'Contact Us', name_ar: 'تواصل معنا', slug: '/contact', categories: ['Contact'], status: 'active', order: 10 }
];

export const pageService = {
  async getAll(): Promise<StudioPage[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Seed default pages if collection is empty
      const seeded: StudioPage[] = [];
      for (const defPage of DEFAULT_PAGES) {
        const newRef = doc(collection(db, COLLECTION_NAME));
        const newPage: StudioPage = {
          ...defPage,
          id: newRef.id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(newRef, newPage);
        seeded.push(newPage);
      }
      return seeded;
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudioPage));
  },

  async add(data: Omit<StudioPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(newRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return newRef.id;
  },

  async update(id: string, data: Partial<StudioPage>): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await updateDoc(ref, {
      ...data,
      updatedAt: Date.now()
    });
  },

  async delete(id: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    await deleteDoc(ref);
  }
};
