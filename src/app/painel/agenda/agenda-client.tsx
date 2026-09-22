"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AgendaList, type Show } from "@/components/features/agenda/AgendaList";
import { AgendaForm } from "@/components/features/agenda/AgendaForm";
import type { ShowCreateData } from "@/lib/validators/shows";
import { Plus } from "lucide-react";

export function AgendaClient({ initialShows }: { initialShows: Show[] }) {
  const [shows, setShows] = useState<Show[]>(() => [...initialShows].sort((a, b) => a.data.localeCompare(b.data) || (a.horario ?? "").localeCompare(b.horario ?? "")));
  const [editing, setEditing] = useState<Show | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Show | null>(null);
  const [error, setError] = useState<string | null>(null);

  function sortShows(list: Show[]) {
    return [...list].sort((a, b) => a.data.localeCompare(b.data) || (a.horario ?? "").localeCompare(b.horario ?? ""));
  }

  async function handleCreate(data: ShowCreateData) {
    setError(null);
    const res = await fetch("/api/shows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Falha ao criar");
    setShows((prev) => sortShows([...prev, json.show]));
    setCreating(false);
  }

  async function handleUpdate(data: ShowCreateData) {
    if (!editing) return;
    setError(null);
    const res = await fetch(`/api/shows?id=${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Falha ao atualizar");
    setShows((prev) => sortShows(prev.map((s) => (s.id === editing.id ? json.show : s))));
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    setError(null);
    const res = await fetch(`/api/shows?id=${deleting.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Falha ao excluir");
    setShows((prev) => prev.filter((s) => s.id !== deleting.id));
    setDeleting(null);
  }

  const isModalOpen = creating || !!editing;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Novo show
        </Button>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <AgendaList shows={shows} onEdit={setEditing} onDelete={setDeleting} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? "Editar show" : "Novo show"}
        description="Preencha os dados da apresentação. Data e nome são obrigatórios."
      >
        <AgendaForm
          defaultValues={
            editing
              ? { nome_evento: editing.nome_evento, data: editing.data, horario: editing.horario ?? "", local: editing.local ?? "", cidade: editing.cidade ?? "" }
              : undefined
          }
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        title="Excluir show?"
        description="Essa ação não pode ser desfeita."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-white/70">
          Tem certeza que deseja excluir <span className="font-semibold text-white">{deleting?.nome_evento}</span> em {deleting?.data}?
        </p>
      </Modal>
    </div>
  );
}
