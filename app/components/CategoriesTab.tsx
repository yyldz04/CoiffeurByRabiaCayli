"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Upload } from "lucide-react";
import { categoryService, Category } from "../utils/supabase/client";
import * as yaml from 'js-yaml';

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories from Supabase
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Fehler beim Laden der Kategorien");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (categoryData: {
    name: string;
    description?: string;
  }) => {
    try {
      // Calculate next order_index automatically
      const nextOrderIndex = categories.length > 0 
        ? Math.max(...categories.map(cat => cat.order_index)) + 1 
        : 1;
      
      await categoryService.createCategory({
        ...categoryData,
        order_index: nextOrderIndex
      });
      await loadCategories();
      setIsAddDialogOpen(false);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Fehler beim Erstellen der Kategorie");
    }
  };

  const handleEditCategory = async (categoryId: string, categoryData: {
    name: string;
    description?: string;
    order_index?: number;
  }) => {
    try {
      await categoryService.updateCategory(categoryId, categoryData);
      await loadCategories();
      setEditingCategory(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Fehler beim Aktualisieren der Kategorie");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      await loadCategories();
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Fehler beim Löschen der Kategorie");
    }
  };

  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError("");

    try {
      const text = await file.text();
      const data = yaml.load(text);
      
      // Validate YAML structure - expect categories array
      if (!data || !Array.isArray(data)) {
        throw new Error("YAML muss ein Array von Kategorien sein");
      }

      // Validate each category has required fields
      for (let i = 0; i < data.length; i++) {
        const category = data[i];
        if (!category.name) {
          throw new Error(`Kategorie ${i + 1} muss einen Namen haben`);
        }
      }

      // Call the API route for import
      const response = await fetch('/api/categories/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-yaml',
        },
        body: yaml.dump(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Importieren der YAML-Datei');
      }

      // Reload categories
      await loadCategories();
      alert(`Import erfolgreich! ${result.importedCount} von ${result.totalCount} Kategorien importiert.`);
      
    } catch (error: unknown) {
      console.error("Import error:", error);
      const errorMessage = error instanceof Error ? error.message : "Fehler beim Importieren der YAML-Datei";
      setError(errorMessage);
      alert(`Import Fehler: ${errorMessage}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="border border-white/20 p-8 text-center">
        <p className="text-white/70 uppercase tracking-[0.05em]">Kategorien werden geladen...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-0 md:px-4 xl:px-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl tracking-[0.2em] mb-2 uppercase">Kategorien</h1>
          <p className="text-white/60 uppercase">Verwalten Sie Ihre Service-Kategorien</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-transparent border border-white/20 px-6 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Neue Kategorie
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="bg-transparent border border-white/20 px-6 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? 'Importiere...' : 'Importieren'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".yaml,.yml"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border border-red-500/50 bg-red-500/10 p-4">
          <p className="text-red-400 uppercase tracking-[0.05em]">{error}</p>
        </div>
      )}

      {/* Categories List */}
      <div className="border border-white/20">
        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/70 uppercase tracking-[0.05em]">
              Keine Kategorien vorhanden
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {categories.map((category) => (
              <div key={category.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg tracking-[0.05em] uppercase">{category.name}</h3>
                      {category.description && (
                        <p className="text-white/60 text-sm">{category.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 uppercase tracking-[0.05em] border border-white/20">
                          Reihenfolge: {category.order_index}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-white/60 hover:text-white transition-colors p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(category)}
                      className="text-white/60 hover:text-red-400 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      {isAddDialogOpen && (
        <AddCategoryDialog
          onSuccess={handleAddCategory}
          onCancel={() => setIsAddDialogOpen(false)}
        />
      )}

      {/* Edit Category Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          onSuccess={(categoryData) => handleEditCategory(editingCategory.id, categoryData)}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && categoryToDelete && (
        <DeleteCategoryDialog
          category={categoryToDelete}
          onConfirm={handleDeleteCategory}
          onCancel={() => {
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
          }}
        />
      )}
    </div>
  );
}

// Add Category Dialog Component
interface AddCategoryDialogProps {
  onSuccess: (categoryData: {
    name: string;
    description?: string;
  }) => void;
  onCancel: () => void;
}

function AddCategoryDialog({ onSuccess, onCancel }: AddCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-white/20 p-8 max-w-md w-full mx-4">
        <h3 className="text-xl tracking-[0.05em] uppercase mb-6">Neue Kategorie</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block tracking-[0.05em] mb-2 uppercase">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
              placeholder="KATEGORIE NAME"
              required
            />
          </div>

          <div>
            <label className="block tracking-[0.05em] mb-2 uppercase">Beschreibung</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
              placeholder="BESCHREIBUNG"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-transparent border border-white/20 px-6 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 bg-transparent border border-white/20 px-6 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase"
            >
              Erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Category Dialog Component
interface EditCategoryDialogProps {
  category: Category;
  onSuccess: (categoryData: {
    name: string;
    description?: string;
    order_index?: number;
  }) => void;
  onCancel: () => void;
}

function EditCategoryDialog({ category, onSuccess, onCancel }: EditCategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || "",
    order_index: category.order_index
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-white/20 p-8 max-w-md w-full mx-4">
        <h3 className="text-xl tracking-[0.05em] uppercase mb-6">Kategorie bearbeiten</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block tracking-[0.05em] mb-2 uppercase">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
              placeholder="KATEGORIE NAME"
              required
            />
          </div>

          <div>
            <label className="block tracking-[0.05em] mb-2 uppercase">Beschreibung</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-transparent border border-white/20 px-4 py-3 focus:border-white focus:outline-none transition-colors"
              placeholder="BESCHREIBUNG"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-transparent border border-white/20 px-6 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 bg-transparent border border-white/20 px-6 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Category Dialog Component
interface DeleteCategoryDialogProps {
  category: Category;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteCategoryDialog({ category, onConfirm, onCancel }: DeleteCategoryDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black border border-white/20 p-8 max-w-md w-full mx-4">
        <h3 className="text-xl tracking-[0.05em] uppercase mb-6">Kategorie löschen</h3>
        
        <div className="mb-6">
          <p className="text-white/70 uppercase tracking-[0.05em] mb-4">
            Sind Sie sicher, dass Sie die Kategorie &quot;{category.name}&quot; löschen möchten?
          </p>
          <p className="text-red-400 text-sm uppercase tracking-[0.05em]">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 border border-red-600 px-6 py-3 tracking-[0.05em] hover:bg-red-700 transition-colors uppercase"
          >
            Löschen
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-transparent border border-white/20 px-6 py-3 tracking-[0.05em] hover:bg-white hover:text-black transition-colors uppercase"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}


