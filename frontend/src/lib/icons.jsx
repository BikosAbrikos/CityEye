/**
 * Единый SVG-набор (lucide-стиль): stroke, currentColor, viewBox 24×24.
 * Никаких эмодзи как иконок. size управляет шириной/высотой, остальное — className.
 */

function Icon({ size = 22, strokeWidth = 1.75, className = "", children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ── Навигация ── */
export const MapIcon = (p) => (
  <Icon {...p}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
    <path d="M9 4v14M15 6v14" />
  </Icon>
);
export const ListIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M8 8.5h8M8 12h8M8 15.5h5" />
  </Icon>
);
export const UserIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.7-5.5 7-5.5s6.2 1.9 7 5.5" />
  </Icon>
);

/* ── Действия ── */
export const CameraIcon = (p) => (
  <Icon {...p}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h1.8l1-1.6A1.5 1.5 0 0 1 10.6 4.7h2.8a1.5 1.5 0 0 1 1.3.7l1 1.6h1.8A1.5 1.5 0 0 1 19 8.5v8A1.5 1.5 0 0 1 17.5 18h-11A1.5 1.5 0 0 1 5 16.5Z" />
    <circle cx="12" cy="12.5" r="3.2" />
  </Icon>
);
export const SparklesIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 13.4 8 18 9.4 13.4 10.8 12 15.3 10.6 10.8 6 9.4 10.6 8Z" />
    <path d="M18.5 14.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6Z" />
  </Icon>
);
export const SendIcon = (p) => (
  <Icon {...p}>
    <path d="M21 4 3 11l6.5 2.2L12 20l3-7Z" />
    <path d="M9.5 13.2 21 4" />
  </Icon>
);
export const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const ArrowRightIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const ArrowLeftIcon = (p) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);
export const RotateIcon = (p) => (
  <Icon {...p}>
    <path d="M3 8a9 9 0 1 1-1.4 5" />
    <path d="M3 3v5h5" />
  </Icon>
);
export const XIcon = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const ChevronUpIcon = (p) => (
  <Icon {...p}>
    <path d="m6 14 6-6 6 6" />
  </Icon>
);
export const ChevronDownIcon = (p) => (
  <Icon {...p}>
    <path d="m6 10 6 6 6-6" />
  </Icon>
);
export const ChevronRightIcon = (p) => (
  <Icon {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);
export const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="m4 12 5 5L20 6" />
  </Icon>
);
export const LogOutIcon = (p) => (
  <Icon {...p}>
    <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M9 12h11M16 8l4 4-4 4" />
  </Icon>
);
export const SunIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);
export const MoonIcon = (p) => (
  <Icon {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
  </Icon>
);
export const MapPinIcon = (p) => (
  <Icon {...p}>
    <path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </Icon>
);
export const MessageIcon = (p) => (
  <Icon {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9A1.5 1.5 0 0 1 18.5 16H9l-4 4v-4H5.5A1.5 1.5 0 0 1 4 14.5Z" />
  </Icon>
);
export const StarIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 14.6 9l6 .8-4.4 4.2 1.1 6-5.3-2.9L6.7 20l1.1-6L3.4 9.8l6-.8Z" />
  </Icon>
);
export const LandmarkIcon = (p) => (
  <Icon {...p}>
    <path d="M4 10h16M5 10v8M19 10v8M9.5 10v8M14.5 10v8M3.5 21h17M12 3 20 8H4Z" />
  </Icon>
);
export const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 21.5 20H2.5L12 3.5Z" />
    <path d="M12 9.5v5M12 17.5h.01" />
  </Icon>
);
export const SlidersIcon = (p) => (
  <Icon {...p}>
    <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="13" cy="18" r="2" />
  </Icon>
);
export const ZoomIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M8 11h6M11 8v6" />
  </Icon>
);
export const InboxIcon = (p) => (
  <Icon {...p}>
    <path d="M4 13h4l1.5 2.5h5L16 13h4" />
    <path d="M5.5 6h13l1.5 7v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5Z" />
  </Icon>
);

export const PlayIcon = (p) => (
  <Icon {...p}>
    <path d="M7 5.5v13l11-6.5-11-6.5Z" />
  </Icon>
);
export const VolumeIcon = (p) => (
  <Icon {...p}>
    <path d="M5 9v6h3.5L13 19V5L8.5 9H5Z" />
    <path d="M16.5 8.5a4.5 4.5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" />
  </Icon>
);
export const VolumeMuteIcon = (p) => (
  <Icon {...p}>
    <path d="M5 9v6h3.5L13 19V5L8.5 9H5Z" />
    <path d="m16.5 9.5 4 4M20.5 9.5l-4 4" />
  </Icon>
);

/* ── Иконки типов проблем (заменяют эмодзи TYPE_ICONS) ── */
const PotholeIcon = (p) => (
  <Icon {...p}>
    <path d="M3 16c2-1 5-1.5 9-1.5s7 .5 9 1.5c0 2.5-4 4-9 4s-9-1.5-9-4Z" />
    <path d="M8.5 11 10 6M14 12l1-7M11.5 12.5l.5-4" />
  </Icon>
);
const GarbageIcon = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);
const StreetlightIcon = (p) => (
  <Icon {...p}>
    <path d="M9 21h6M12 21v-7" />
    <path d="M12 14a4 4 0 0 0 4-4c0-2.5-1.8-4.5-4-4.5S8 7.5 8 10a4 4 0 0 0 4 4Z" />
    <path d="M10.5 10.2c0-1 .7-1.8 1.5-1.8" />
  </Icon>
);
const GraffitiIcon = (p) => (
  <Icon {...p}>
    <rect x="8" y="8" width="9" height="6" rx="1.5" />
    <path d="M17 9.5h2.5V13M8 11H5.5M14 8V5.5h-3M11 5.5 10 3" />
    <path d="M8 17c0 1.5 9 1.5 9 0" />
  </Icon>
);
const SignIcon = (p) => (
  <Icon {...p}>
    <path d="M9 21h6M10 21l1-7M14 21l-1-7" />
    <path d="m12 3-7 11h14L12 3Z" />
    <path d="M12 8v3" />
  </Icon>
);
const OtherIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2" />
  </Icon>
);

const TYPE_ICON = {
  pothole: PotholeIcon,
  garbage: GarbageIcon,
  streetlight: StreetlightIcon,
  graffiti: GraffitiIcon,
  sign: SignIcon,
  other: OtherIcon,
};

export function TypeIcon({ type, ...rest }) {
  const C = TYPE_ICON[type] || OtherIcon;
  return <C {...rest} />;
}
