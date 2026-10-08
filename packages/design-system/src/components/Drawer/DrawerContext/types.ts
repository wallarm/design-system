export interface DrawerContextValue {
  // Behavior
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnEscape: boolean;
  overlay: boolean;
  modal: boolean;
  /** Id of the Ark dialog content node — this overlay's layer in zag's layer stack */
  contentId: string;

  // Size management
  width: number | string;
  setWidth: (value: number | string) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  minWidth: number;
  maxWidth: number;
}
