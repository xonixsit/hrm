/**
 * Icon System Configuration
 * 
 * This file provides a centralized icon mapping system using Heroicons v2 and Lucide icons.
 * It ensures consistent icon usage across the application and provides fallback mechanisms.
 */

// Heroicons imports (outline and solid variants)
import {
  // Navigation icons
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  
  // User and people icons
  UserIcon,
  UsersIcon,
  UserCircleIcon,
  UserPlusIcon,
  UserMinusIcon,
  
  // Business and management icons
  BuildingOfficeIcon,
  BriefcaseIcon,
  FolderIcon,
  FolderOpenIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  CalendarDaysIcon,
  ClockIcon,
  
  // Communication icons
  ChatBubbleLeftRightIcon,
  BellIcon,
  EnvelopeIcon,
  PhoneIcon,
  
  // Actions icons
  PlusIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  
  // Status and feedback icons
  CheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  
  // File and document icons
  DocumentIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  PhotoIcon,
  PaperClipIcon,
  
  // Interface icons
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  
  // Authentication icons
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
  ShieldCheckIcon,
  
  // Utility icons
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  WifiIcon,
  SignalIcon,
  BoltIcon,
  HeartIcon,
  StarIcon,
  
} from '@heroicons/vue/24/outline';

import {
  HomeIcon as HomeIconSolid,
  UserIcon as UserIconSolid,
  UsersIcon as UsersIconSolid,
  BellIcon as BellIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/vue/24/solid';

// Lucide icons for specialized business icons
import {
  Calendar as CalendarLucide,
  Clock as ClockLucide,
  Users as UsersLucide,
  Building as BuildingLucide,
  FileText as FileTextLucide,
  MessageSquare as MessageSquareLucide,
  BarChart3 as BarChart3Lucide,
  TrendingUp as TrendingUpLucide,
  Target as TargetLucide,
  Award as AwardLucide,
  Briefcase as BriefcaseLucide,
  Calendar as CalendarCheckLucide,
  CalendarX as CalendarXLucide,
  DollarSign as DollarSignLucide,
  PieChart as PieChartLucide,
  Activity as ActivityLucide,
} from 'lucide-vue-next';

/**
 * Icon mapping object that provides semantic names for icons
 * This allows for easy icon swapping and consistent usage across the app
 */
export const iconMap = {
  // Navigation
  home: HomeIcon,
  'home-solid': HomeIconSolid,
  menu: Bars3Icon,
  close: XMarkIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-left': ChevronLeftIcon,
  'chevron-up': ChevronUpIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  
  // User management
  user: UserIcon,
  'user-solid': UserIconSolid,
  users: UsersIcon,
  'users-solid': UsersIconSolid,
  'user-circle': UserCircleIcon,
  'user-plus': UserPlusIcon,
  'user-minus': UserMinusIcon,
  
  // Business entities
  building: BuildingOfficeIcon,
  'building-office': BuildingOfficeIcon,
  briefcase: BriefcaseIcon,
  folder: FolderIcon,
  'folder-open': FolderOpenIcon,
  document: DocumentTextIcon,
  'document-text': DocumentTextIcon,
  clipboard: ClipboardDocumentListIcon,
  
  // Time management
  calendar: CalendarIcon,
  'calendar-days': CalendarDaysIcon,
  'calendar-check': CalendarCheckLucide,
  'calendar-x': CalendarXLucide,
  clock: ClockIcon,
  
  // Communication
  chat: ChatBubbleLeftRightIcon,
  'message-square': MessageSquareLucide,
  bell: BellIcon,
  'bell-solid': BellIconSolid,
  envelope: EnvelopeIcon,
  phone: PhoneIcon,
  
  // Actions
  plus: PlusIcon,
  minus: MinusIcon,
  edit: PencilIcon,
  pencil: PencilIcon,
  delete: TrashIcon,
  trash: TrashIcon,
  view: EyeIcon,
  eye: EyeIcon,
  'eye-slash': EyeSlashIcon,
  settings: Cog6ToothIcon,
  cog: Cog6ToothIcon,
  search: MagnifyingGlassIcon,
  
  // Status indicators
  check: CheckIcon,
  'check-circle': CheckCircleIcon,
  'check-circle-solid': CheckCircleIconSolid,
  'x-circle': XCircleIcon,
  'x-circle-solid': XCircleIconSolid,
  warning: ExclamationTriangleIcon,
  'warning-solid': ExclamationTriangleIconSolid,
  info: InformationCircleIcon,
  'info-solid': InformationCircleIconSolid,
  
  // File operations
  'document-download': DocumentArrowDownIcon,
  'document-upload': DocumentArrowUpIcon,
  photo: PhotoIcon,
  attachment: PaperClipIcon,
  
  // Interface elements
  'dots-horizontal': EllipsisHorizontalIcon,
  'dots-vertical': EllipsisVerticalIcon,
  adjustments: AdjustmentsHorizontalIcon,
  filter: FunnelIcon,
  grid: Squares2X2Icon,
  list: ListBulletIcon,
  
  // Security
  lock: LockClosedIcon,
  'lock-open': LockOpenIcon,
  key: KeyIcon,
  shield: ShieldCheckIcon,
  
  // Theme and preferences
  sun: SunIcon,
  moon: MoonIcon,
  desktop: ComputerDesktopIcon,
  
  // Connectivity
  wifi: WifiIcon,
  signal: SignalIcon,
  bolt: BoltIcon,
  
  // Engagement
  heart: HeartIcon,
  'heart-solid': HeartIconSolid,
  star: StarIcon,
  'star-solid': StarIconSolid,
  
  // Business analytics (Lucide icons)
  'bar-chart': BarChart3Lucide,
  'trending-up': TrendingUpLucide,
  target: TargetLucide,
  award: AwardLucide,
  'dollar-sign': DollarSignLucide,
  'pie-chart': PieChartLucide,
  activity: ActivityLucide,
};

/**
 * Icon size mapping for consistent sizing
 */
export const iconSizes = {
  xs: 'icon-xs',    // 12px
  sm: 'icon-sm',    // 16px
  md: 'icon-md',    // 20px
  lg: 'icon-lg',    // 24px
  xl: 'icon-xl',    // 32px
  '2xl': 'icon-2xl' // 48px
};

/**
 * Navigation-specific icon mapping for role-based menus
 */
export const navigationIcons = {
  dashboard: 'home',
  people: 'users',
  employees: 'user',
  departments: 'building-office',
  attendance: 'calendar-check',
  timesheets: 'document-text',
  leaves: 'calendar-x',
  projects: 'folder-open',
  tasks: 'clipboard',
  feedbacks: 'message-square',
  notifications: 'bell',
  settings: 'cog',
  profile: 'user-circle',
  logout: 'arrow-left',
};

/**
 * Status icon mapping for different states
 */
export const statusIcons = {
  success: 'check-circle-solid',
  error: 'x-circle-solid',
  warning: 'warning-solid',
  info: 'info-solid',
  pending: 'clock',
  approved: 'check-circle-solid',
  rejected: 'x-circle-solid',
  draft: 'document',
};

/**
 * Action icon mapping for common CRUD operations
 */
export const actionIcons = {
  create: 'plus',
  read: 'eye',
  update: 'pencil',
  delete: 'trash',
  edit: 'pencil',
  view: 'eye',
  download: 'document-download',
  upload: 'document-upload',
  search: 'search',
  filter: 'filter',
  sort: 'adjustments',
};

/**
 * Helper function to get icon component by name
 * @param {string} iconName - The semantic name of the icon
 * @returns {Component|null} - The Vue icon component or null if not found
 */
export function getIcon(iconName) {
  return iconMap[iconName] || null;
}

/**
 * Helper function to get navigation icon by route name
 * @param {string} routeName - The route name
 * @returns {Component|null} - The Vue icon component or null if not found
 */
export function getNavigationIcon(routeName) {
  const iconName = navigationIcons[routeName];
  return iconName ? getIcon(iconName) : null;
}

/**
 * Helper function to get status icon by status
 * @param {string} status - The status name
 * @returns {Component|null} - The Vue icon component or null if not found
 */
export function getStatusIcon(status) {
  const iconName = statusIcons[status];
  return iconName ? getIcon(iconName) : null;
}

/**
 * Helper function to get action icon by action type
 * @param {string} action - The action type
 * @returns {Component|null} - The Vue icon component or null if not found
 */
export function getActionIcon(action) {
  const iconName = actionIcons[action];
  return iconName ? getIcon(iconName) : null;
}

export default {
  iconMap,
  iconSizes,
  navigationIcons,
  statusIcons,
  actionIcons,
  getIcon,
  getNavigationIcon,
  getStatusIcon,
  getActionIcon,
};