import { useCallback, useState } from "react";

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (isOpen: boolean) => void;
}

export const useModal = (initialState = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setOpen = useCallback((isOpen: boolean) => {
    setIsOpen(isOpen);
  }, []);

  return {
    isOpen,
    setOpen,
    open,
    close,
    toggle,
  };
};
