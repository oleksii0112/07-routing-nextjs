import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import type { NoteTag } from "@/types/note";
import NotesByTag from "./NotesByTag.client";

type Props = {
  params: Promise<{ slug: string[] }>;
};

const NotesFilterPage = async ({ params }: Props) => {
  const { slug } = await params;
  const rawTag = slug?.[0] ?? "all";
  const tag = rawTag === "all" ? undefined : (rawTag as NoteTag);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["getNotes", "", 1, rawTag],
    queryFn: () => fetchNotes({ search: "", page: 1, perPage: 12, tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesByTag tag={rawTag} />
    </HydrationBoundary>
  );
};

export default NotesFilterPage;
