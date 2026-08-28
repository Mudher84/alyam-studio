import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../../types';

const COLLECTION_NAME = 'services';

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
  },

  async add(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const newRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(newRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return newRef.id;
  },

  async update(id: string, data: Partial<Service>): Promise<void> {
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
