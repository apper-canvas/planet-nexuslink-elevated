// Import all required icons from lucide-react
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Mail,
  FileText,
  Download,
  Upload,
  Trash,
  Edit,
  Plus,
  DollarSign,
  Check,
  Users,
  Clock,
  ThumbsUp,
  Phone,
  MessageSquare,
  Filter,
  BarChart2,
  PieChart,
  LineChart,
  Activity,
  Briefcase,
  Star,
  BookOpen,
  Link,
  Paperclip,
  ExternalLink,
  MoreHorizontal,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  Save,
  Archive,
  Inbox,
  Send
} from 'lucide-react';

// Map of icon names to components
const iconMap = {
  search: Search, bell: Bell, user: User, settings: Settings, logout: LogOut, moon: Moon, sun: Sun,
  menu: Menu, x: X, 'chevron-down': ChevronDown, 'chevron-right': ChevronRight, 'chevron-left': ChevronLeft,
  calendar: Calendar, mail: Mail, 'file-text': FileText, download: Download, upload: Upload, trash: Trash,
  edit: Edit, plus: Plus, 'dollar-sign': DollarSign, check: Check, users: Users, clock: Clock, 'thumbs-up': ThumbsUp,
  phone: Phone, 'message-square': MessageSquare, filter: Filter, 'bar-chart-2': BarChart2, 'pie-chart': PieChart,
  'line-chart': LineChart, activity: Activity, briefcase: Briefcase, star: Star, 'book-open': BookOpen, link: Link,
  paperclip: Paperclip, 'external-link': ExternalLink, 'more-horizontal': MoreHorizontal, eye: Eye, 'eye-off': EyeOff,
  info: Info, 'alert-circle': AlertCircle, save: Save, archive: Archive, inbox: Inbox, send: Send
};

// Function to get icon by name with error handling
export const getIcon = (name) => {
  if (!name || typeof name !== 'string') {
    console.warn(`Invalid icon name: ${name}`);
    return FileText; // Default fallback icon
  }
  
  const icon = iconMap[name.toLowerCase()];
  if (!icon) {
    console.warn(`Icon not found: ${name}`);
    return FileText; // Default fallback icon
  }
  
  return icon;
};