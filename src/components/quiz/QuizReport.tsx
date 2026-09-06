import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Mail, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import type { TestResult } from '../../types/test';
import { SCALES } from '../../data/testData';
import { getLevelColor, getLevelLabel } from '../../utils/calculations';
import { GlowButton } from '../GlowButton';
import { ApplicationModal } from '../ApplicationForm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface QuizReportProps {
  result: TestResult;
  onSave: (email: string) => void;
}

export function QuizReport({ result, onSave }: QuizReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const printableRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [expandedScales, setExpandedScales] = useState<Set<string>>(new Set());

  const toggleScale = (scale: string) => {
    setExpandedScales((prev) => {
      const next = new Set(prev);
      if (next.has(scale)) {
        next.delete(scale);
      } else {
        next.add(scale);
      }
      return next;
    });
  };

  const capturePrintable = async () => {
    if (!printableRef.current) return null;
    return html2canvas(printableRef.current, {
      backgroundColor: '#FFFFFF',
      scale: 2,
      useCORS: true,
      logging: false,
    });
  };

  const downloadAsImage = async () => {
    setIsSaving(true);
    try {
      const canvas = await capturePrintable();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `result-${result.profile.key}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error saving image:', error);
    }
    setIsSaving(false);
  };

  const downloadAsPDF = async () => {
    setIsSaving(true);
    try {
      const canvas = await capturePrintable();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`result-${result.profile.key}.pdf`);
    } catch (error) {
      console.error('Error saving PDF:', error);
    }
    setIsSaving(false);
  };

  const handleEmailSave = () => {
    if (email) {
      onSave(email);
      setShowEmailInput(false);
    }
  };

  // ─── Radar chart helpers ───
  const radarSize = 360;
  const center = radarSize / 2;
  const radius = radarSize * 0.32;
  const angleStep = (2 * Math.PI) / 7;

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const radarPoints = result.scaleResults.map((r, i) => getPoint(i, r.percentage));
  const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // ─── Printable radar helpers (larger) ───
  const pRadarSize = 640;
  const pCenter = pRadarSize / 2;
  const pRadius = pRadarSize * 0.32;

  const pGetPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * pRadius;
    return {
      x: pCenter + r * Math.cos(angle),
      y: pCenter + r * Math.sin(angle),
    };
  };

  const pRadarPoints = result.scaleResults.map((r, i) => pGetPoint(i, r.percentage));
  const pRadarPath = pRadarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const scaleData = result.scaleResults.map((sr) => ({
    ...sr,
    scaleInfo: SCALES.find((s) => s.key === sr.scale)!,
  }));

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          MAIN REPORT (dark theme, on-site view)
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16"
      >
        <div ref={reportRef}>
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <span className="inline-block px-4 py-1.5 mb-4 text-xs font-medium text-accent bg-accent/10 rounded-full border border-accent/20">
                Ваш результат
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4"
            >
              {result.profile.name}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-3 bg-bg-card rounded-2xl px-6 py-4 border border-border"
            >
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-accent">{result.overallIndex}%</div>
                <div className="text-xs text-text-secondary mt-1">Индекс присвоенности</div>
              </div>
            </motion.div>
          </div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mb-10"
          >
            <div className="relative" style={{ padding: '30px' }}>
              <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`} style={{ overflow: 'visible' }}>
                {/* Grid */}
                {[0.25, 0.5, 0.75, 1].map((level) => (
                  <polygon
                    key={level}
                    points={Array.from({ length: 7 }, (_, i) => {
                      const p = getPoint(i, level * 100);
                      return `${p.x},${p.y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#2A2A2A"
                    strokeWidth="1"
                  />
                ))}
                {/* Axes */}
                {Array.from({ length: 7 }, (_, i) => {
                  const p = getPoint(i, 100);
                  return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#2A2A2A" strokeWidth="1" />;
                })}
                {/* Data area */}
                <path d={radarPath} fill="rgba(255, 214, 0, 0.15)" stroke="#FFD600" strokeWidth="2.5" />
                {/* Points */}
                {radarPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="5" fill="#FFD600" stroke="#0A0A0A" strokeWidth="1.5" />
                ))}
                {/* Labels as SVG text for crisp rendering */}
                {SCALES.map((scale, i) => {
                  const angle = i * angleStep - Math.PI / 2;
                  const labelRadius = radius + 52;
                  const x = center + labelRadius * Math.cos(angle);
                  const y = center + labelRadius * Math.sin(angle);
                  const isBottom = angle > Math.PI / 4 && angle < (3 * Math.PI) / 4;
                  return (
                    <text
                      key={scale.key}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#9CA3AF"
                      fontSize="11"
                      fontWeight="500"
                      transform={isBottom ? `rotate(-35, ${x}, ${y})` : undefined}
                    >
                      {scale.name}
                    </text>
                  );
                })}
              </svg>
            </div>
          </motion.div>

          {/* Scale bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-bg-card rounded-2xl border border-border overflow-hidden mb-10"
          >
            <div className="p-4 sm:p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-white">Результаты по шкалам</h3>
            </div>
            <div className="divide-y divide-border">
              {scaleData.map((item) => {
                const isExpanded = expandedScales.has(item.scale);
                return (
                  <div key={item.scale}>
                    <button
                      onClick={() => toggleScale(item.scale)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getLevelColor(item.level) }}
                          />
                          <span className="text-white font-medium text-sm sm:text-base">{item.scaleInfo.name}</span>
                          <span className="text-text-muted text-xs hidden sm:inline">{item.scaleInfo.description}</span>
                        </div>
                        {/* Visual bar */}
                        <div className="h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: getLevelColor(item.level),
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right min-w-[4rem]">
                          <div className="text-white font-bold">{item.percentage}%</div>
                          <div className="text-xs" style={{ color: getLevelColor(item.level) }}>
                            {getLevelLabel(item.level)}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-text-muted flex-shrink-0" />
                        ) : (
                          <ChevronDown size={18} className="text-text-muted flex-shrink-0" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="px-4 sm:px-6 pb-4 bg-bg-secondary/30"
                      >
                        <p className="text-text-secondary text-sm leading-relaxed">
                          {item.level === 'expressed' && 'Высокий результат: ' + item.scaleInfo.description}
                          {item.level === 'forming' && 'Средний результат: ' + item.scaleInfo.description}
                          {item.level === 'unstable' && 'Низкий результат: ' + item.scaleInfo.description}
                          {item.level === 'tension' && 'Низкий результат: ' + item.scaleInfo.description}
                        </p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Profile description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-bg-card rounded-2xl border border-border p-6 sm:p-8 mb-10"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Описание профиля</h3>
            <div className="space-y-4 text-text-secondary leading-relaxed whitespace-pre-line">
              {result.profile.fullFeedback}
            </div>
            <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent/20">
              <div className="text-sm text-accent font-medium mb-1">Главный стратегический вопрос</div>
              <div className="text-white text-base italic">{result.mainStrategicQuestion}</div>
            </div>
          </motion.div>

          {/* Strong supports & Tensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-bg-card rounded-2xl border border-border p-5"
            >
              <h4 className="text-sm font-medium text-success mb-3">Сильные опоры</h4>
              {result.strongSupports.map((support) => {
                const name = SCALES.find((s) => s.key === support.scale)?.name;
                return (
                  <div key={support.scale} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm">{name}</span>
                      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full bg-success"
                          style={{ width: `${support.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-success font-bold text-sm flex-shrink-0">{support.percentage}%</span>
                  </div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-bg-card rounded-2xl border border-border p-5"
            >
              <h4 className="text-sm font-medium text-danger mb-3">Зоны напряжения</h4>
              {result.tensionZones.map((zone) => {
                const name = SCALES.find((s) => s.key === zone.scale)?.name;
                return (
                  <div key={zone.scale} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm">{name}</span>
                      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full bg-danger"
                          style={{ width: `${zone.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-danger font-bold text-sm flex-shrink-0">{zone.percentage}%</span>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="relative overflow-hidden bg-bg-card rounded-2xl border border-accent/20 p-6 sm:p-8 mb-10"
        >
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Что дальше?</h3>
          <p className="text-text-secondary leading-relaxed mb-3">
            Ваш профиль — это карта: сильные опоры, на которые можно опереться, и зоны напряжения, которые забирают энергию.
          </p>
          <p className="text-text-secondary leading-relaxed mb-6">
            Программа «Личная стратегия развития» превращает эту карту в маршрут: 5 индивидуальных сессий, на которых мы соберём вашу стратегию из ценностей, сильных сторон и образа будущего.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/programs/life-strategy" className="flex-1">
              <GlowButton variant="outline" className="w-full">
                Подробнее о программе
                <ArrowRight size={18} />
              </GlowButton>
            </Link>
            <div className="flex-1">
              <GlowButton onClick={() => setIsApplicationOpen(true)} variant="primary" className="w-full">
                Подать заявку
              </GlowButton>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={downloadAsImage}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-3 bg-bg-card border border-border text-white rounded-lg hover:bg-bg-secondary transition-colors text-sm"
            >
              <Download size={16} />
              Сохранить как PNG
            </button>
            <button
              onClick={downloadAsPDF}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-3 bg-bg-card border border-border text-white rounded-lg hover:bg-bg-secondary transition-colors text-sm"
            >
              <Download size={16} />
              Сохранить как PDF
            </button>
            <button
              onClick={() => setShowEmailInput(!showEmailInput)}
              className="flex items-center gap-2 px-5 py-3 bg-bg-card border border-border text-white rounded-lg hover:bg-bg-secondary transition-colors text-sm"
            >
              <Mail size={16} />
              Отправить на email
            </button>
          </div>

          {showEmailInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-3 justify-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="px-4 py-3 bg-bg-card border border-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-accent w-64"
              />
              <button
                onClick={handleEmailSave}
                className="px-5 py-3 bg-accent text-bg-primary font-medium rounded-lg hover:bg-accent-hover transition-colors"
              >
                Отправить
              </button>
            </motion.div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors text-sm"
            >
              <Share2 size={16} />
              Пройти тест заново
            </button>
          </div>
        </motion.div>

        <ApplicationModal
          isOpen={isApplicationOpen}
          onClose={() => setIsApplicationOpen(false)}
          program="life-strategy"
        />
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          PRINTABLE VERSION (light theme, hidden, used for export)
         ═══════════════════════════════════════════════════════════════ */}
      <div
        ref={printableRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          background: '#FFFFFF',
          color: '#1a1a1a',
          fontFamily: "'Inter', system-ui, sans-serif",
          padding: '48px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#B8860B',
              background: '#FFF8E1',
              borderRadius: '999px',
              border: '1px solid #FFE082',
              marginBottom: '16px',
            }}
          >
            Ваш результат
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111', margin: '0 0 16px' }}>
            {result.profile.name}
          </h1>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: '#F5F5F5',
              borderRadius: '16px',
              padding: '16px 28px',
              border: '1px solid #E0E0E0',
            }}
          >
            <div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#B8860B' }}>{result.overallIndex}%</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Индекс присвоенности</div>
            </div>
          </div>
        </div>

        {/* Radar Chart - larger, light theme */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px', padding: '30px' }}>
          <svg width={pRadarSize} height={pRadarSize} viewBox={`0 0 ${pRadarSize} ${pRadarSize}`} style={{ overflow: 'visible' }}>
            {/* Grid */}
            {[0.25, 0.5, 0.75, 1].map((level) => (
              <polygon
                key={level}
                points={Array.from({ length: 7 }, (_, i) => {
                  const p = pGetPoint(i, level * 100);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="#E0E0E0"
                strokeWidth="1"
              />
            ))}
            {/* Axes */}
            {Array.from({ length: 7 }, (_, i) => {
              const p = pGetPoint(i, 100);
              return <line key={i} x1={pCenter} y1={pCenter} x2={p.x} y2={p.y} stroke="#E0E0E0" strokeWidth="1" />;
            })}
            {/* Data area */}
            <path d={pRadarPath} fill="rgba(184, 134, 11, 0.12)" stroke="#B8860B" strokeWidth="2.5" />
            {/* Points */}
            {pRadarPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="5" fill="#B8860B" stroke="#FFFFFF" strokeWidth="2" />
            ))}
            {/* Labels */}
            {SCALES.map((scale, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const labelRadius = pRadius + 80;
              const x = pCenter + labelRadius * Math.cos(angle);
              const y = pCenter + labelRadius * Math.sin(angle);
              const isBottom = angle > Math.PI / 4 && angle < (3 * Math.PI) / 4;
              return (
                <text
                  key={scale.key}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#444"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="'Inter', sans-serif"
                  transform={isBottom ? `rotate(-30, ${x}, ${y})` : undefined}
                >
                  {scale.name}
                </text>
              );
            })}
            {/* Percentage labels near points */}
            {pRadarPoints.map((p, i) => {
              const pct = result.scaleResults[i].percentage;
              return (
                <text
                  key={`pct-${i}`}
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  fill="#B8860B"
                  fontSize="11"
                  fontWeight="700"
                >
                  {pct}%
                </text>
              );
            })}
          </svg>
        </div>

        {/* Scale bars - light theme */}
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '20px' }}>
            Результаты по шкалам
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {scaleData.map((item) => (
              <div key={item.scale}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: getLevelColor(item.level),
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#222' }}>{item.scaleInfo.name}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{item.scaleInfo.description}</span>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#222' }}>{item.percentage}%</span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        color: getLevelColor(item.level),
                        fontWeight: 500,
                      }}
                    >
                      {getLevelLabel(item.level)}
                    </span>
                  </div>
                </div>
                <div style={{ height: '10px', background: '#EEEEEE', borderRadius: '5px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '5px',
                      width: `${item.percentage}%`,
                      backgroundColor: getLevelColor(item.level),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile description */}
        <div style={{ marginBottom: '36px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111', marginBottom: '16px' }}>Описание профиля</h3>
          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.7',
              color: '#333',
              whiteSpace: 'pre-line',
            }}
          >
            {result.profile.fullFeedback}
          </div>
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              background: '#FFF8E1',
              borderRadius: '12px',
              border: '1px solid #FFE082',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#B8860B', marginBottom: '6px' }}>
              Главный стратегический вопрос
            </div>
            <div style={{ fontSize: '15px', color: '#222', fontStyle: 'italic' }}>
              {result.mainStrategicQuestion}
            </div>
          </div>
        </div>

        {/* Strong supports & Tensions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '36px' }}>
          <div style={{ background: '#F8FFF8', borderRadius: '12px', padding: '20px', border: '1px solid #C8E6C9' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#2E7D32', marginBottom: '12px' }}>Сильные опоры</h4>
            {result.strongSupports.map((support) => {
              const name = SCALES.find((s) => s.key === support.scale)?.name;
              return (
                <div key={support.scale} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#222' }}>{name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#2E7D32' }}>{support.percentage}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#E8F5E9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{ height: '100%', borderRadius: '3px', width: `${support.percentage}%`, background: '#4CAF50' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: '#FFF5F5', borderRadius: '12px', padding: '20px', border: '1px solid #FFCDD2' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#C62828', marginBottom: '12px' }}>Зоны напряжения</h4>
            {result.tensionZones.map((zone) => {
              const name = SCALES.find((s) => s.key === zone.scale)?.name;
              return (
                <div key={zone.scale} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#222' }}>{name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#C62828' }}>{zone.percentage}%</span>
                  </div>
                  <div style={{ height: '6px', background: '#FFEBEE', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{ height: '100%', borderRadius: '3px', width: `${zone.percentage}%`, background: '#EF5350' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #E0E0E0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>
            Гузель Газиз — Executive Coach
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            ICF Certified. Программа «Личная стратегия развития»
          </div>
          <div style={{ fontSize: '12px', color: '#B8860B', marginTop: '8px' }}>
            https://guzel-gaziz-coach.vercel.app
          </div>
        </div>
      </div>
    </>
  );
}
