"use client";

import NoteList from "@/components/NoteList/NoteList";
import Loader from "@/components/Loader/Loader";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";

import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchNotes, deleteNote } from "@/lib/api";
import type { NoteTag } from "@/types/note";

type Props = {
  tag: string;
};

const NotesByTag = ({ tag }: Props) => {
  const activeTag = tag === "all" ? undefined : (tag as NoteTag);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["getNotes", "", 1, tag],
    queryFn: () =>
      fetchNotes({ search: "", page: 1, perPage: 12, tag: activeTag }),
    placeholderData: keepPreviousData,
  });

  const deleteNotes = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getNotes"] });
    },
  });

  const notes = data?.notes ?? [];

  return (
    <div>
      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {!isLoading && !isError && notes.length === 0 && (
        <p>No notes found for this tag.</p>
      )}
      {!isLoading && !isError && notes.length > 0 && (
        <NoteList notes={notes} onDelete={(id) => deleteNotes.mutate(id)} />
      )}
    </div>
  );
};

export default NotesByTag;
