interface Props {
  tags: string[]
  selectedTag: string | null
  onSelect: (tag: string | null) => void
}

export function TagFilter({ tags, selectedTag, onSelect }: Props) {
  if (tags.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h2 className="font-medium text-gray-900 mb-3">タグ</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`text-sm px-2 py-1 rounded ${
            selectedTag === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelect(tag === selectedTag ? null : tag)}
            className={`text-sm px-2 py-1 rounded ${
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
