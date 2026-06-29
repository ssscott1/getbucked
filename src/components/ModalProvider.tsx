"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { DEFAULT_AMOUNT, DEFAULT_TERM_YEARS, type Frequency } from "@/lib/loan";
import { ApplicationModal } from "./ApplicationModal";

type OpenArgs = {
  source: string; // which CTA opened it (analytics / lead attribution)
  amount?: number;
  frequency?: Frequency;
  termYears?: number;
};

type ModalContextValue = {
  open: boolean;
  source: string;
  amount: number;
  frequency: Frequency;
  termYears: number;
  openModal: (args: OpenArgs) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("unknown");
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [termYears, setTermYears] = useState<number>(DEFAULT_TERM_YEARS);

  const openModal = useCallback((args: OpenArgs) => {
    setSource(args.source);
    if (typeof args.amount === "number") setAmount(args.amount);
    if (args.frequency) setFrequency(args.frequency);
    if (typeof args.termYears === "number") setTermYears(args.termYears);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      open,
      source,
      amount,
      frequency,
      termYears,
      openModal,
      closeModal,
    }),
    [open, source, amount, frequency, termYears, openModal, closeModal]
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
