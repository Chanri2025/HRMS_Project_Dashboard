// src/Component/ProjectSection/ProjectDashboard/NewProjectModal.jsx
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select.tsx";
import { Badge } from "@/components/ui/badge.tsx";

import { getUserCtx } from "@/lib/http";
import {
  useCreateProject,
  useAddProjectMember,
} from "@/hooks/useActiveProjects.js";
import { useDeptMembers } from "@/hooks/useDeptMembers.js";
import { Separator } from "@/components/ui/separator";
import { X, Plus } from "lucide-react";

/* ------------------------ helpers ------------------------ */

// decode JWT payload without external libs (best-effort)
function decodeJwtNoVerify(token) {
  try {
    const payload = token?.split(".")[1];
    if (!payload) return null;
    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

// little chip for chosen members
function MemberChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-[10px] text-destructive hover:underline"
      >
        ✕
      </button>
    </span>
  );
}

/* ------------------------ component ------------------------ */

export default function NewProjectModal({ open, onOpenChange }) {
  const ctx = getUserCtx() || {};
  const { accessToken, user } = ctx;

  // Resolve the creator's user id from ctx or token
  const jwt = decodeJwtNoVerify(accessToken);
  const createdBy =
    user?.user_id ??
    user?.id ??
    user?.employee?.user_id ??
    user?.employee?.id ??
    jwt?.user_id ??
    jwt?.sub ??
    null;

  // form state
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  // status is locked to "Active" by default
  const [status] = useState("Active");

  // member selection state
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [pendingMembers, setPendingMembers] = useState([]); // {value,label,deptId,designationId}

  // queries / mutations
  const { data: deptMembers = [], isLoading: loadingDept } = useDeptMembers();
  const { mutate: createProject, isLoading: creating } = useCreateProject();
  const { mutateAsync: addMember, isLoading: addingMember } =
    useAddProjectMember();

  // map department members -> select options
  const memberOptions = useMemo(() => {
    return (deptMembers || [])
      .map((m) => {
        const rawUserId =
          m.user_id ?? m.userId ?? m.id ?? null;
        if (rawUserId == null) return null;

        const value = String(rawUserId);
        const label =
          m.full_name ||
          m.name ||
          m.employee?.full_name ||
          m.email ||
          `User ${value}`;
        const subtitle = [m.email, m.phone].filter(Boolean).join(" • ");

        const deptId = m.dept_id ?? m.deptId ?? undefined;
        const designationId =
          m.designation_id ?? m.designationId ?? undefined;

        return { value, label, subtitle, deptId, designationId };
      })
      .filter(Boolean);
  }, [deptMembers]);

  const resetForm = () => {
    setName("");
    setDesc("");
    setSelectedMemberId("");
    setPendingMembers([]);
  };

  const disableSubmit = !name.trim() || creating;

  const handleAddPendingMember = () => {
    if (!selectedMemberId) return;
    const existing = pendingMembers.some((m) => m.value === selectedMemberId);
    if (existing) return;

    const opt = memberOptions.find((o) => o.value === selectedMemberId);
    if (!opt) return;

    setPendingMembers((prev) => [...prev, opt]);
    setSelectedMemberId("");
  };

  const handleRemovePending = (value) => {
    setPendingMembers((prev) => prev.filter((m) => m.value !== value));
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!createdBy) {
      toast.error("Could not resolve your user id. Please re-login.");
      return;
    }

    const payload = {
      project_name: name.trim(),
      description: desc.trim(),
      project_status: "Active",
      created_by: Number(createdBy),
    };

    createProject(payload, {
      onSuccess: async (res) => {
        // Try to extract new project id from typical shapes
        const pid =
          res?.project_id ??
          res?.id ??
          res?.data?.project_id ??
          res?.data?.id;

        // add pending members (if we have a project id)
        if (pid && pendingMembers.length) {
          for (const m of pendingMembers) {
            if (m.deptId === undefined || m.deptId === null) continue;
            try {
              await addMember({
                projectId: pid,
                userId: m.value,
                deptId: m.deptId,
                designationId: m.designationId,
              });
            } catch (e) {
              // continue adding the others
            }
          }
        }

        resetForm();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border border-border/60 backdrop-blur">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/60 bg-card/80">
          <DialogTitle className="text-lg font-semibold">
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Start a project and (optionally) add team members right away.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* name */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Project name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Waste Analytics Dashboard"
              required
            />
          </div>

          {/* description */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Description
            </label>
            <Textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What is this project about?"
            />
          </div>

          {/* status (locked as Active, but shown) */}
          <div>
            <label className="block text-xs font-medium mb-1">Status</label>
            <Select value={status} disabled>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Status is set to <Badge className="px-1.5 py-0.5">Active</Badge>{" "}
              by default.
            </p>
          </div>

          <Separator />

          {/* members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium">
                Members (optional)
              </label>
              {!!pendingMembers.length && (
                <span className="text-[10px] text-muted-foreground">
                  {pendingMembers.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedMemberId}
                onValueChange={setSelectedMemberId}
                disabled={loadingDept || !memberOptions.length}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue
                    placeholder={
                      loadingDept
                        ? "Loading members..."
                        : memberOptions.length
                        ? "Select member"
                        : "No members available"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {memberOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                      {opt.subtitle ? ` — ${opt.subtitle}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                size="sm"
                className="h-9"
                onClick={handleAddPendingMember}
                disabled={!selectedMemberId || addingMember}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* chosen members */}
            <div className="mt-3 flex flex-wrap gap-2">
              {pendingMembers.map((m) => (
                <MemberChip
                  key={m.value}
                  label={m.label}
                  onRemove={() => handleRemovePending(m.value)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-border/60 flex items-center justify-end gap-2 bg-card/70">
          <Button type="button" variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={disableSubmit}
          >
            {creating ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
