import type { LucideIcon } from 'lucide-react-native';
import Award from 'lucide-react-native/icons/award';
import BookOpen from 'lucide-react-native/icons/book-open';
import Calendar from 'lucide-react-native/icons/calendar';
import Check from 'lucide-react-native/icons/check';
import ChevronDown from 'lucide-react-native/icons/chevron-down';
import ChevronLeft from 'lucide-react-native/icons/chevron-left';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleX from 'lucide-react-native/icons/circle-x';
import Clock from 'lucide-react-native/icons/clock';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import Flame from 'lucide-react-native/icons/flame';
import GraduationCap from 'lucide-react-native/icons/graduation-cap';
import House from 'lucide-react-native/icons/house';
import Info from 'lucide-react-native/icons/info';
import KeyRound from 'lucide-react-native/icons/key-round';
import Languages from 'lucide-react-native/icons/languages';
import Lock from 'lucide-react-native/icons/lock';
import LogOut from 'lucide-react-native/icons/log-out';
import Mail from 'lucide-react-native/icons/mail';
import Maximize from 'lucide-react-native/icons/maximize';
import Medal from 'lucide-react-native/icons/medal';
import Moon from 'lucide-react-native/icons/moon';
import Pause from 'lucide-react-native/icons/pause';
import Pencil from 'lucide-react-native/icons/pencil';
import Play from 'lucide-react-native/icons/play';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import Search from 'lucide-react-native/icons/search';
import Settings from 'lucide-react-native/icons/settings';
import Smartphone from 'lucide-react-native/icons/smartphone';
import Sun from 'lucide-react-native/icons/sun';
import SunMoon from 'lucide-react-native/icons/sun-moon';
import Trash from 'lucide-react-native/icons/trash';
import Trophy from 'lucide-react-native/icons/trophy';
import User from 'lucide-react-native/icons/user';
import Vibrate from 'lucide-react-native/icons/vibrate';
import X from 'lucide-react-native/icons/x';

/** Every icon the app uses, by a short role-based name. Swapping an icon means changing one line here. */
const ICONS = {
  home: House,
  user: User,
  check: Check,
  lock: Lock,
  play: Play,
  pause: Pause,
  trophy: Trophy,
  flame: Flame,
  /** XP / points. A medal, not a lightning bolt. */
  xp: Medal,
  level: Award,
  book: BookOpen,
  back: ChevronLeft,
  next: ChevronRight,
  close: X,
  refresh: RotateCcw,
  alert: CircleX,
  expand: Maximize,
  edit: Pencil,
  clock: Clock,
  brand: GraduationCap,
  calendar: Calendar,
  down: ChevronDown,
  eye: Eye,
  eyeOff: EyeOff,
  info: Info,
  key: KeyRound,
  logout: LogOut,
  mail: Mail,
  search: Search,
  settings: Settings,
  appearance: SunMoon,
  languages: Languages,
  light: Sun,
  dark: Moon,
  phone: Smartphone,
  trash: Trash,
  vibrate: Vibrate,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

/** True if `name` is one of our icons. Lets content files (courses) name an icon safely. */
export const isIconName = (name: unknown): name is IconName => typeof name === 'string' && name in ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  /** Solid shape (play, flame) instead of an outline. */
  filled?: boolean;
  strokeWidth?: number;
}

/** Thin wrapper over Lucide so every screen shares one icon family and one default line weight. */
export function Icon({ name, size = 24, color, filled = false, strokeWidth = 2 }: IconProps) {
  const Glyph = ICONS[name];
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} fill={filled ? color : 'none'} accessibilityElementsHidden />;
}
