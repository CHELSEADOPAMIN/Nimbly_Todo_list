import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "@/components/ui/dialog";

const renderDialog = (overrides: Partial<ComponentProps<typeof Dialog>> = {}) => {
  const onClose = vi.fn();
  const onConfirm = vi.fn(async () => {});

  render(
    <Dialog
      open
      title="Delete this task?"
      description="This action removes the task"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onClose={onClose}
      onConfirm={onConfirm}
      {...overrides}
    />,
  );

  return {
    onClose,
    onConfirm,
  };
};

describe("Dialog component", () => {
  it("should not be open when open=false", () => {
    renderDialog({ open: false });

    const dialog = document.querySelector("dialog");
    expect(dialog).not.toHaveAttribute("open");
  });

  it("should render title, description, and action buttons when open=true", () => {
    renderDialog();

    expect(screen.getByText("Delete this task?")).toBeInTheDocument();
    expect(screen.getByText("This action removes the task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should show Working... and disable both buttons when isBusy=true", () => {
    renderDialog({ isBusy: true });

    expect(screen.getByRole("button", { name: "Working..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("should apply destructive class when tone is destructive", () => {
    renderDialog({ tone: "destructive" });

    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("bg-destructive");
  });
});
