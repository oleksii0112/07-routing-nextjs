import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import Notes from "@/app/notes/Notes.client";
import { NoteTag } from "@/types/note";


type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function FilterNotesPage({ params }: Props) {
  const { slug } = await params;
  const rawTag = slug?.[0];
  const tag: NoteTag | undefined =
    !rawTag || rawTag === "all" ? undefined : (rawTag as NoteTag);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["getNotes", tag ?? "all", "", 1],
    queryFn: () => fetchNotes({ search: "", page: 1, perPage: 12, tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Notes tag={tag} />
    </HydrationBoundary>
  );
}
