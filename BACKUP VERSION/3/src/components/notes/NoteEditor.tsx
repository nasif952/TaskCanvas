import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, Link as LinkIcon, Image, Save } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

interface NoteEditorProps {
  projectId: string;
  initialContent?: any;
  noteId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  projectId, 
  initialContent = '', 
  noteId, 
  onSave, 
  onCancel 
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const { createNote, updateNote } = useProject();
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Set up the editor when component mounts
  useEffect(() => {
    if (editorRef.current) {
      // Ensure the editor has the proper direction attributes
      editorRef.current.setAttribute('dir', 'ltr');
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      
      // If we have initial content, set it
      if (initialContent) {
        editorRef.current.innerHTML = initialContent;
      }
    }
  }, [initialContent]);

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      // After formatting, ensure content state is updated
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Get the current content directly from the DOM
    const newContent = e.currentTarget.innerHTML;
    // Update state with the current content
    setContent(newContent);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (noteId) {
        await updateNote(noteId, content);
      } else {
        await createNote(projectId, content);
      }
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle>{noteId ? 'Edit Note' : 'New Note'}</CardTitle>
        <div className="rich-text-toolbar">
          <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('formatBlock', '<h1>')}>
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('formatBlock', '<h2>')}>
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('formatBlock', '<h3>')}>
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('insertUnorderedList')}>
            <List className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('insertOrderedList')}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleFormat('justifyLeft')}>
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const url = prompt('Enter the URL:');
              if (url) handleFormat('createLink', url);
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled>
            <Image className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div
          ref={editorRef}
          className="rich-text-editor"
          contentEditable
          dir="ltr"
          style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'embed' }}
          onInput={handleInput}
        />
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save Note
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NoteEditor;
