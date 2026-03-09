import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { FileText, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const saved = localStorage.getItem('notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  };

  const saveNotes = (newNotes: Note[]) => {
    localStorage.setItem('notes', JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const handleSaveNote = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (editingId) {
      const updated = notes.map(note =>
        note.id === editingId
          ? { ...note, title, content, updatedAt: new Date().toISOString() }
          : note
      );
      saveNotes(updated);
      toast.success('Note updated successfully');
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveNotes([newNote, ...notes]);
      toast.success('Note created successfully');
    }

    resetForm();
  };

  const handleEdit = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note.id);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    saveNotes(notes.filter(note => note.id !== id));
    toast.success('Note deleted');
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-6" />
                  Personal Notes
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Keep track of important information
                </CardDescription>
              </div>
              <Dialog open={showDialog} onOpenChange={(open) => {
                setShowDialog(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">
                    <Plus className="size-4 mr-2" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Note' : 'Create Note'}</DialogTitle>
                    <DialogDescription>
                      {editingId ? 'Update your note' : 'Write down important information'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title..."
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your note here..."
                        rows={10}
                        className="resize-none"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNote}>
                      {editingId ? 'Update' : 'Create'} Note
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="size-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No notes yet. Create your first note!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {notes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -4 }}
                      className="p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-lg line-clamp-2">{note.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(note.updatedAt), 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                        {note.content && (
                          <p className="text-sm text-muted-foreground line-clamp-4">
                            {note.content}
                          </p>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(note)}
                            className="flex-1"
                          >
                            <Edit className="size-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(note.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
