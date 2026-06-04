import Badge from '../ui/Badge';
import { FiTrendingUp, FiMinus, FiTrendingDown } from 'react-icons/fi';

const meta = {
  easy:   { variant: 'success', label: 'Easy',   icon: FiTrendingDown },
  medium: { variant: 'warning', label: 'Medium', icon: FiMinus },
  hard:   { variant: 'danger',  label: 'Hard',   icon: FiTrendingUp }
};

export default function DifficultyIndicator({ difficulty = 'easy' }) {
  const m = meta[difficulty] || meta.easy;
  const Icon = m.icon;
  return (
    <Badge variant={m.variant} size="sm" icon={Icon}>
      {m.label}
    </Badge>
  );
}
