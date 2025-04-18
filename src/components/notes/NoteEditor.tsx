import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, Link as LinkIcon, Image, Save, Undo, Redo } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const selectionRef = useRef<Range | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

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

      // Add event listeners for keyboard state
      document.addEventListener('keydown', handleCtrlKeyDown);
      document.addEventListener('keyup', handleCtrlKeyUp);
      window.addEventListener('blur', handleWindowBlur);
    }
    
    return () => {
      document.removeEventListener('keydown', handleCtrlKeyDown);
      document.removeEventListener('keyup', handleCtrlKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [initialContent]);

  // Track Ctrl key state
  const handleCtrlKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setIsCtrlPressed(true);
      updateLinkAttributes(true);
      
      // Handle keyboard shortcuts for Undo/Redo
      if (editorRef.current && editorRef.current.contains(document.activeElement)) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            // Ctrl+Shift+Z for Redo
            e.preventDefault();
            handleRedo();
          } else {
            // Ctrl+Z for Undo
            e.preventDefault();
            handleUndo();
          }
        } else if (e.key === 'y') {
          // Ctrl+Y also for Redo (alternative)
          e.preventDefault();
          handleRedo();
        }
      }
    }
  };

  const handleCtrlKeyUp = (e: KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) {
      setIsCtrlPressed(false);
      updateLinkAttributes(false);
    }
  };

  const handleWindowBlur = () => {
    setIsCtrlPressed(false);
    updateLinkAttributes(false);
  };

  // Update link data attributes based on Ctrl key state
  const updateLinkAttributes = (ctrlPressed: boolean) => {
    if (editorRef.current) {
      const links = editorRef.current.querySelectorAll('a');
      links.forEach(link => {
        if (ctrlPressed) {
          link.setAttribute('data-ctrl-pressed', 'true');
        } else {
          link.removeAttribute('data-ctrl-pressed');
        }
      });
    }
  };

  // Handle ctrl+click on links in the editor
  const handleEditorMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only process if Ctrl key is pressed (Cmd key on Mac)
    if (e.ctrlKey || e.metaKey) {
      // Find closest anchor element from the target
      const target = e.target as HTMLElement;
      const linkElement = target.closest('a');
      
      if (linkElement && linkElement.href) {
        e.preventDefault(); // Prevent default behavior
        window.open(linkElement.href, '_blank', 'noopener,noreferrer');
      }
    }
  };

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

  // Save selection state before opening dialog
  const handleLinkButtonClick = () => {
    // Store the current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
      
      // If text is selected, use it as link text
      const selectedText = selection.toString().trim();
      setLinkText(selectedText || '');
    } else {
      selectionRef.current = null;
      setLinkText('');
    }
    
    setIsLinkDialogOpen(true);
  };
  
  const insertLink = () => {
    if (!linkUrl || !editorRef.current) {
      setIsLinkDialogOpen(false);
      return;
    }

    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    const textToDisplay = linkText || url;
    
    // Focus the editor
    editorRef.current.focus();
    
    // Restore the selection
    const selection = window.getSelection();
    if (selection && selectionRef.current) {
      // Clear existing selections
      selection.removeAllRanges();
      
      // Restore our saved selection
      selection.addRange(selectionRef.current);
      
      // Check if text is selected
      if (selection.toString().trim()) {
        // Text is selected, wrap it with link
        document.execCommand('createLink', false, url);
      } else {
        // Just cursor position, insert a new link
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.textContent = textToDisplay;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        
        // Insert at the cursor position
        selectionRef.current.insertNode(linkElement);
        
        // Move cursor after the link
        selectionRef.current.setStartAfter(linkElement);
        selectionRef.current.setEndAfter(linkElement);
        selection.removeAllRanges();
        selection.addRange(selectionRef.current);
      }
    } else {
      // Fallback: If selection restoration fails, append to editor
      const linkHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${textToDisplay}</a>`;
      document.execCommand('insertHTML', false, linkHTML);
    }
    
    // Update content state
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    
    // Reset dialog state
    setIsLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Add handleUndo and handleRedo functions
  const handleUndo = () => {
    document.execCommand('undo');
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleRedo = () => {
    document.execCommand('redo');
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
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
            onClick={handleLinkButtonClick}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled>
            <Image className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleRedo}
            title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
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
          onMouseDown={handleEditorMouseDown}
          data-placeholder="Type here..."
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

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-url" className="text-right">URL</Label>
              <Input 
                id="link-url" 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com" 
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-text" className="text-right">Text</Label>
              <Input 
                id="link-text" 
                value={linkText} 
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text" 
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLinkDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={insertLink}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NoteEditor;
