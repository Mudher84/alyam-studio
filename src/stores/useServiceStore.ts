import { create } from 'zustand';
import { Service } from '../types';
import { serviceService } from '../lib/services/services';
import { auth } from '../lib/firebase';
import { activityLogService } from '../lib/services/activity';

interface ServiceState {
  services: Service[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  addService: (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateService: (id: string, data: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  loading: false,
  error: null,

  fetchServices: async () => {
    set({ loading: true, error: null });
    try {
      let services = await serviceService.getAll();
      if (services.length === 0) {
        // Seed initial services
        const initialServices = [
          {
            title: "Print & Book Cover Design",
            title_ar: "تصميم الأغلفة والطباعة",
            description: "Designing premium covers for books, novels, and educational booklets with utmost quality.",
            description_ar: "تصميم أغلفة مميزة للكتب والروايات والملازم الدراسية بجودة عالية واحترافية متناهية.",
            iconName: "PenTool",
            imageUrl: "https://images.unsplash.com/photo-1628155930533-8e066b7b5320?q=80&w=1000&auto=format&fit=crop",
            status: "active" as const,
            features: ["تصاميم إبداعية", "أغلفة ملازم", "تنسيق طباعة", "ألوان متناسقة"],
            link: "/covers",
            order: 1
          },
          {
            title: "Custom Software & Systems",
            title_ar: "البرمجيات والأنظمة الخاصة",
            description: "Developing custom web systems, cloud dashboards, and accounting/management systems matching your needs.",
            description_ar: "تطوير أنظمة ويب مخصصة، لوحات تحكم سحابية، وأنظمة محاسبية وإدارية تلبي احتياجاتك.",
            iconName: "Code",
            imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
            status: "active" as const,
            features: ["مواقع مخصصة", "إدارة أعمال", "أنظمة محاسبية", "لوحات تحكم"],
            link: "/software",
            order: 2
          },
          {
            title: "Ready-Made Scripts & Sites",
            title_ar: "السكربتات والمواقع الجاهزة",
            description: "A selection of ready-made scripts and systems for instant sale to launch your store or educational site.",
            description_ar: "مجموعة من السكربتات والأنظمة الجاهزة للبيع الفوري لتشغيل متجرك أو موقعك التعليمي بسرعة.",
            iconName: "Layout",
            imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop",
            status: "active" as const,
            features: ["متاجر إلكترونية", "سكربتات خاصة", "تركيب فوري", "دعم فني"],
            link: "/websites",
            order: 3
          },
          {
            title: "Branding & Visual Identity",
            title_ar: "الهوية البصرية والشعارات",
            description: "Building a comprehensive visual identity that represents your brand and leaves a unique impression.",
            description_ar: "بناء هوية بصرية متكاملة تعبر عن علامتك التجارية وتترك انطباعاً فريداً ومميزاً.",
            iconName: "Lightbulb",
            imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
            status: "active" as const,
            features: ["تصميم شعارات", "هوية بصرية", "مطبوعات تجارية", "دليل استخدام"],
            link: "/contact",
            order: 4
          }
        ];

        for (const item of initialServices) {
          try {
            await serviceService.add(item);
          } catch (e) {
            console.error("Error seeding initial service:", e);
          }
        }
        services = await serviceService.getAll();
      }
      set({ services, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addService: async (data) => {
    try {
      const id = await serviceService.add(data);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'create', 'Created service', 'service', id);
      }
      await get().fetchServices();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateService: async (id, data) => {
    try {
      await serviceService.update(id, data);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'update', 'Updated service', 'service', id);
      }
      await get().fetchServices();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteService: async (id) => {
    try {
      await serviceService.delete(id);
      const user = auth.currentUser;
      if (user) {
        activityLogService.logAction(user.uid, 'delete', 'Deleted service', 'service', id);
      }
      await get().fetchServices();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));
