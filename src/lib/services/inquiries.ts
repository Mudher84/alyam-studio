import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Inquiry } from '../../types';

const COLLECTION_NAME = 'inquiries';

export const inquiryService = {
  async getAll(): Promise<Inquiry[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async add(data: Omit<Inquiry, 'id' | 'createdAt'>): Promise<string> {
    const newRef = doc(collection(db, COLLECTION_NAME));
    try {
      await setDoc(newRef, {
        ...data,
        createdAt: Date.now()
      });
      return newRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
      return '';
    }
  },

  async update(id: string, data: Partial<Inquiry>): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    try {
      await updateDoc(ref, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async delete(id: string): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, id);
    try {
      await deleteDoc(ref);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  }
};
