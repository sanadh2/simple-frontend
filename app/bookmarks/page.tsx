'use client';

import { useState } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkForm } from '@/components/bookmarks/BookmarkForm';
import { BookmarkCard } from '@/components/bookmarks/BookmarkCard';
import { TagFilter } from '@/components/bookmarks/TagFilter';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function BookmarksPage() {
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, error } = useBookmarks({
    tag: selectedTag,
    search: debouncedSearch || undefined,
    limit: 50,
  });

  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Bookmarks</h1>
        <p className="text-gray-600">
          Save and organize your bookmarks with AI-powered tagging
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <BookmarkForm />
          <TagFilter selectedTag={selectedTag} onTagSelect={setSelectedTag} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <Input
              type="search"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Card>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
              <p className="mt-4 text-gray-600">Loading bookmarks...</p>
            </div>
          )}

          {error && (
            <Card className="p-6 text-center">
              <p className="text-red-500">Failed to load bookmarks</p>
            </Card>
          )}

          {data && data.bookmarks.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-gray-500 text-lg">No bookmarks yet</p>
              <p className="text-gray-400 mt-2">
                Add your first bookmark using the form on the left
              </p>
            </Card>
          )}

          {data && data.bookmarks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {data.totalCount} bookmark{data.totalCount !== 1 ? 's' : ''} found
                </p>
              </div>

              {data.bookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark._id} bookmark={bookmark} />
              ))}

              {data.hasMore && (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">More bookmarks available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Implement pagination to load more
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

