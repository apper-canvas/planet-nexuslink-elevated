import { useState } from 'react';
import { format } from 'date-fns';
import { getIcon } from '../../utils/iconUtils';

const NoteItem = ({ note, onEdit, onDelete, isEditing, currentUser }) => {
  const [showOptions, setShowOptions] = useState(false);
  
  const MoreVerticalIcon = getIcon('more-vertical');
  const EditIcon = getIcon('edit');
  const TrashIcon = getIcon('trash');
  
  // Format timestamp
  const formattedDate = format(new Date(note.timestamp), 'MMM d, yyyy h:mm a');
  
  // Check if the current user is the author
  const isAuthor = note.author === currentUser;
  
  // Process the note text to highlight mentions
  const renderNoteText = () => {
    // First, handle the mentions format from react-mentions: @[User Name](userId)
    let processedText = note.text;
    
    // Convert mentions format to HTML
    const mentionRegex = /@\[(.*?)\]\((.*?)\)/g;
    const segments = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(processedText)) !== null) {
      const [fullMatch, display, id] = match;
      
      // Add text before the mention
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: processedText.substring(lastIndex, match.index)
        });
      }
      
      // Add the mention
      segments.push({
        type: 'mention',
        content: display,
        id
      });
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add any remaining text
    if (lastIndex < processedText.length) {
      segments.push({
        type: 'text',
        content: processedText.substring(lastIndex)
      });
    }
    
    return segments.map((segment, index) => {
      if (segment.type === 'mention') {
        return <span key={index} className="bg-primary/10 text-primary px-1 rounded">@{segment.content}</span>;
      }
      return <span key={index}>{segment.content}</span>;
    });
  };

  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
            {note.author.split(' ').map(name => name[0]).join('')}
          </div>
          <div>
            <div className="font-medium">{note.author}</div>
            <div className="text-xs text-surface-500">{formattedDate}</div>
          </div>
        </div>
        
        {isAuthor && (
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              <MoreVerticalIcon className="w-4 h-4" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-10">
                <button 
                  onClick={() => {
                    onEdit();
                    setShowOptions(false);
                  }} 
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 flex items-center gap-2"
                >
                  <EditIcon className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => {
                    onDelete();
                    setShowOptions(false);
                  }} 
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 text-red-500 flex items-center gap-2"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="text-sm whitespace-pre-line">
        {renderNoteText()}
      </div>
      
      {note.editedAt && (
        <div className="text-xs text-surface-500 mt-2 italic">
          Edited {format(new Date(note.editedAt), 'MMM d, yyyy h:mm a')}
        </div>
      )}
    </div>
  );
};

export default NoteItem;