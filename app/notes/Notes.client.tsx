"use client";

import css from "./NotesPage.module.css";
import NoteList from "@/components/NoteList/NoteList";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import Loader from "@/components/Loader/Loader";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";

import toast, { Toaster } from "react-hot-toast";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes, createNote, deleteNote } from "@/lib/api";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";
import { NoteTag } from "@/types/note";

interface NotesProps {
  tag?: NoteTag;
}

export default function Notes({ tag }: NotesProps) {
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState(``);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const perPage = 12;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["getNotes", search, page, tag ?? "all"],
    queryFn: () => fetchNotes({ search, page, perPage, tag }),
    placeholderData: keepPreviousData,
  });

  const updateSearchQuery = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 500);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    updateSearchQuery(value);
  };

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;
  const queryClient = useQueryClient();

  const deleteNotes = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getNotes"] });
      toast.success("Нотатку видалено");
    },
    onError: () => {
      toast.error(`Нотатку не знайдено`);
    },
  });

  const addNotes = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getNotes"] });
      setIsModalOpen(false);
      toast.success(`Нотатку додано`);
    },
  });

  useEffect(() => {
    if (search && !isLoading && data?.notes.length === 0) {
      toast.error(`Нотатку не знайдено`);
    }
  }, [data, search, isLoading]);

  return (
    <div className={css.app}>
      <Toaster position="top-right" />
      <header className={css.toolbar}>
        <SearchBox query={inputValue} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
          ></Pagination>
        )}
        {
          <button className={css.button} onClick={() => setIsModalOpen(true)}>
            Create note +
          </button>
        }
      </header>
      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {!isLoading && !isError && notes.length > 0 && (
        <NoteList notes={notes} onDelete={(id) => deleteNotes.mutate(id)} />
      )}
      {!isLoading && !isError && notes.length === 0 && (
        <p className={css.emptyState}>
          {tag ? `Нотаток з тегом "${tag}" ще немає` : "Нотаток ще немає"}
        </p>
      )}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onSubmit={(values) => addNotes.mutate(values)}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
