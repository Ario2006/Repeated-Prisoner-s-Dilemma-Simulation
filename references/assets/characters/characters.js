const HAIR={
tuft:'M128 44 Q150 20 176 40 M144 40 Q156 24 170 36 M118 54 Q134 34 150 38',
spiky:'M105 62 L100 28 L125 48 L135 14 L150 44 L170 12 L176 46 L200 24 L195 62',
flat:'M98 70 Q150 28 202 70 M110 55 Q150 40 190 55',
slick:'M95 80 Q100 36 150 34 Q205 36 205 80 M110 55 Q150 44 190 55',
cowlick:'M108 56 Q150 28 192 56 M148 40 Q140 14 164 22 Q150 24 158 38',
neat:'M103 64 Q150 28 197 64 M120 48 Q150 36 180 48'};
const EYES={
open:'<ellipse cx="126" cy="100" rx="5.5" ry="9"/><ellipse cx="174" cy="100" rx="5.5" ry="9"/>',
wide:'<ellipse cx="126" cy="100" rx="7" ry="11"/><ellipse cx="174" cy="100" rx="7" ry="11"/><circle cx="123" cy="96" r="2.2" fill="#fff"/><circle cx="171" cy="96" r="2.2" fill="#fff"/>',
narrow:'<ellipse cx="126" cy="102" rx="6" ry="3.5"/><ellipse cx="174" cy="102" rx="6" ry="3.5"/>',
closed:'<path d="M117 101 Q126 110 135 101 M165 101 Q174 110 183 101" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>'};
const BADGE='<circle cx="122" cy="216" r="13" fill="#fff" stroke="#111" stroke-width="3"/><path d="M115 212 H129 M125 208 L129 212 L125 216 M129 221 H115 M119 217 L115 221 L119 225" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
const PURSE='<path d="M92 282 Q106 264 122 282 Q128 306 107 306 Q86 304 92 282Z" fill="#e0a526" stroke="#111" stroke-width="3.5"/><circle cx="102" cy="270" r="7" fill="#e0a526" stroke="#111" stroke-width="2.5"/><circle cx="114" cy="268" r="7" fill="#e0a526" stroke="#111" stroke-width="2.5"/><text x="107" y="296" font-size="16" font-weight="700" text-anchor="middle">$</text>';
const COIN='<circle cx="210" cy="322" r="13" fill="#e0a526" stroke="#111" stroke-width="3"/><circle cx="210" cy="322" r="7" fill="none" stroke="#111" stroke-width="2"/>';
const BANDAGE='<rect x="76" y="238" width="22" height="9" rx="2" fill="#f5e6c8" stroke="#111" stroke-width="2.5" transform="rotate(-12 87 242)"/>';
const BRUISE='<ellipse cx="94" cy="236" rx="5" ry="4" fill="#8a6fb0"/><ellipse cx="91" cy="258" rx="5" ry="4" fill="#8a6fb0"/>';
const NOTEBOOK='<rect x="68" y="296" width="38" height="48" rx="3" fill="#222" stroke="#111" stroke-width="3"/><path d="M78 308 V326 M85 308 V326 M92 308 V326 M99 308 V326 M75 318 L102 314" stroke="#fff" stroke-width="2.2" fill="none"/>';
const FINGER='<rect x="205" y="312" width="10" height="28" rx="5" fill="#fff" stroke="#111" stroke-width="3"/>';
const CARD='<rect x="212" y="296" width="20" height="28" rx="3" fill="#c8312b" stroke="#111" stroke-width="3"/><text x="222" y="316" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">D</text>';
const GLASSES='<g fill="none" stroke="#111" stroke-width="3.5"><circle cx="126" cy="100" r="16"/><circle cx="174" cy="100" r="16"/><path d="M142 100 H158"/></g>';
const HALO='<ellipse class="float" cx="150" cy="22" rx="36" ry="8" fill="none" stroke="#e0a526" stroke-width="5"/>';

const CHARS=[
{id:'tit-for-tat',name:'TIT FOR TAT',tie:'#e0a526',hair:'tuft',eyes:'open',brows:['M108 88 L138 78','M162 78 L192 88'],mouth:'M120 126 Q152 146 186 122',armL:{anim:'swing'},armR:{a:-125,anim:'wave'},body:BADGE,bob:'bob'},
{id:'always-defect',name:'ALWAYS DEFECT',tie:'#c8312b',hair:'spiky',eyes:'narrow',brows:['M108 86 L138 86','M162 74 Q178 66 192 76'],mouth:'M116 128 Q150 140 192 112',armL:{a:-52},armR:{a:52},body:PURSE,bob:''},
{id:'always-cooperate',name:'ALWAYS COOPERATE',tie:'#4aa3df',hair:'flat',eyes:'wide',brows:['M108 86 L138 76','M162 76 L192 86'],mouth:'M116 122 Q150 158 188 120',armL:{a:38,anim:'swing',prop:BANDAGE},armR:{a:-38,anim:'swing',prop:COIN},bob:'bob'},
{id:'friedman',name:'FRIEDMAN',tie:'#2f7d4a',hair:'slick',eyes:'open',brows:['M106 74 L138 90','M162 90 L194 74'],mouth:'M122 140 Q152 120 182 140',armL:{a:20,prop:NOTEBOOK},armR:{a:-100,anim:'jab',prop:FINGER},bob:''},
{id:'joss',name:'JOSS',tie:'#7a4bb5',hair:'cowlick',eyes:'narrow',brows:['M108 80 L138 88','M162 88 L192 80'],mouth:'M124 132 Q156 142 188 116',armL:{a:125,anim:'wave'},armR:{a:0,behind:true,prop:CARD},bob:'bobFast'},
{id:'tit-for-two-tats',name:'TIT FOR TWO TATS',tie:'#f08a24',hair:'neat',eyes:'closed',brows:null,mouth:'M128 128 Q150 142 172 128',armL:{a:45,anim:'swing',prop:BRUISE},armR:{a:-45,anim:'swing'},head:GLASSES+HALO,bob:'float'}
];

const HEART='<path d="M122 228 C106 216 106 202 116 202 C120 202 122 205 122 208 C122 205 124 202 128 202 C138 202 138 216 122 228Z" fill="#e25555" stroke="#111" stroke-width="3"/>';
const DICE='<rect x="196" y="316" width="28" height="28" rx="5" fill="#fff" stroke="#111" stroke-width="3.5"/><circle cx="204" cy="324" r="2.6" fill="#111"/><circle cx="216" cy="324" r="2.6" fill="#111"/><circle cx="210" cy="330" r="2.6" fill="#111"/><circle cx="204" cy="337" r="2.6" fill="#111"/><circle cx="216" cy="337" r="2.6" fill="#111"/>';
const HAT='<path d="M106 52 L112 6 L188 6 L194 52Z" fill="#222" stroke="#111" stroke-width="4"/><rect x="92" y="48" width="116" height="10" rx="5" fill="#222" stroke="#111" stroke-width="4"/><rect x="108" y="38" width="84" height="8" fill="#e0a526"/>';
const MONOCLE='<circle cx="174" cy="100" r="15" fill="none" stroke="#e0a526" stroke-width="3.5"/><path d="M186 110 Q196 135 188 160" fill="none" stroke="#e0a526" stroke-width="2.5"/>';
CHARS.push(
{id:'generous-tit-for-tat',name:'GENEROUS TFT',tie:'#f2c14e',hair:'tuft',eyes:'open',brows:['M108 88 L138 78','M162 78 L192 88'],mouth:'M120 126 Q152 148 186 122',armL:{anim:'swing'},armR:{a:-125,anim:'wave'},body:HEART,bob:'bob'},
{id:'random',name:'RANDOM',tie:'#8c8c8c',hair:'flat',eyes:'wide',brows:['M108 78 L138 88','M162 74 L192 80'],mouth:'M118 130 Q134 112 150 130 T184 128',armL:{a:30,anim:'swing'},armR:{a:-40,anim:'swing',prop:DICE},bob:'bobFast'},
{id:'banker',name:'THE BANKER',tie:'#b8860b',hair:'neat',eyes:'open',brows:null,mouth:'M126 128 Q152 140 178 128',armL:{anim:'swing'},armR:{a:-30,anim:'swing',prop:COIN},head:HAT+MONOCLE,bob:'bob',npc:true}
);

const CSS=`.bob{animation:bob 2.4s ease-in-out infinite}.bobFast{animation:bob .7s ease-in-out infinite}.float{animation:float 3s ease-in-out infinite}
.swing{animation:swing 2s ease-in-out infinite}.wave{animation:wave .9s ease-in-out infinite}.jab{animation:jab 1s ease-in-out infinite}
.head{transform-origin:150px 165px;animation:tilt 3.4s ease-in-out infinite}.blink{transform-origin:150px 100px;animation:blink 4s infinite}
@keyframes bob{50%{transform:translateY(-6px)}}@keyframes float{50%{transform:translateY(-10px)}}
@keyframes swing{50%{transform:rotate(calc(var(--d)*10deg))}}@keyframes wave{50%{transform:rotate(calc(var(--d)*-22deg))}}
@keyframes jab{50%{transform:rotate(-10deg)}}@keyframes tilt{50%{transform:rotate(-4deg)}}
@keyframes blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}`;

const EXPRESSIONS={
happy:{mouth:'M120 126 Q152 146 186 122',brows:''},
hurt:{mouth:'M122 140 Q152 122 182 140',brows:'M108 88 L138 78 M162 78 L192 88'},
angry:{mouth:'M122 140 Q152 120 182 140',brows:'M106 74 L138 90 M162 90 L194 74'},
smug:{mouth:'M116 128 Q150 140 192 112',brows:'M108 86 L138 86 M162 74 Q178 66 192 76'},
neutral:{mouth:'M126 132 H176',brows:''}};
function setExpression(root,name){const e=EXPRESSIONS[name];if(!e)return;root.querySelector('#mouth').setAttribute('d',e.mouth);root.querySelector('#brows').setAttribute('d',e.brows);}

function makeSVG(c,o){
 o=Object.assign({bg:true,label:true,anim:true},o||{});
 const arm=(s,a)=>{a=a||{};const L=s==='L',sx=L?104:196,hx=L?90:210;
  const d=L?'M104 184 Q84 235 90 282':'M196 184 Q216 235 210 282';
  return `<g id="arm${s}" transform="rotate(${a.a||0} ${sx} 184)"><g class="${o.anim?a.anim||'':''}" style="transform-origin:${sx}px 184px;--d:${L?1:-1}"><path d="${d}" fill="none" stroke="#111" stroke-width="12" stroke-linecap="round"/><ellipse cx="${hx+(L?12:-12)}" cy="290" rx="7" ry="10" fill="#fff" stroke="#111" stroke-width="3.5"/><ellipse cx="${hx}" cy="298" rx="16" ry="19" fill="#fff" stroke="#111" stroke-width="4"/>${a.prop||''}</g></g>`;};
 const A=c.armL||{},B=c.armR||{};
 let hatch='';for(let i=0;i<8;i++)hatch+=`M${58+i*24} 460 l22 -14 `;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 500" width="300" height="500" stroke-linejoin="round" stroke-linecap="round">
<style>${o.anim?CSS:''}</style>
${o.bg?'<rect width="300" height="500" fill="#f0dfb7"/>':''}
<path id="shadow" d="${hatch}" stroke="#e0a526" stroke-width="4" fill="none" opacity=".85"/>
<g id="${c.id}" class="${o.anim?c.bob:''}">
${A.behind?arm('L',A):''}${B.behind?arm('R',B):''}
<g id="legL" style="transform-origin:128px 300px"><path d="M128 300 L120 438" stroke="#111" stroke-width="13" fill="none"/><ellipse cx="110" cy="448" rx="26" ry="11" fill="#fff" stroke="#111" stroke-width="4"/></g>
<g id="legR" style="transform-origin:172px 300px"><path d="M172 300 L182 438" stroke="#111" stroke-width="13" fill="none"/><ellipse cx="194" cy="448" rx="26" ry="11" fill="#fff" stroke="#111" stroke-width="4"/></g>
<g id="torso"><path d="M104 172 L196 172 L202 300 L98 300 Z" fill="#fff" stroke="#111" stroke-width="5"/><path d="M110 190 L107 288 M120 200 L117 282" stroke="#d4d4d4" stroke-width="3" fill="none"/>
<path d="M126 168 L150 190 L124 188Z M174 168 L150 190 L176 188Z" fill="#fff" stroke="#111" stroke-width="3.5"/></g>
<g id="tie"><path d="M143 190 L157 190 L152 203 L148 203Z M148 203 L152 203 L163 258 L150 278 L137 258Z" fill="${c.tie}" stroke="#111" stroke-width="3.5"/><path d="M148 215 L144 250 M154 220 L151 255" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/></g>
<g id="body-prop">${c.body||''}</g>
${A.behind?'':arm('L',A)}${B.behind?'':arm('R',B)}
<g id="head" class="${o.anim?'head':''}"><circle cx="150" cy="100" r="62" fill="#fff" stroke="#111" stroke-width="5"/>
<path d="M92 108 Q96 150 130 158" stroke="#d4d4d4" stroke-width="5" fill="none"/>
<path d="${HAIR[c.hair]}" fill="none" stroke="#111" stroke-width="5"/>
<g id="eyes" class="${o.anim&&c.eyes!=='closed'?'blink':''}" fill="#111">${EYES[c.eyes]}</g>
<path id="brows" d="${c.brows?c.brows[0]+' '+c.brows[1]:''}" stroke="#111" stroke-width="4" fill="none"/>
<path id="mouth" d="${c.mouth}" stroke="#111" stroke-width="4.5" fill="none"/>${c.head||''}</g>
</g>
${o.label?`<text x="150" y="490" text-anchor="middle" font-family="'Segoe Print','Comic Sans MS',cursive" font-size="22" font-weight="700" fill="#111">${c.name}</text>`:''}
</svg>`;}
if(typeof module!=='undefined')module.exports={CHARS,makeSVG,EXPRESSIONS,setExpression};
