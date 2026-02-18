import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox component", () => {
  it("should render unchecked state with aria-checked=false and checkbox role", () => {
    render(<Checkbox checked={false} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("should call onCheckedChange(true) when clicking unchecked checkbox", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("checkbox"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("should call onCheckedChange(false) when clicking checked checkbox", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Checkbox checked onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("checkbox"));

    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("should not trigger onCheckedChange and should be disabled when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();

    render(<Checkbox checked={false} disabled onCheckedChange={onCheckedChange} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();

    await user.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
