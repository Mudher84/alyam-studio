import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Teacher } from '../../types';

const COLLECTION_NAME = 'teachers';

export const teacherService = {
  async getAll(): Promise<Teacher[]> {
    try {
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const teachers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
      
      // Safe in-memory sorting that guarantees no documents are excluded
      return teachers.sort((a, b) => {
        const orderA = typeof a.order === 'number' ? a.order : 999999;
        const orderB = typeof b.order === 'number' ? b.order : 999999;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async add(data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const newRef = doc(collection(db, COLLECTION_NAME));
      // Ensure 'order' field is set to prevent any missing field issues
      const order = typeof data.order === 'number' ? data.order : Date.now();
      await setDoc(newRef, {
        ...data,
        order,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return newRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, COLLECTION_NAME);
      throw e;
    }
  },

  async update(id: string, data: Partial<Teacher>): Promise<void> {
    try {
      const ref = doc(db, COLLECTION_NAME, id);
      await updateDoc(ref, {
        ...data,
        updatedAt: Date.now()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      throw e;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const ref = doc(db, COLLECTION_NAME, id);
      await deleteDoc(ref);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
      throw e;
    }
  }
};
