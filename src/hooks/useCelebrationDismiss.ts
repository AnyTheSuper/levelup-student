import { useEffect } from "react";

export function useCelebrationDismiss(onDone: () => void, autoDismissMs: number) {
  useEffect(() => {
    let dismissed = false;
    const mountedAt = Date.now();

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      onDone();
    };

    const timer = setTimeout(dismiss, autoDismissMs);
    const onKeyDown = () => dismiss();
    const onPointerDown = () => {
      // Ignore the tap that just completed the task
      if (Date.now() - mountedAt < 300) return;
      dismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onDone, autoDismissMs]);
}
