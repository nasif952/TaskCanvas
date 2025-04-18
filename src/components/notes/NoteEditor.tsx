import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, Link as LinkIcon, Image, Save, Undo, Redo, Code, Table, CheckSquare } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

interface NoteEditorProps {
  projectId: string;
  initialContent?: any;
  initialTitle?: string | null;
  noteId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  projectId, 
  initialContent = '', 
  initialTitle = '',
  noteId, 
  onSave, 
  onCancel 
}) => {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle || '');
  const [isSaving, setIsSaving] = useState(false);
  const { createNote, updateNote } = useProject();
  const editorRef = React.useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableColumns, setTableColumns] = useState(3);
  const [tableHeader, setTableHeader] = useState(true);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  // Set up the editor when component mounts
  useEffect(() => {
    if (editorRef.current) {
      // Ensure the editor has the proper direction attributes
      editorRef.current.setAttribute('dir', 'ltr');
      editorRef.current.style.direction = 'ltr';
      editorRef.current.style.textAlign = 'left';
      
      // Add checkbox styles to the editor
      const style = document.createElement('style');
      style.textContent = `
        .rich-text-editor .note-checkbox-container {
          margin: 8px 0;
          display: block;
          clear: both;
          position: relative;
        }
        
        .rich-text-editor .note-checkbox {
          display: flex;
          align-items: flex-start;
          cursor: default;
        }
        
        .rich-text-editor .checkbox-box {
          position: relative;
          width: 18px;
          height: 18px;
          margin-right: 8px;
          margin-top: 2px;
          cursor: pointer;
          flex-shrink: 0;
        }
        
        .rich-text-editor .checkbox-box input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }
        
        .rich-text-editor .checkbox-box::before {
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
        
        .dark .rich-text-editor .checkbox-box::before {
          border-color: #4b5563;
          background-color: #1f2937;
        }
        
        .rich-text-editor input[type="checkbox"]:checked + .checkbox-box::before,
        .rich-text-editor .note-checkbox.checked .checkbox-box::before {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .rich-text-editor input[type="checkbox"]:checked + .checkbox-box::after,
        .rich-text-editor .note-checkbox.checked .checkbox-box::after {
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
        
        .rich-text-editor .checkbox-text {
          display: inline-block;
          min-height: 20px;
          padding: 0;
          cursor: text;
        }
        
        .rich-text-editor .note-checkbox.checked .checkbox-text {
          text-decoration: line-through;
          color: #6b7280;
        }
        
        .dark .rich-text-editor .note-checkbox.checked .checkbox-text {
          color: #94a3b8;
        }
      `;
      document.head.appendChild(style);
      
      // If we have initial content, set it
      if (initialContent) {
        editorRef.current.innerHTML = initialContent;
      }

      // Add event listeners for keyboard state
      document.addEventListener('keydown', handleCtrlKeyDown);
      document.addEventListener('keyup', handleCtrlKeyUp);
      window.addEventListener('blur', handleWindowBlur);
      
      // Add event listener for table navigation
      editorRef.current.addEventListener('keydown', handleTableNavigation);
      
      // Initialize checkboxes
      attachCheckboxListeners();
    }
    
    return () => {
      document.removeEventListener('keydown', handleCtrlKeyDown);
      document.removeEventListener('keyup', handleCtrlKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      if (editorRef.current) {
        editorRef.current.removeEventListener('keydown', handleTableNavigation);
      }
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
        await updateNote(noteId, content, title || null);
      } else {
        await createNote(projectId, content, title || null);
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

  // Handle table insertion
  const handleTableButtonClick = () => {
    // Store the current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
    } else {
      selectionRef.current = null;
    }
    
    // Reset table dialog state
    setTableRows(3);
    setTableColumns(3);
    setTableHeader(true);
    setIsTableDialogOpen(true);
  };

  const insertTable = () => {
    if (!editorRef.current) {
      setIsTableDialogOpen(false);
      return;
    }

    // Focus the editor
    editorRef.current.focus();

    // Generate table HTML with paragraphs before and after for easier cursor positioning
    let tableHTML = '<p data-position="before-table"><br></p><table class="note-table" style="width: 100%; border-collapse: collapse; margin: 1rem 0;">';
    
    // Add header row if needed
    if (tableHeader) {
      tableHTML += '<thead><tr>';
      for (let col = 0; col < tableColumns; col++) {
        tableHTML += `<th style="border: 1px solid #ccc; padding: 8px; text-align: left; background-color: #f2f2f2;">Header ${col + 1}</th>`;
      }
      tableHTML += '</tr></thead>';
    }
    
    // Add table body with cells
    tableHTML += '<tbody>';
    const rowsToCreate = tableHeader ? tableRows - 1 : tableRows;
    for (let row = 0; row < rowsToCreate; row++) {
      tableHTML += '<tr>';
      for (let col = 0; col < tableColumns; col++) {
        tableHTML += `<td style="border: 1px solid #ccc; padding: 8px;">Cell ${row + 1}-${col + 1}</td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</tbody></table><p data-position="after-table"><br></p>';
    
    // Restore the selection
    const selection = window.getSelection();
    if (selection && selectionRef.current) {
      // Clear existing selections
      selection.removeAllRanges();
      
      // Restore our saved selection
      selection.addRange(selectionRef.current);
      
      // Delete selected content if there is any
      if (selection.toString().trim()) {
        document.execCommand('delete');
      }
      
      // Insert the table
      document.execCommand('insertHTML', false, tableHTML);
      
      // Position cursor after the table by default
      setTimeout(() => {
        if (editorRef.current) {
          const afterParagraph = editorRef.current.querySelector('p[data-position="after-table"]');
          if (afterParagraph) {
            const range = document.createRange();
            range.setStart(afterParagraph, 0);
            range.collapse(true);
            
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
              
              // Scroll cursor into view
              afterParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      }, 50);
    } else {
      // Fallback: If selection restoration fails, append to editor
      document.execCommand('insertHTML', false, tableHTML);
    }
    
    // Update content state
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    
    // Close dialog
    setIsTableDialogOpen(false);
  };

  // Add a helper function to position cursor before a table
  const positionCursorBeforeTable = (tableElement: HTMLElement) => {
    if (!tableElement || !editorRef.current) return;
    
    const beforeParagraph = tableElement.previousElementSibling;
    if (beforeParagraph && beforeParagraph.hasAttribute('data-position')) {
      const range = document.createRange();
      range.setStart(beforeParagraph, 0);
      range.collapse(true);
      
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
        beforeParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
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

  // Handle keyboard navigation around tables
  const handleTableNavigation = (e: KeyboardEvent) => {
    // Only handle Arrow Up and Arrow Down
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    let currentNode = range.startContainer;
    
    // Find if we're at the top or bottom of a table
    let isTopOfTable = false;
    let isBottomOfTable = false;
    let tableElement: HTMLElement | null = null;
    
    // Walk up the DOM tree to find if we're inside a table
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeName === 'TABLE') {
        tableElement = currentNode as HTMLElement;
        
        // If we're in the first row and pressing up
        if (e.key === 'ArrowUp') {
          const firstRow = tableElement.querySelector('tr');
          if (firstRow) {
            const cells = firstRow.querySelectorAll('th, td');
            for (let i = 0; i < cells.length; i++) {
              if (cells[i].contains(range.startContainer)) {
                isTopOfTable = true;
                break;
              }
            }
          }
        }
        
        // If we're in the last row and pressing down
        if (e.key === 'ArrowDown') {
          const allRows = tableElement.querySelectorAll('tr');
          const lastRow = allRows[allRows.length - 1];
          if (lastRow) {
            const cells = lastRow.querySelectorAll('th, td');
            for (let i = 0; i < cells.length; i++) {
              if (cells[i].contains(range.startContainer)) {
                isBottomOfTable = true;
                break;
              }
            }
          }
        }
        
        break;
      }
      currentNode = currentNode.parentNode;
    }
    
    // If we're at the top of a table and pressing up, move to the paragraph before
    if (isTopOfTable && e.key === 'ArrowUp' && tableElement) {
      e.preventDefault();
      positionCursorBeforeTable(tableElement);
    }
    
    // If we're at the bottom of a table and pressing down, move to the paragraph after
    if (isBottomOfTable && e.key === 'ArrowDown' && tableElement) {
      e.preventDefault();
      positionCursorAfterTable(tableElement);
    }
  };
  
  // Position cursor after a table
  const positionCursorAfterTable = (tableElement: HTMLElement) => {
    if (!tableElement || !editorRef.current) return;
    
    const afterParagraph = tableElement.nextElementSibling;
    if (afterParagraph && afterParagraph.hasAttribute('data-position')) {
      const range = document.createRange();
      range.setStart(afterParagraph, 0);
      range.collapse(true);
      
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
        afterParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Handle editor content clicks
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Find if user clicked on a table
    const target = e.target as HTMLElement;
    const tableElement = target.closest('table');
    
    if (tableElement) {
      // Determine if click is at the top or bottom edge of the table
      const rect = tableElement.getBoundingClientRect();
      const mouseY = e.clientY;
      
      const topEdge = rect.top;
      const bottomEdge = rect.bottom;
      
      // Edge detection zone - 10px from edge
      const edgeThreshold = 10;
      
      if (mouseY - topEdge <= edgeThreshold) {
        // Clicked near top edge
        positionCursorBeforeTable(tableElement);
      } else if (bottomEdge - mouseY <= edgeThreshold) {
        // Clicked near bottom edge
        positionCursorAfterTable(tableElement);
      }
    }
  };

  // Insert a checkbox
  const handleCheckboxInsert = () => {
    if (!editorRef.current) return;
    
    // Store the current selection
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selectionRef.current = selection.getRangeAt(0).cloneRange();
    } else {
      selectionRef.current = null;
    }
    
    // Focus the editor
    editorRef.current.focus();
    
    // Generate checkbox HTML - improved structure with better separation of clickable areas
    const checkboxHtml = '<div class="note-checkbox-container"><div class="note-checkbox"><span class="checkbox-box"><input type="checkbox"></span><span class="checkbox-text" contenteditable="true">Tickable item</span></div></div><p><br></p>';
    
    // Insert the checkbox
    if (selection && selectionRef.current) {
      // Clear existing selections
      selection.removeAllRanges();
      
      // Restore our saved selection
      selection.addRange(selectionRef.current);
      
      // Delete selected content if there is any
      if (selection.toString().trim()) {
        document.execCommand('delete');
      }
      
      // Insert the checkbox
      document.execCommand('insertHTML', false, checkboxHtml);
      
      // Position cursor after the checkbox at the new paragraph
      setTimeout(() => {
        if (editorRef.current) {
          const containers = editorRef.current.querySelectorAll('.note-checkbox-container');
          if (containers.length > 0) {
            const lastContainer = containers[containers.length - 1];
            const paragraphAfter = lastContainer.nextElementSibling as HTMLElement;
            
            if (paragraphAfter) {
              const range = document.createRange();
              range.setStart(paragraphAfter, 0);
              range.collapse(true);
              
              const sel = window.getSelection();
              if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
                
                // Ensure cursor is visible
                paragraphAfter.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        }
      }, 10);
    } else {
      // Fallback: If selection restoration fails, append to editor
      document.execCommand('insertHTML', false, checkboxHtml);
    }
    
    // Update content state
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      
      // Add event listeners to the newly created checkbox
      setTimeout(() => {
        attachCheckboxListeners();
      }, 50);
    }
  };
  
  // Add event listeners to checkboxes
  const attachCheckboxListeners = () => {
    if (!editorRef.current) return;
    
    // Find all checkbox containers
    const containers = editorRef.current.querySelectorAll('.note-checkbox-container');
    containers.forEach(container => {
      // Get the checkbox input and text elements
      const checkbox = container.querySelector('input[type="checkbox"]');
      const checkboxBox = container.querySelector('.checkbox-box');
      const checkboxText = container.querySelector('.checkbox-text');
      
      if (checkbox && !checkbox.hasAttribute('data-listener-attached')) {
        // Prevent default click behavior on the text
        if (checkboxText) {
          checkboxText.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop click from reaching the container
          });
          
          // Handle Enter key on checkbox text
          checkboxText.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // Prevent default Enter behavior
              
              // Create a new paragraph after the checkbox container
              const paragraph = document.createElement('p');
              paragraph.innerHTML = '<br>';
              
              // Insert after the checkbox container
              const containerParent = container.parentNode;
              if (containerParent) {
                const nextSibling = container.nextElementSibling;
                if (nextSibling) {
                  containerParent.insertBefore(paragraph, nextSibling);
                } else {
                  containerParent.appendChild(paragraph);
                }
                
                // Move cursor to the new paragraph
                const range = document.createRange();
                range.setStart(paragraph, 0);
                range.collapse(true);
                
                const sel = window.getSelection();
                if (sel) {
                  sel.removeAllRanges();
                  sel.addRange(range);
                  
                  // Make sure cursor is visible
                  paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                // Update editor content state
                setContent(editorRef.current.innerHTML);
              }
            }
          });
        }
        
        // Add hover-only behavior to the checkbox
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
              
              // Create a new paragraph after checkbox when clicked
              let needNewParagraph = true;
              const containerParent = container.parentNode;
              const nextElement = container.nextElementSibling;
              
              // Only add a new paragraph if one doesn't exist or is not empty
              if (nextElement && nextElement.tagName === 'P') {
                const nextContent = nextElement.textContent || nextElement.innerHTML;
                if (nextContent.trim() === '' || nextContent === '<br>') {
                  needNewParagraph = false;
                  
                  // Set cursor in existing empty paragraph
                  const range = document.createRange();
                  range.setStart(nextElement, 0);
                  range.collapse(true);
                  
                  const sel = window.getSelection();
                  if (sel) {
                    sel.removeAllRanges();
                    sel.addRange(range);
                    nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              }
              
              // Create new paragraph if needed
              if (needNewParagraph && containerParent) {
                const paragraph = document.createElement('p');
                paragraph.innerHTML = '<br>';
                
                if (nextElement) {
                  containerParent.insertBefore(paragraph, nextElement);
                } else {
                  containerParent.appendChild(paragraph);
                }
                
                // Set cursor in new paragraph
                const range = document.createRange();
                range.setStart(paragraph, 0);
                range.collapse(true);
                
                const sel = window.getSelection();
                if (sel) {
                  sel.removeAllRanges();
                  sel.addRange(range);
                  paragraph.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
              
              // Update content state
              if (editorRef.current) {
                setContent(editorRef.current.innerHTML);
              }
            }
          });
        }
        
        // Mark as processed
        checkbox.setAttribute('data-listener-attached', 'true');
      }
    });
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (e: Event) => {
    const checkbox = e.target as HTMLInputElement;
    const checkboxDiv = checkbox.closest('.note-checkbox');
    
    if (checkboxDiv) {
      if (checkbox.checked) {
        checkboxDiv.classList.add('checked');
      } else {
        checkboxDiv.classList.remove('checked');
      }
      
      // Update content state
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm min-h-[450px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="mb-2">
          <Label htmlFor="note-title" className="text-xs text-muted-foreground mb-1">Note Title</Label>
          <Input
            id="note-title"
            placeholder="Enter a title for your note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background focus-visible:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-2">
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
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleTableButtonClick}
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleCheckboxInsert}
            title="Insert Checkbox"
          >
            <CheckSquare className="h-4 w-4" />
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
          onClick={handleEditorClick}
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

      {/* Table Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-rows" className="text-right">Rows</Label>
              <Input 
                id="table-rows" 
                type="number"
                min="1"
                max="20"
                value={tableRows} 
                onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-columns" className="text-right">Columns</Label>
              <Input 
                id="table-columns" 
                type="number"
                min="1"
                max="10"
                value={tableColumns} 
                onChange={(e) => setTableColumns(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-header" className="text-right">Include Header</Label>
              <div className="col-span-3 flex items-center">
                <input 
                  id="table-header" 
                  type="checkbox"
                  checked={tableHeader}
                  onChange={(e) => setTableHeader(e.target.checked)}
                  className="mr-2"
                />
                <Label htmlFor="table-header" className="cursor-pointer">Add header row</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTableDialogOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={insertTable}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default NoteEditor;
