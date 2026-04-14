interface ConfidenceMeterProps {
  score: number; // 0-100
}

export default function ConfidenceMeter({ score }: ConfidenceMeterProps) {
  const color =
    score >= 75 ? 'bg-green-500' :
    score >= 50 ? 'bg-yellow-500' :
    score >= 25 ? 'bg-orange-500' :
    'bg-red-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">Match Confidence</span>
        <span className="font-semibold">{score.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );
}
