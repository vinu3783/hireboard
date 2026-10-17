"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ApiError, apiRequest } from "@/lib/api-client";

export function DeleteCandidateButton({ candidateId, name }: { candidateId: string; name: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiRequest(`/api/candidates/${candidateId}`, { method: "DELETE" });
      toast(`${name} was deleted`);
      router.push("/candidates");
      router.refresh();
    } catch (error) {
      setDeleting(false);
      setOpen(false);
      toast(error instanceof ApiError ? error.message : "Could not delete candidate", "error");
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-danger">
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        title={`Delete ${name}?`}
        description="This permanently removes the candidate and their profile. This can't be undone."
        confirmLabel="Delete candidate"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
