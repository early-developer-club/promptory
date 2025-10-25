import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

interface ConversationItemProps {
  id: string;
  title: string;
  tags: string[];
  created_at: string;
  onDelete: (id: string) => void;
}

export default function ConversationItem({ id, title, tags, created_at, onDelete }: ConversationItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <Link href={`/conversations/${id}`} className="block">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="truncate pr-8">{title}</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="-my-2 -mx-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{new Date(created_at + 'Z').toLocaleDateString()}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </CardFooter>
      </Link>
    </Card>
  );
}
