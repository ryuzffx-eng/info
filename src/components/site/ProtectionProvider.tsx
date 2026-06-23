import { useEffect } from "react";

export default function ProtectionProvider() {
  useEffect(() => {
    // 1. Disable right-click context menu globally
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // 2. Disable devtools shortcut keys globally
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12") {
        e.preventDefault();
        return;
      }

      // Ctrl + Shift + I / Cmd + Option + I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i")) {
        e.preventDefault();
        return;
      }

      // Ctrl + Shift + J / Cmd + Option + J
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
        return;
      }

      // Ctrl + Shift + C / Cmd + Option + C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        return;
      }

      // Ctrl + U / Cmd + Option + U (View Page Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        return;
      }

      // Ctrl + S / Cmd + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
        return;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // 3. Simple anti-debugger loop
    const antiDebugger = setInterval(() => {
      try {
        (function() {
          (function check(i: number) {
            if (("" + i / i).length !== 1 || i % 20 === 0) {
              (function() {}).constructor("debugger")();
            } else {
              debugger;
            }
          })(0);
        })();
      } catch (err) {}
    }, 1000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(antiDebugger);
    };
  }, []);

  return null;
}
