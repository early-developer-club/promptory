import { Suspense } from 'react';
import ConversationSearch from '@/app/ui/conversation-search';

export default function Home() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ConversationSearch />
      </Suspense>
    </div>
  );
}