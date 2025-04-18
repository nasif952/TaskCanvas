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

  // Function to extract title or generate preview
  const getNoteTitleAndPreview = (htmlContent: string): { title: string, preview: string } => {
    if (!htmlContent) return { title: 'Untitled Note', preview: 'Empty note' };
    
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;
    
    // Try to find the first heading as title
    const firstHeading = tempElement.querySelector('h1, h2, h3');
    let title = firstHeading ? firstHeading.textContent?.trim() || 'Untitled Note' : 'Untitled Note';
    
    // Get text content for preview, removing the title if found
    if (firstHeading) {
      firstHeading.remove();
    }
    const textContent = tempElement.textContent || tempElement.innerText || '';
    let preview = textContent.trim().length > 150 
      ? textContent.trim().substring(0, 150) + '...' 
      : textContent.trim();
      
    if (title === 'Untitled Note' && preview.length > 0) {
       // If no heading found, use first line as title
       const firstLine = preview.split('\n')[0];
       title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
       preview = preview.substring(firstLine.length).trim();
    }

    if (!preview && title !== 'Untitled Note') {
      preview = 'Note content is primarily the title.';
    } else if (!preview && title === 'Untitled Note') {
       preview = 'Empty note';
    }

    return { title, preview };
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
            const { title, preview } = getNoteTitleAndPreview(note.content);
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
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
             <DialogTitle>{selectedNote ? getNoteTitleAndPreview(selectedNote.content).title : 'View Note'}</DialogTitle>
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
