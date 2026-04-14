interface SkillBadgeProps {
  level: string | number;
}

const SKILL_MAP: Record<string, { label: string; color: string }> = {
  '0': { label: 'Newbie', color: 'bg-blue-100 text-blue-700' },
  '1': { label: 'Amateur', color: 'bg-purple-100 text-purple-700' },
  '2': { label: 'Semi-Pro', color: 'bg-amber-100 text-amber-700' },
  Newbie: { label: 'Newbie', color: 'bg-blue-100 text-blue-700' },
  Amateur: { label: 'Amateur', color: 'bg-purple-100 text-purple-700' },
  SemiPro: { label: 'Semi-Pro', color: 'bg-amber-100 text-amber-700' },
};

export default function SkillBadge({ level }: SkillBadgeProps) {
  const info = SKILL_MAP[String(level)] ?? { label: String(level), color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}
