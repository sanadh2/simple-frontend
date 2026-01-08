'use client';

import { useState } from 'react';
import { useCreateBookmark } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export function BookmarkForm({ onSuccess }: { onSuccess?: () => void }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [useAI, setUseAI] = useState(true);

  const createBookmark = useCreateBookmark();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBookmark.mutateAsync({
        url,
        title,
        description: description || undefined,
        useAI,
      });

      setUrl('');
      setTitle('');
      setDescription('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create bookmark:', error);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Awesome Bookmark"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useAI"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <Label htmlFor="useAI" className="cursor-pointer">
            Use AI to auto-generate tags
          </Label>
        </div>

        <Button
          type="submit"
          disabled={createBookmark.isPending}
          className="w-full"
        >
          {createBookmark.isPending ? 'Adding...' : 'Add Bookmark'}
        </Button>

        {createBookmark.isError && (
          <p className="text-sm text-red-500">
            Failed to add bookmark. Please try again.
          </p>
        )}
      </form>
    </Card>
  );
}

