// Small SVG charts: one series each, recessive grid, 2px lines, ≥8px markers, tap for values.
import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText, G } from 'react-native-svg';
import { colors, fontFamily, type } from '../theme';

const GRID = '#24272D';
const AXIS_TEXT = colors.textFaint;

/** Monotone cubic path (no overshoot between points). */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  const n = pts.length;
  const dx = pts.slice(1).map((p, i) => p.x - pts[i].x);
  const m = pts.slice(1).map((p, i) => (p.y - pts[i].y) / (dx[i] || 1));
  const t = [m[0], ...m.slice(1).map((v, i) => (v * m[i] <= 0 ? 0 : (v + m[i]) / 2)), m[n - 2]];
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${pts[i].x + h},${pts[i].y + t[i] * h} ${pts[i + 1].x - h},${pts[i + 1].y - t[i + 1] * h} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
}

function niceTicks(min: number, max: number, count = 3) {
  const span = max - min || 1;
  const step = [0.5, 1, 2, 5, 10, 20, 25, 50].find(s => span / s <= count + 1) ?? 100;
  const start = Math.floor(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + step * 0.01; v += step) out.push(+v.toFixed(2));
  return out;
}

function useWidth() {
  const [w, setW] = useState(0);
  return { w, onLayout: (e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width)) };
}

export type LinePoint = { t: number; v: number; label: string };

export function LineChart({ data, height = 190, color = colors.accent, goal, format = (v: number) => String(v), goalLabel }: {
  data: LinePoint[]; height?: number; color?: string; goal?: number; format?: (v: number) => string; goalLabel?: string;
}) {
  const { w, onLayout } = useWidth();
  const [sel, setSel] = useState<number | null>(null);
  const padL = 34, padR = 10, padT = 34, padB = 22;
  const vals = data.map(d => d.v).concat(goal != null ? [goal] : []);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = Math.max(0.6, (hi - lo) * 0.15);
  const ticks = niceTicks(lo - pad, hi + pad);
  const yMin = ticks[0], yMax = ticks[ticks.length - 1];
  const t0 = data[0]?.t ?? 0, t1 = data[data.length - 1]?.t ?? 1;
  const X = (t: number) => padL + (data.length < 2 ? (w - padL - padR) / 2 : ((t - t0) / (t1 - t0 || 1)) * (w - padL - padR));
  const Y = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin || 1)) * (height - padT - padB);
  const pts = data.map(d => ({ x: X(d.t), y: Y(d.v) }));
  const active = sel ?? data.length - 1;

  return (
    <View onLayout={onLayout} style={{ height }}>
      {w > 0 && data.length ? (
        <Svg width={w} height={height}>
          {ticks.map(v => (
            <G key={v}>
              <Line x1={padL} x2={w - padR} y1={Y(v)} y2={Y(v)} stroke={GRID} strokeWidth={1} />
              <SvgText x={padL - 8} y={Y(v) + 4} fill={AXIS_TEXT} fontSize={11} fontFamily={fontFamily} textAnchor="end">{format(v)}</SvgText>
            </G>
          ))}
          {goal != null ? (
            <G>
              <Line x1={padL} x2={w - padR} y1={Y(goal)} y2={Y(goal)} stroke={colors.textDim} strokeWidth={1.5} strokeDasharray="5 5" />
              <SvgText x={w - padR} y={Y(goal) - 6} fill={colors.textDim} fontSize={11} fontFamily={fontFamily} textAnchor="end">{goalLabel ?? 'Goal'}</SvgText>
            </G>
          ) : null}
          <Path d={smoothPath(pts)} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          {active != null && pts[active] ? <Line x1={pts[active].x} x2={pts[active].x} y1={padT - 6} y2={height - padB} stroke={colors.stroke} strokeWidth={1} /> : null}
          {pts.map((p, i) => (
            <G key={i}>
              <Circle cx={p.x} cy={p.y} r={i === active ? 6 : 4} fill={i === active ? color : colors.card} stroke={color} strokeWidth={2} />
              <Rect x={p.x - 16} y={0} width={32} height={height} fill="transparent" onPress={() => setSel(i)} onPressIn={() => setSel(i)} />
            </G>
          ))}
          {data.length ? <SvgText x={padL} y={height - 4} fill={AXIS_TEXT} fontSize={11} fontFamily={fontFamily}>{data[0].label}</SvgText> : null}
          {data.length > 1 ? <SvgText x={w - padR} y={height - 4} fill={AXIS_TEXT} fontSize={11} fontFamily={fontFamily} textAnchor="end">{data[data.length - 1].label}</SvgText> : null}
          {pts[active] ? (() => {
            const p = pts[active], txt = `${format(data[active].v)} · ${data[active].label}`;
            const bw = txt.length * 6.6 + 18, bx = Math.min(Math.max(p.x - bw / 2, padL), w - padR - bw);
            return (
              <G>
                <Rect x={bx} y={2} width={bw} height={24} rx={12} fill={colors.cardRaised} stroke={colors.stroke} />
                <SvgText x={bx + bw / 2} y={18} fill={colors.text} fontSize={12} fontWeight="700" fontFamily={fontFamily} textAnchor="middle">{txt}</SvgText>
              </G>
            );
          })() : null}
        </Svg>
      ) : null}
    </View>
  );
}

export type Bar = { label: string; value: number; sub?: string };

/** Single-series bar chart. Tap a bar to see its value (the latest is selected by default). */
export function BarChart({ data, height = 150, color = colors.accent, goal, max, format = (v: number) => String(v) }: {
  data: Bar[]; height?: number; color?: string; goal?: number; max?: number; format?: (v: number) => string;
}) {
  const { w, onLayout } = useWidth();
  const [sel, setSel] = useState<number | null>(null);
  const padT = 30, padB = 22;
  const top = Math.max(max ?? 0, goal ?? 0, ...data.map(d => d.value), 1);
  const slot = data.length ? w / data.length : 0;
  const bw = Math.min(26, slot * 0.56);
  const H = height - padT - padB;
  const Y = (v: number) => padT + H - (v / top) * H;
  const active = sel ?? data.length - 1;
  return (
    <View onLayout={onLayout} style={{ height }}>
      {w > 0 ? (
        <Svg width={w} height={height}>
          <Line x1={0} x2={w} y1={padT + H} y2={padT + H} stroke={GRID} strokeWidth={1} />
          {goal != null ? <Line x1={0} x2={w} y1={Y(goal)} y2={Y(goal)} stroke={colors.textDim} strokeWidth={1.5} strokeDasharray="5 5" /> : null}
          {data.map((d, i) => {
            const cx = slot * i + slot / 2;
            const h = Math.max(d.value > 0 ? 4 : 0, (d.value / top) * H);
            const on = i === active;
            return (
              <G key={i}>
                {h > 0 ? <Path d={`M${cx - bw / 2},${padT + H} V${padT + H - h + 4} Q${cx - bw / 2},${padT + H - h} ${cx - bw / 2 + 4},${padT + H - h} H${cx + bw / 2 - 4} Q${cx + bw / 2},${padT + H - h} ${cx + bw / 2},${padT + H - h + 4} V${padT + H} Z`} fill={color} opacity={on ? 1 : 0.8} />
                  : <Rect x={cx - bw / 2} y={padT + H - 2} width={bw} height={2} rx={1} fill={colors.stroke} />}
                <SvgText x={cx} y={height - 5} fill={on ? colors.text : AXIS_TEXT} fontSize={10.5} fontFamily={fontFamily} textAnchor="middle">{d.label}</SvgText>
                {on ? <SvgText x={cx} y={padT + H - h - 8} fill={colors.text} fontSize={12.5} fontWeight="700" fontFamily={fontFamily} textAnchor="middle">{format(d.value)}</SvgText> : null}
                <Rect x={slot * i} y={0} width={slot} height={height} fill="transparent" onPress={() => setSel(i)} onPressIn={() => setSel(i)} />
              </G>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

export function ChartLegendNote({ children }: { children: string }) {
  return <Text style={[type.small, { fontSize: 12, marginTop: 6 }]}>{children}</Text>;
}

export function TapHint() {
  return <Pressable disabled><Text style={[type.small, { fontSize: 11, color: colors.textFaint }]}>Tap a point for details</Text></Pressable>;
}
