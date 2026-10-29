import { AppFrame } from "@/components/shell/AppFrame";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppFrame>{children}</AppFrame>;
}
