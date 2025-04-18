
import React, { useState } from 'react';
import { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import NoteEditor from './NoteEditor';

interface NoteListProps {
  projectId: string;
  notes: Note[];
  loading: boolean;
}

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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse flex flex-col space-y-4 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  // Function to extract a preview from HTML content
  const getContentPreview = (htmlContent: any) => {
    if (!htmlContent) return 'Empty note';
    
    // Create a temporary element to parse the HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    
    // Get the text content without HTML tags
    const textContent = tempElement.textContent || tempElement.innerText || '';
    
    // Return a truncated preview
    return textContent.length > 100 
      ? textContent.substring(0, 100) + '...' 
      : textContent;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Notes</h3>
        <Button onClick={handleAddClick} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No notes yet. Click "Add Note" to create one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="p-4 border rounded-md hover:shadow-sm transition-shadow">
              <div className="flex flex-col gap-2">
                <div className="text-sm">
                  <p className="text-muted-foreground line-clamp-2">
                    {getContentPreview(note.content)}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewClick(note)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditClick(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(note)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <NoteEditor 
            projectId={projectId} 
            onSave={() => setIsAddModalOpen(false)}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="p-4">
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: selectedNote?.content || '' }}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedNote && (
            <NoteEditor 
              projectId={projectId}
              noteId={selectedNote.id}
              initialContent={selectedNote.content}
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
