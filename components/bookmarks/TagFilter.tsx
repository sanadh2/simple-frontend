'use client';

import { useTags } from '@/hooks/useBookmarks';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function TagFilter({
  selectedTag,
  onTagSelect,
}: {
  selectedTag?: string;
  onTagSelect: (tag?: string) => void;
}) {
  const { data: tags, isLoading } = useTags();

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading tags...</div>;
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Filter by Tag</h3>
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!selectedTag ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => onTagSelect(undefined)}
        >
          All
        </Badge>
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => onTagSelect(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

