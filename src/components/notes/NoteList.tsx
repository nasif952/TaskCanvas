import React, { useState } from 'react';
import { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import NoteEditor from './NoteEditor';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NoteListProps {
  projectId: string;
  notes: Note[];
  loading: boolean;
}

// Add custom CSS styles for code blocks in the note view
const codeBlockStyles = `
  .note-view-content pre.code-block {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin: 1rem 0;
    font-family: monospace;
  }
  
  .dark .note-view-content pre.code-block {
    background-color: #1e293b;
  }
  
  .note-view-content pre.code-block code {
    font-family: monospace;
    white-space: pre;
    font-size: 0.9em;
  }
  
  .note-view-content .language-javascript,
  .note-view-content .language-js {
    color: #2563eb;
  }
  
  .note-view-content .language-typescript,
  .note-view-content .language-ts {
    color: #0284c7;
  }
  
  .note-view-content .language-python,
  .note-view-content .language-py {
    color: #16a34a;
  }
  
  .note-view-content .language-html {
    color: #ea580c;
  }
  
  .note-view-content .language-css {
    color: #9333ea;
  }
  
  /* Table styles */
  .note-view-content table.note-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    overflow-x: auto;
    display: block;
  }
  
  .note-view-content table.note-table th {
    background-color: #f2f2f2;
    color: #333;
    font-weight: 600;
    text-align: left;
  }
  
  .dark .note-view-content table.note-table th {
    background-color: #334155;
    color: #f8fafc;
  }
  
  .note-view-content table.note-table th,
  .note-view-content table.note-table td {
    border: 1px solid #ccc;
    padding: 8px;
  }
  
  .dark .note-view-content table.note-table th,
  .dark .note-view-content table.note-table td {
    border-color: #475569;
  }
  
  .note-view-content table.note-table tr:nth-child(even) {
    background-color: #f9fafb;
  }
  
  .dark .note-view-content table.note-table tr:nth-child(even) {
    background-color: #1e293b;
  }
  
  /* Checkbox styles */
  .note-view-content .note-checkbox-container {
    margin: 8px 0;
    display: block;
    clear: both;
    position: relative;
  }
  
  .note-view-content .note-checkbox {
    display: flex;
    align-items: flex-start;
    cursor: default;
  }
  
  .note-view-content .checkbox-box {
    position: relative;
    width: 18px;
    height: 18px;
    margin-right: 8px;
    margin-top: 2px;
    cursor: pointer;
    flex-shrink: 0;
  }
  
  .note-view-content .checkbox-box input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
  
  .note-view-content .checkbox-box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 16px;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    background-color: #fff;
  }
  
  .dark .note-view-content .checkbox-box::before {
    border-color: #4b5563;
    background-color: #1f2937;
  }
  
  .note-view-content input[type="checkbox"]:checked + .checkbox-box::before,
  .note-view-content .note-checkbox.checked .checkbox-box::before {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
  
  .note-view-content input[type="checkbox"]:checked + .checkbox-box::after,
  .note-view-content .note-checkbox.checked .checkbox-box::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 2px;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .note-view-content .checkbox-text {
    display: inline-block;
    min-height: 20px;
    padding: 0;
  }
  
  .note-view-content .note-checkbox.checked .checkbox-text {
    text-decoration: line-through;
    color: #6b7280;
  }
  
  .dark .note-view-content .note-checkbox.checked .checkbox-text {
    color: #94a3b8;
  }

  /* Fix for nested lists and indents */
  .note-view-content ul, 
  .note-view-content ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .note-view-content li {
    margin: 0.25rem 0;
  }
`;

const NoteList: React.FC<NoteListProps> = ({ projectId, notes, loading }) => {
  const { deleteNote } = useProject();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleViewClick = (note: Note) => {
    setSelectedNote(note);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (note: Note) => {
    setSelectedNote(note);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (note: Note) => {
    setSelectedNote(note);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteNote = async () => {
    if (selectedNote) {
      await deleteNote(selectedNote.id);
      setIsDeleteDialogOpen(false);
      setSelectedNote(null);
    }
  };

  // Function to extract preview from HTML content
  const getPreview = (htmlContent: string): string => {
    if (!htmlContent) return 'Empty note';
    
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    
    // Get text content for preview
    const textContent = tempElement.textContent || tempElement.innerText || '';
    let preview = textContent.trim().length > 150 
      ? textContent.trim().substring(0, 150) + '...' 
      : textContent.trim();
      
    if (!preview) {
      preview = 'Empty note';
    }

    return preview;
  };

  // Get note title (use the title field if available, otherwise extract from content)
  const getNoteTitle = (note: Note): string => {
    // If we have a title field and it's not empty, use it
    if (note.title) {
      return note.title;
    }
    
    // Otherwise, extract from content using the old method
    if (!note.content) return 'Untitled Note';
    
    const tempElement = document.createElement('div');
    tempElement.innerHTML = note.content;
    
    // Try to find the first heading as title
    const firstHeading = tempElement.querySelector('h1, h2, h3');
    let title = firstHeading ? firstHeading.textContent?.trim() || 'Untitled Note' : 'Untitled Note';
    
    if (title === 'Untitled Note') {
      // If no heading found, use first line as title
      const textContent = tempElement.textContent || tempElement.innerText || '';
      const firstLine = textContent.trim().split('\n')[0];
      title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
      
      if (!title) {
        title = 'Untitled Note';
      }
    }

    return title;
  };

  // Add checkbox interactivity to the view modal
  const handleViewModalOpened = () => {
    setTimeout(() => {
      const viewModal = document.querySelector('.note-view-content');
      if (!viewModal) return;
      
      // Find all checkbox containers
      const containers = viewModal.querySelectorAll('.note-checkbox-container');
      containers.forEach(container => {
        // Get the checkbox box and text elements
        const checkbox = container.querySelector('input[type="checkbox"]');
        const checkboxBox = container.querySelector('.checkbox-box');
        const checkboxText = container.querySelector('.checkbox-text');
        
        // Prevent text clicks from toggling checkbox
        if (checkboxText) {
          checkboxText.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        }
        
        // Allow clicking only on the checkbox box area
        if (checkboxBox) {
          checkboxBox.addEventListener('click', (e) => {
            e.stopPropagation();
            if (checkbox) {
              (checkbox as HTMLInputElement).checked = !(checkbox as HTMLInputElement).checked;
              
              // Update checkbox state classes
              const checkboxDiv = checkbox.closest('.note-checkbox');
              if (checkboxDiv) {
                if ((checkbox as HTMLInputElement).checked) {
                  checkboxDiv.classList.add('checked');
                } else {
                  checkboxDiv.classList.remove('checked');
                }
              }
            }
          });
        }
      });
    }, 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-10 bg-muted rounded-t-md"></CardHeader>
            <CardContent className="h-20 bg-muted"></CardContent>
            <CardFooter className="h-10 bg-muted rounded-b-md"></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add the style element for code block styles */}
      <style dangerouslySetInnerHTML={{ __html: codeBlockStyles }} />
      
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold">Notes</h3>
        <Button onClick={handleAddClick} variant="default" size="sm">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/40">
          <FileText className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-lg font-medium">No notes yet.</p>
          <p className="text-muted-foreground">Click "Add Note" to create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const title = getNoteTitle(note);
            const preview = getPreview(note.content);
            return (
              <Card key={note.id} className="flex flex-col h-full group hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2" title={title}>{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow text-sm text-muted-foreground line-clamp-3 mb-2">
                  {preview}
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                  <span>
                    Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                  </span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      onClick={() => handleViewClick(note)}
                      title="View Note"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => handleEditClick(note)}
                      title="Edit Note"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(note)}
                      title="Delete Note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Note Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0">
          <NoteEditor 
            projectId={projectId} 
            onSave={() => setIsAddModalOpen(false)}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      <Dialog 
        open={isViewModalOpen} 
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (open) handleViewModalOpened();
        }}
      >
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
             <DialogTitle>{selectedNote ? (selectedNote.title || getNoteTitle(selectedNote)) : 'View Note'}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto p-4 -mx-4">
            <div 
              className="prose dark:prose-invert max-w-none note-view-content" 
              dangerouslySetInnerHTML={{ __html: selectedNote?.content || '' }}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0">
          {selectedNote && (
            <NoteEditor 
              projectId={projectId}
              noteId={selectedNote.id}
              initialContent={selectedNote.content}
              initialTitle={selectedNote.title}
              onSave={() => setIsEditModalOpen(false)}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NoteList;
