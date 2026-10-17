// Illustrative training-volume heatmap. Not a medical or anatomical assessment.
const front=[
 ['Hombros','M105 48 Q83 42 72 70 L83 87 L108 70 Z M135 48 Q157 42 168 70 L157 87 L132 70 Z'],
 ['Pecho','M110 67 L120 78 L120 114 L86 105 L84 84 Z M130 67 L120 78 L120 114 L154 105 L156 84 Z'],
 ['Bíceps','M73 74 L84 91 L75 129 L61 121 Z M167 74 L156 91 L165 129 L179 121 Z'],
 ['Core','M88 114 L120 120 L152 114 L145 168 L95 168 Z'],
 ['Cuádriceps','M96 179 L118 181 L116 256 L91 256 Z M122 181 L144 179 L149 256 L124 256 Z'],
 ['Gemelos','M91 263 L115 263 L111 329 L94 329 Z M125 263 L149 263 L146 329 L129 329 Z']
];
const back=[
 ['Hombros','M105 48 L72 70 L84 89 L111 72 Z M135 48 L168 70 L156 89 L129 72 Z'],
 ['Espalda','M112 76 L120 90 L128 76 L155 98 L143 166 L97 166 L85 98 Z'],
 ['Tríceps','M70 90 L82 101 L74 137 L61 126 Z M170 90 L158 101 L166 137 L179 126 Z'],
 ['Glúteos','M96 170 L119 170 L119 200 L95 206 Z M121 170 L144 170 L145 206 L121 200 Z'],
 ['Isquiotibiales','M96 209 L118 204 L115 258 L91 258 Z M122 204 L144 209 L149 258 L125 258 Z'],
 ['Gemelos','M91 263 L115 263 L111 329 L94 329 Z M125 263 L149 263 L146 329 L129 329 Z']
];
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function intensity(sets,max){
 if(!Number.isFinite(sets)||sets<=0)return 0;
 return Math.min(4,Math.max(1,Math.ceil(sets/Math.max(1,max)*4)));
}
export function bodyMapSvg(counts={},view='front'){
 const parts=view==='back'?back:front;
 const max=Math.max(1,...Object.values(counts).map(v=>Number(v)||0));
 const regions=parts.map(([muscle,paths])=>{
  const count=Number(counts[muscle])||0,level=intensity(count,max);
  return `<path d="${paths}" class="gym-body-region gym-body-level-${level}" data-muscle="${escapeHtml(muscle)}" tabindex="0" role="img" aria-label="${escapeHtml(muscle)}: ${count} series" ><title>${escapeHtml(muscle)}: ${count} series</title></path>`;
 }).join('');
 return `<svg viewBox="40 0 160 350" class="gym-body-svg" role="group" aria-label="Mapa ilustrativo ${view==='front'?'frontal':'posterior'} de series semanales"><path d="M108 11 Q120 0 132 11 L133 35 L126 47 L127 58 L145 52 Q170 50 177 68 L190 121 L178 148 L163 143 L166 170 L151 185 L154 259 L149 334 L126 334 L120 258 L114 334 L91 334 L86 259 L89 185 L74 170 L77 143 L62 148 L50 121 L63 68 Q70 50 95 52 L113 58 L114 47 L107 35 Z" fill="var(--card2,#1b1e35)" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/>${regions}</svg>`;
}
export function bodyMapExplanation(counts={}){
 const total=Object.values(counts).reduce((a,b)=>a+(Number(b)||0),0);
 return total===0?'Aún no hay series registradas esta semana. El mapa se irá iluminando con tus sesiones completadas.':'La intensidad refleja la cantidad relativa de series por músculo esta semana. No mide tamaño muscular, simetría izquierda/derecha ni recuperación.';
}
