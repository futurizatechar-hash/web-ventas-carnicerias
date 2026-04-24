"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, FolderTree, CornerDownRight } from "lucide-react";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

const CategoryNode = ({ category, allCategories, onEdit, onDelete, depth = 0 }: { category: Category, allCategories: Category[], onEdit: (cat: Category) => void, onDelete: (id: number) => void, depth?: number }) => {
  const children = allCategories.filter(c => c.parentId === category.id);
  
  return (
    <div className={`group ${depth > 0 ? '' : ''}`}>
      <div className={`flex items-center justify-between border transition ${depth === 0 ? 'border-zinc-200 bg-zinc-50 rounded-2xl p-4 hover:border-black/20' : 'bg-white border-zinc-100 rounded-xl p-3 hover:border-zinc-300'}`}>
        <div className={`flex items-center gap-3 ${depth > 0 ? 'text-zinc-600' : ''}`}>
          {depth > 0 && <CornerDownRight size={16} className="text-zinc-300" />}
          <span className={`font-black ${depth > 0 ? 'text-sm text-zinc-800' : 'text-[17px]'}`}>{category.name}</span>
          {children.length > 0 && depth === 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded-full">
              {children.length} subniveles
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(category)} className={`rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-200 transition ${depth === 0 ? 'p-2' : 'p-1.5 hover:bg-zinc-100'}`}>
            <Edit2 size={depth === 0 ? 16 : 14} />
          </button>
          <button onClick={() => onDelete(category.id)} className={`rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition ${depth === 0 ? 'p-2' : 'p-1.5'}`}>
            <Trash2 size={depth === 0 ? 16 : 14} />
          </button>
        </div>
      </div>
      
      {children.length > 0 && (
        <div className="pl-6 ml-4 border-l-2 border-zinc-100 mt-2 space-y-2 py-2">
          {children.map((child) => (
            <CategoryNode 
              key={child.id} 
              category={child} 
              allCategories={allCategories} 
              onEdit={onEdit} 
              onDelete={onDelete}
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Vacuno", parentId: null },
    { id: 101, name: "Asado", parentId: 1 },
    { id: 102, name: "Especiales", parentId: 1 },
    { id: 2, name: "Cerdo", parentId: null },
    { id: 3, name: "Aves", parentId: null },
    { id: 4, name: "Embutidos", parentId: null },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // States del Formulario
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  const mainCategories = categories.filter(c => c.parentId === null);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentId(null);
    setName('');
    setParentId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setModalMode('edit');
    setCurrentId(cat.id);
    setName(cat.name);
    setParentId(cat.parentId);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    // Borrado recursivo
    const getDescendants = (catId: number): number[] => {
      const children = categories.filter(c => c.parentId === catId).map(c => c.id);
      return children.reduce((acc, childId) => [...acc, ...getDescendants(childId)], children);
    };
    const idsToDelete = [id, ...getDescendants(id)];
    setCategories(categories.filter(c => !idsToDelete.includes(c.id)));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (modalMode === 'create') {
      const newId = Math.max(...categories.map(c => c.id), 0) + 1;
      setCategories([...categories, { id: newId, name, parentId }]);
    } else {
      setCategories(categories.map(c => c.id === currentId ? { ...c, name, parentId } : c));
    }
    setIsModalOpen(false);
  };

  // Logica para obtener padres seleccionables en el select
  const getDescendants = (id: number): number[] => {
    const children = categories.filter(c => c.parentId === id).map(c => c.id);
    return children.reduce((acc, childId) => [...acc, ...getDescendants(childId)], children);
  };
  
  const invalidParentIds = currentId ? [currentId, ...getDescendants(currentId)] : [];
  
  const getFlattenedCategories = (parentIdFilter: number | null, depth = 0): { cat: Category, depth: number }[] => {
    const children = categories.filter(c => c.parentId === parentIdFilter);
    let result: { cat: Category, depth: number }[] = [];
    for (const child of children) {
      if (!invalidParentIds.includes(child.id)) {
        result.push({ cat: child, depth });
        result = [...result, ...getFlattenedCategories(child.id, depth + 1)];
      }
    }
    return result;
  };

  const selectableParents = getFlattenedCategories(null);

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
               <FolderTree size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight">Clasificación de Catálogo</h2>
              <p className="text-xs text-zinc-500 font-semibold mt-0.5">Organiza tus productos en infinitas subcategorías</p>
            </div>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition active:scale-95 whitespace-nowrap shadow-md"
          >
            <Plus size={18} />
            Nueva Categoría
          </button>
        </div>

        {/* Tree View */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
           <div className="space-y-6">
             {mainCategories.map((mainCat) => (
               <CategoryNode 
                 key={mainCat.id} 
                 category={mainCat} 
                 allCategories={categories} 
                 onEdit={openEditModal} 
                 onDelete={handleDelete} 
               />
             ))}

             {mainCategories.length === 0 && (
               <div className="text-center py-12 text-zinc-500 font-medium">
                 No hay categorías creadas aún.
               </div>
             )}
           </div>
        </div>

      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition text-zinc-600"
            >
              <X size={18} />
            </button>
            
            <h2 className="text-2xl font-black mb-6 tracking-tight">
              {modalMode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
            </h2>
            
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold mb-1.5 text-zinc-700">Nombre</label>
                 <input 
                   type="text" 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium" 
                   placeholder="Ej. Hamburguesas" 
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-bold mb-1.5 text-zinc-700">Categoría Padre</label>
                 <select 
                   value={parentId === null ? "" : parentId}
                   onChange={(e) => setParentId(e.target.value === "" ? null : Number(e.target.value))}
                   className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium appearance-none"
                 >
                   <option value="">Ninguna (Es categoría principal)</option>
                   {selectableParents.map(({ cat, depth }) => (
                     <option key={cat.id} value={cat.id}>
                       {/* Añadir prefijo para simular indentación visual */}
                       {"—".repeat(depth)} {cat.name}
                     </option>
                   ))}
                 </select>
               </div>

               <div className="pt-4">
                 <button 
                   onClick={handleSave}
                   disabled={!name.trim()}
                   className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition active:scale-95 shadow-lg disabled:opacity-50 disabled:active:scale-100"
                 >
                   {modalMode === 'create' ? 'Crear' : 'Guardar Cambios'}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
