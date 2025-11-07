import React from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/**
 * Reusable confirm dialog
 *
 * Props:
 * - open: boolean
 * - onOpenChange: (bool) => void
 * - title?: string
 * - description?: string | ReactNode
 * - confirmText?: string
 * - cancelText?: string
 * - variant?: "default" | "destructive" | "secondary" | ...
 * - onConfirm: () => void | Promise<void>
 * - onCancel?: () => void
 * - loading?: boolean
 */
export default function ConfirmDialog({
                                          open,
                                          onOpenChange,
                                          title = "Are you sure?",
                                          description = "This action cannot be undone.",
                                          confirmText = "Confirm",
                                          cancelText = "Cancel",
                                          variant = "destructive",
                                          onConfirm,
                                          onCancel,
                                          loading = false,
                                      }) {
    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    const handleConfirm = async () => {
        await onConfirm?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[320px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? (
                        <DialogDescription>{description}</DialogDescription>
                    ) : null}
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Please wait..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
