export interface DrawerContextValue {
  // Behavior
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnEscape: boolean;
  overlay: boolean;

  // Size management
  width: number | string;
  setWidth: (value: number | string) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  minWidth: number;
  maxWidth: number;
}
