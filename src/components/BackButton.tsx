import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
    >
      <ArrowLeft size={16} />
      Назад
    </button>
  );
}
