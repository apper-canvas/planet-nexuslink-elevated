import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MentionsInput, Mention } from 'react-mentions';
import { getIcon } from '../../utils/iconUtils';
import { createNotification } from '../../utils/notificationUtils';
import NoteItem from './NoteItem';

const NotesSection = ({ contact, onAddNote, onUpdateContact, currentUser }) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [mentions, setMentions] = useState([]);

  useEffect(() => {
    if (contact && contact.teamMembers) {
      setTeamMembers(contact.teamMembers);
    }
  }, [contact]);

  const PaperclipIcon = getIcon('paperclip');
  const SendIcon = getIcon('send');
  const UserPlusIcon = getIcon('user-plus');
  const UserIcon = getIcon('user');
  
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    // Process mentions
    const detectedMentions = mentions.filter(mention => 
      newNoteText.includes(`@[${mention.display}](${mention.id})`)
    );
    
    // Call the parent handler to add the note
    onAddNote(contact.id, newNoteText, detectedMentions);
    
    // Create notifications for mentioned users
    detectedMentions.forEach(mention => {
      // Don't notify yourself
      if (mention.id !== currentUser) {
        createNotification({
          to: mention.id,
          from: currentUser,
          contactId: contact.id,
          contactName: contact.name,
          noteText: newNoteText
        });
      }
    });
    
    setNewNoteText('');
    setMentions([]);
    toast.success('Note added successfully');
  };

  const handleEditNote = (note) => {
    setNoteToEdit(note);
    setEditedText(note.text);
  };

  const handleUpdateNote = () => {
    if (!editedText.trim()) return;
    
    // Process mentions in edited text
    const detectedMentions = mentions.filter(mention => 
      editedText.includes(`@[${mention.display}](${mention.id})`)
    );
    
    // Update the note
    const updatedNotes = contact.notes.map(note => 
      note.id === noteToEdit.id 
        ? { 
            ...note, 
            text: editedText, 
            editedAt: new Date().toISOString(),
            mentions: [...(noteToEdit.mentions || []), ...detectedMentions.filter(m => 
              !noteToEdit.mentions?.some(existingMention => existingMention.id === m.id)
            )]
          } 
        : note
    );
    
    const updatedContact = { ...contact, notes: updatedNotes };
    onUpdateContact(updatedContact);
    
    // Create notifications for new mentions
    detectedMentions
      .filter(mention => !noteToEdit.mentions?.some(m => m.id === mention.id))
      .forEach(mention => {
        // Don't notify yourself
        if (mention.id !== currentUser) {
          createNotification({
            to: mention.id,
            from: currentUser,
            contactId: contact.id,
            contactName: contact.name,
            noteText: editedText
          });
        }
      });
    
    setNoteToEdit(null);
    setEditedText('');
    setMentions([]);
    toast.success('Note updated successfully');
  };

  const handleDeleteNote = (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const updatedNotes = contact.notes.filter(note => note.id !== noteId);
    const updatedContact = { ...contact, notes: updatedNotes };
    onUpdateContact(updatedContact);
    toast.success('Note deleted successfully');
  };

  const handleMentionAdd = (id, display) => {
    setMentions(prev => [...prev, { id, display }]);
  };

  if (!contact) return null;

  // CSS for mentions input
  const mentionsInputStyle = {
    control: {
      backgroundColor: 'transparent',
      fontSize: 14,
      fontWeight: 'normal',
    },
    input: {
      margin: 0,
      padding: '8px 10px',
      overflow: 'auto',
      height: '80px',
    },
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.15)',
        fontSize: 14,
      },
      item: {
        padding: '5px 15px',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        '&focused': {
          backgroundColor: '#3b82f6',
          color: 'white',
        },
      },
    },
  };

  return (
    <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
      <h4 className="text-sm font-medium text-surface-500 mb-4">Notes & Collaboration</h4>
      
      {/* Note Input */}
      <div className="border border-surface-200 dark:border-surface-700 rounded-lg mb-4">
        <MentionsInput
          value={noteToEdit ? editedText : newNoteText}
          onChange={(e) => noteToEdit ? setEditedText(e.target.value) : setNewNoteText(e.target.value)}
          placeholder="Add a note... Use @ to mention team members"
          className="input-field !p-0 min-h-[100px]"
          style={mentionsInputStyle}
        >
          <Mention
            trigger="@"
            data={teamMembers.map(member => ({ id: member, display: member }))}
            renderSuggestion={({ display }) => (
              <div className="flex items-center gap-2 py-1">
                <UserIcon className="w-4 h-4" />
                <span>{display}</span>
              </div>
            )}
            onAdd={handleMentionAdd}
            style={{ backgroundColor: '#e2e8f0', padding: '0 4px', borderRadius: '4px' }}
          />
        </MentionsInput>
        
        <div className="flex justify-between items-center p-2 border-t border-surface-200 dark:border-surface-700">
          <div className="flex items-center text-surface-500 gap-2">
            <button className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700">
              <PaperclipIcon className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-700">
              <UserPlusIcon className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={noteToEdit ? handleUpdateNote : handleAddNote}
            disabled={noteToEdit ? !editedText.trim() : !newNoteText.trim()}
            className="btn-primary !py-1 flex items-center gap-1 text-sm"
          >
            <SendIcon className="w-3.5 h-3.5" />
            <span>{noteToEdit ? 'Update' : 'Post'}</span>
          </button>
        </div>
      </div>
      
      {/* Notes List */}
      <div className="space-y-4">
        {!contact.notes || contact.notes.length === 0 ? (
          <div className="text-center text-surface-500 dark:text-surface-400 py-4">
            No notes yet. Add the first note above.
          </div>
        ) : (
          contact.notes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              onEdit={() => handleEditNote(note)}
              onDelete={() => handleDeleteNote(note.id)}
              isEditing={noteToEdit?.id === note.id}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotesSection;