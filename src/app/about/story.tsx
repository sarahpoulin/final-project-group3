'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_HEADING = 'Our Story';
const DEFAULT_BODY = `This is where you add your story.`;

type Props = {
  initialHeading: string | null;
  initialBody: string | null;
  isAdmin: boolean;
};

export default function Story({
  initialHeading,
  initialBody,
  isAdmin,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heading, setHeading] = useState(initialHeading ?? DEFAULT_HEADING);
  const [body, setBody] = useState(initialBody ?? DEFAULT_BODY);

  const displayHeading = initialHeading ?? DEFAULT_HEADING;
  const displayBody = initialBody ?? DEFAULT_BODY;
  const paragraphs = displayBody.trim().split(/\n\n+/).filter(Boolean);

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all([
        fetch('/api/site-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'about.ourStoryHeading', value: heading }),
        }),
        fetch('/api/site-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'about.ourStoryBody', value: body }),
        }),
      ]);
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setHeading(initialHeading ?? DEFAULT_HEADING);
    setBody(initialBody ?? DEFAULT_BODY);
    setEditing(false);
  }

  return (
    <section aria-labelledby="our-story" className="mb-12 bg-muted p-6 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 id="our-story" className="text-2xl font-semibold">
            {editing ? (
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="bg-background border border-border rounded px-3 py-2 w-full max-w-md text-2xl font-semibold"
                aria-label="Our Story heading"
              />
            ) : (
              displayHeading
            )}
          </h2>
          {isAdmin && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="shrink-0 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground resize-y"
              aria-label="Our Story body"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="bg-muted-foreground/20 text-foreground px-4 py-2 rounded-md hover:bg-muted-foreground/30 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <p key={i} className="text-foreground mb-4 last:mb-0">
                  {p.replace(/\n/g, ' ')}
                </p>
              ))
            ) : (
              <p className="text-foreground mb-4">
                {displayBody || ' '}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
