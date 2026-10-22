import {
  Car,
  Droplets,
  ShieldCheck,
  Smartphone,
  Tv,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIconName } from "@/lib/data";

const ICONS: Record<ServiceIconName, LucideIcon> = {
  bolt: Zap,
  phone: Smartphone,
  wifi: Wifi,
  droplet: Droplets,
  shield: ShieldCheck,
  tv: Tv,
  wallet: Wallet,
  car: Car,
};

/**
 * Ikon garis modern untuk kartu layanan dan halaman detail.
 * SVG inline dari lucide, selalu tampil tanpa aset eksternal.
 */
export function ServiceIcon({
  name,
  size = 28,
  className = "",
}: {
  name: ServiceIconName;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Zap;
  return (
    <Icon
      size={size}
      strokeWidth={1.7}
      className={`service-icon ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
