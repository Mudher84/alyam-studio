import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { getLocalizedField } from '../../lib/localize';
import { getCategoryLabel } from '../../lib/utils';
import ProjectForm from '../../components/cms/ProjectForm';
import { Project } from '../../types';

interface ProjectsProps {
  categoryFilter?: string | string[];
  pageTitle?: string;
  pageSubtitle?: string;
  defaultCategory?: string;
  createButtonText?: string;
}

export default function Projects({
  categoryFilter,
  pageTitle,
  pageSubtitle,
  defaultCategory,
  createButtonText
}: ProjectsProps) {
  const { t, language, isRTL } = useLanguageStore();
  const { projects, loading, fetchProjects, addProject, updateProject, deleteProject } = useProjectStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('cms.confirmDeleteProject'))) {
      await deleteProject(id);
    }
  };

  const handleFormSubmit = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
    } else {
      await addProject(data);
    }
    setIsFormOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    if (categoryFilter) {
      if (Array.isArray(categoryFilter)) {
        if (!categoryFilter.includes(p.category)) return false;
      } else {
        if (p.category !== categoryFilter) return false;
      }
    }
    const title = getLocalizedField(p, 'title', language).toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || cat.includes(query) || (p.title || '').toLowerCase().includes(query);
  });

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-black">{pageTitle || t('cms.projectsTitle')}</h1>
          <p className="text-gray-500 mt-1">{pageSubtitle || t('cms.projectsSubtitle')}</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          {createButtonText || t('cms.newProject')}
        </button>
      </header>

      <div className="bg-[#FCFAF7] border border-[#E0D7C9] rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-[#E0D7C9] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input 
              type="text"
              placeholder={t('cms.searchProjects')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-[#F6F2EB] border border-[#E0D7C9] rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all`}
            />
          </div>
        </div>
        
        {/* Mobile & Tablet Card Layout */}
        <div className="block lg:hidden p-4 space-y-4">
          {loading && projects.length === 0 ? (
            <div className="py-12 text-center text-gray-400">{t('cms.loadingProjects')}</div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-gray-400">{t('cms.noProjectsFound')}</div>
          ) : (
            filteredProjects.map((project) => {
              const projectTitle = getLocalizedField(project, 'title', language);
              return (
                <div key={project.id} className="p-4 bg-[#FCFAF7] rounded-xl border border-[#E0D7C9] shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    {project.coverImage ? (
                      <img src={project.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-[#F6F2EB] shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#F6F2EB] flex items-center justify-center text-gray-400 font-serif text-xs shrink-0">IMG</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-black text-sm truncate">{projectTitle}</h3>
                      <p className="text-xs text-gray-400 truncate">{project.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{getCategoryLabel(project.category)}</span>
                    <span className={`px-2 py-0.5 font-medium rounded-full ${
                      project.status === 'published' ? 'bg-green-50 text-green-700' :
                      project.status === 'archived' ? 'bg-gray-100 text-gray-600' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {project.status === 'published' ? t('cms.published') : project.status === 'archived' ? t('cms.archived') : t('cms.draft')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400 pt-2.5 border-t border-[#E0D7C9]">
                    <span>{new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' }).format(new Date(project.createdAt))}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => window.open(`/portfolio/${project.slug}`, '_blank')} 
                        className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-[#F6F2EB] transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(project)} 
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block overflow-x-auto flex-1">
          <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
            <thead>
              <tr className="bg-[#F6F2EB]/80 border-b border-[#E0D7C9]">
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.projectName')}</th>
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.category')}</th>
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.status')}</th>
                <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('cms.date')}</th>
                <th className={`py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider ${isRTL ? 'text-left' : 'text-right'}`}>{t('cms.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D7C9]">
              {loading && projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">{t('cms.loadingProjects')}</td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">{t('cms.noProjectsFound')}</td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const projectTitle = getLocalizedField(project, 'title', language);
                  return (
                    <tr key={project.id} className="hover:bg-[#F6F2EB]/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {project.coverImage ? (
                            <img src={project.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#F6F2EB]" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#F6F2EB] flex items-center justify-center text-gray-400 font-serif text-xs">IMG</div>
                          )}
                          <div>
                            <div className="font-medium text-black">{projectTitle}</div>
                            <div className="text-xs text-gray-400 truncate max-w-[200px]">{project.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{getCategoryLabel(project.category)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          project.status === 'published' ? 'bg-green-50 text-green-700' :
                          project.status === 'archived' ? 'bg-gray-100 text-gray-600' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>
                          {project.status === 'published' ? t('cms.published') : project.status === 'archived' ? t('cms.archived') : t('cms.draft')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium' }).format(new Date(project.createdAt))}
                      </td>
                      <td className={`py-4 px-6 ${isRTL ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity`}>
                          <button onClick={() => window.open(`/portfolio/${project.slug}`, '_blank')} className="text-gray-400 hover:text-black p-2 rounded-lg hover:bg-gray-100 transition-colors" title="View">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleEdit(project)} className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(project.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ProjectForm 
          initialData={editingProject}
          defaultCategory={defaultCategory}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
