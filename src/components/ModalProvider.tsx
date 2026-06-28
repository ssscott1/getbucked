"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { DEFAULT_AMOUNT, type Frequency } from "@/lib/loan";
import { ApplicationModal } from "./ApplicationModal";

type OpenArgs = {
  source: string; // which CTA opened it (analytics / lead attribution)
  amount?: number;
  frequency?: Frequency;
};

type ModalContextValue = {
  open: boolean;
  source: string;
  amount: number;
  frequency: Frequency;
  openModal: (args: OpenArgs) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("unknown");
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);
  const [frequency, setFrequency] = useState<Frequency>("weekly");

  const openModal = useCallback((args: OpenArgs) => {
    setSource(args.source);
    if (typeof args.amount === "number") setAmount(args.amount);
    if (args.frequency) setFrequency(args.frequency);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, source, amount, frequency, openModal, closeModal }),
    [open, source, amount, frequency, openModal, closeModal]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ApplicationModal />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside <ModalProvider>");
  return ctx;
}
