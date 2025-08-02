import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <Sidebar isOpen={isOpen} onClose={onClose} />
  );
}
