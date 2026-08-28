import { create } from 'zustand';
import { Teacher } from '../types';
import { teacherService } from '../lib/services/teachers';
import { auth } from '../lib/firebase';
import { activityLogService } from '../lib/services/activity';

export function formatArabicTeacherName(val: string): string {
  if (!val) return '';
  let trimmed = val.trim();
  trimmed = trimmed.replace(/^(أ\s*\.\s*|أ\s+)+/g, '').trim();
  if (!trimmed) return '';
  return `أ. ${trimmed}`;
}

export function formatEnglishTeacherName(val: string): string {
  if (!val) return '';
  let trimmed = val.trim();
  trimmed = trimmed.replace(/^([tT]\s*\.\s*|[tT]\s+)+/g, '').trim();
  if (!trimmed) return '';
  return `T. ${trimmed}`;
}

const DEFAULT_TEACHERS: Teacher[] = [];

interface TeacherState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
  fetchTeachers: () => Promise<void>;
  addTeacher: (data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTeacher: (id: string, data: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  teachers: DEFAULT_TEACHERS,
  loading: false,
  error: null,

  fetchTeachers: async () => {
    set({ loading: true, error: null });
    try {
      const fetched = await teacherService.getAll();
      if (fetched && fetched.length > 0) {
        set({ teachers: fetched, loading: false });
      } else {
        set({ teachers: DEFAULT_TEACHERS, loading: false });
      }
    } catch (error: any) {
      console.warn('Using default teachers state due to fetch error:', error);
      set({ teachers: get().teachers.length > 0 ? get().teachers : DEFAULT_TEACHERS, loading: false });
    }
  },

  addTeacher: async (data) => {
    // Ensure automatic prefixes are correctly applied
    const formattedData = {
      ...data,
      name_ar: formatArabicTeacherName(data.name_ar),
      name_en: formatEnglishTeacherName(data.name_en),
    };

    try {
      const id = await teacherService.add(formattedData);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'create', `Created teacher profile: ${formattedData.name_ar}`, 'teacher', id);
      }
      await get().fetchTeachers();
    } catch (error: any) {
      // Local fallback insertion if firestore fails
      const newTeacher: Teacher = {
        ...formattedData,
        id: 't-' + Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      set(state => ({ teachers: [newTeacher, ...state.teachers] }));
    }
  },

  updateTeacher: async (id, data) => {
    const formattedData = { ...data };
    if (formattedData.name_ar) {
      formattedData.name_ar = formatArabicTeacherName(formattedData.name_ar);
    }
    if (formattedData.name_en) {
      formattedData.name_en = formatEnglishTeacherName(formattedData.name_en);
    }

    try {
      await teacherService.update(id, formattedData);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'update', `Updated teacher profile: ${id}`, 'teacher', id);
      }
      await get().fetchTeachers();
    } catch (error: any) {
      // Local fallback update
      set(state => ({
        teachers: state.teachers.map(t => t.id === id ? { ...t, ...formattedData, updatedAt: Date.now() } : t)
      }));
    }
  },

  deleteTeacher: async (id) => {
    try {
      await teacherService.delete(id);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'delete', `Deleted teacher profile: ${id}`, 'teacher', id);
      }
      await get().fetchTeachers();
    } catch (error: any) {
      set(state => ({ teachers: state.teachers.filter(t => t.id !== id) }));
    }
  }
}));
