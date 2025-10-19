import Link from 'next/link';

interface ConversationItemProps {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  created_at: string;
  onDelete: (id: string) => void;
}

export default function ConversationItem({ id, title, summary, tags, created_at, onDelete }: ConversationItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="relative bg-surface border border-border rounded-lg shadow-sm transition-shadow duration-200 hover:shadow-md">
      <Link href={`/conversations/${id}`} className="block p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-text-primary truncate pr-24">{title}</h3>
          <p className="text-sm text-text-secondary flex-shrink-0">{new Date(created_at + 'Z').toLocaleDateString()}</p>
        </div>
        <p className="text-sm text-text-secondary mt-2 truncate">{summary}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map(tag => (
            <span key={tag} className="bg-background text-text-secondary text-xs font-medium px-3 py-1 rounded-full border border-border">
              {tag}
            </span>
          ))}
        </div>
      </Link>
      <button 
        onClick={handleDelete} 
        className="absolute top-6 right-6 text-red-500 hover:text-red-700 font-bold py-1 px-2 rounded-full transition-colors duration-200"
      >
        Delete
      </button>
    </div>
  );
}
