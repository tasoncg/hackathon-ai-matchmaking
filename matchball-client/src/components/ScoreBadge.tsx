interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  const color =
    score >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
    score >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
    score >= 40 ? 'text-orange-600 bg-orange-50 border-orange-200' :
    'text-red-600 bg-red-50 border-red-200';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${color} ${sizeClasses[size]}`}>
      {label && <span className="opacity-70">{label}</span>}
      {score}
    </span>
  );
}
