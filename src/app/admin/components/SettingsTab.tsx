'use client';

import { useState, useEffect } from 'react';

interface TagWithCount {
  id: string;
  name: string;
  projectCount: number;
}

export default function SettingsTab() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tags', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch tags');
      const data = await res.json();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const startEdit = (tag: TagWithCount) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tags/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update tag');
      }
      await fetchTags();
      cancelEdit();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update tag');
    } finally {
      setSaving(false);
    }
  };

  const deleteTag = async (tag: TagWithCount) => {
    if (tag.projectCount > 0) {
      const ok = window.confirm(
        `"${tag.name}" is used by ${tag.projectCount} project(s). Remove it from all projects?`
      );
      if (!ok) return;
    } else {
      const ok = window.confirm(`Delete tag "${tag.name}"?`);
      if (!ok) return;
    }
    setDeletingId(tag.id);
    try {
      const res = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete tag');
      await fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete tag');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-xl shadow-md p-6 sm:p-8 border border-border">
        <div className="text-5xl sm:text-6xl mb-4">⚙️</div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          General Settings
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Configure site settings and preferences
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground italic">
          More settings coming soon...
        </p>
      </div>

      <div className="bg-card rounded-xl shadow-md p-6 sm:p-8 border border-border">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          Category / Tag Editor
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Edit or delete tags used to categorize projects. Changes apply to all projects using that tag.
        </p>

        {loading ? (
          <p className="text-muted-foreground">Loading tags...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : tags.length === 0 ? (
          <p className="text-muted-foreground">No tags yet. Add tags when creating or editing projects.</p>
        ) : (
          <ul className="space-y-3">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg border border-border bg-background"
              >
                {editingId === tag.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground"
                      placeholder="Tag name"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={saving || !editName.trim()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-accent disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={saving}
                        className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{tag.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({tag.projectCount} project{tag.projectCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(tag)}
                        className="text-sm text-primary hover:text-accent font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTag(tag)}
                        disabled={deletingId === tag.id}
                        className="text-sm text-destructive hover:text-destructive/80 font-medium disabled:opacity-50"
                      >
                        {deletingId === tag.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
