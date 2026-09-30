const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(n);
let mode='expat';
function number(id){const el=$(id),n=Number(el.value);return Number.isFinite(n)&&n>=0&&n<=1e9?n:0;}
function calculate(){
 const ids=mode==='expat'?['afore','housing']:['paid','due'];
 const invalid=ids.some(id=>!$(id).checkValidity()||$(id).value==='');
 const a=number(ids[0]),b=number(ids[1]);
 const total=mode==='expat'?a+b:Math.max(0,a-b);
 $('validation').textContent=invalid?'Introduce importes válidos entre 0 y 1,000,000,000 MXN.':mode==='imss'&&b>a?'Las cuotas recalculadas superan a las pagadas. No aparece un pago en exceso en estas cifras.':'';
 $('amount').textContent=invalid?'—':money(total);
 document.querySelector('.result-decimal').hidden=invalid;
 $('prepare').disabled=invalid;
 $('result-label').textContent=mode==='expat'?'Saldo identificado para análisis':'Diferencia aritmética a revisar';
 $('legend-a').textContent=mode==='expat'?'AFORE':'Pagado';
 $('legend-b').textContent=mode==='expat'?'Vivienda':'Recalculado';
 $('value-a').textContent=money(a);$('value-b').textContent=money(b);
 const percent=mode==='expat'?(total?a/total*100:0):(a?Math.min(total/a*100,100):0);
 $('donut').style.background=total?`conic-gradient(var(--copper) 0% ${percent}%, #52717f ${percent}% 100%)`:'#52717f';
 $('donut-value').textContent=mode==='expat'?(Number(a>0)+Number(b>0)):Math.round(percent)+'%';
 $('donut-label').textContent=mode==='expat'?'subcuentas':'diferencia';
 $('donut').setAttribute('aria-label',mode==='expat'?`Distribución del saldo: AFORE ${Math.round(percent)} por ciento, vivienda ${Math.round(total?b/total*100:0)} por ciento`:`La diferencia equivale al ${Math.round(percent)} por ciento de las cuotas pagadas`);
 $('result-note').textContent=mode==='expat'?'El saldo total no equivale al importe retirable. La procedencia y los conceptos disponibles requieren una revisión individual.':'La diferencia no confirma un derecho a devolución. Deben validarse el recálculo, los conceptos, los periodos y la procedencia del trámite.';
}
function setMode(next){mode=next;['expat','imss'].forEach(m=>{$('tab-'+m).setAttribute('aria-selected',String(m===mode));$('tab-'+m).tabIndex=m===mode?0:-1;$('panel-'+m).hidden=m!==mode;});calculate();}
document.querySelectorAll('[data-tab]').forEach(b=>{b.addEventListener('click',()=>setMode(b.dataset.tab));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'expat':e.key==='End'?'imss':mode==='expat'?'imss':'expat';setMode(next);$('tab-'+next).focus();}});});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.mode);$('simulador').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
['afore','housing','paid','due'].forEach(id=>$(id).addEventListener('input',calculate));
$('prepare').addEventListener('click',()=>{const message=mode==='expat'?`Hola, equipo Estenio. Me gustaría revisar mis opciones respecto a mis recursos en México.\n\nSituación: ${$('residence').value}.\nSaldo AFORE sin vivienda: ${money(number('afore'))} MXN.\nSubcuenta de vivienda: ${money(number('housing'))} MXN.\nTotal para análisis: ${money(number('afore')+number('housing'))} MXN.\n\nEntiendo que estos saldos no equivalen a un importe de recuperación garantizado. Quisiera conocer los siguientes pasos.`:`Hola, equipo Estenio. Me gustaría solicitar una revisión de posibles pagos en demasía al IMSS.\n\nPeriodo: ${$('period').value}.\nCuotas pagadas: ${money(number('paid'))} MXN.\nCuotas recalculadas: ${money(number('due'))} MXN.\nDiferencia a revisar: ${money(Math.max(0,number('paid')-number('due')))} MXN.\n\nEntiendo que la diferencia requiere verificación documental y análisis de procedencia. Quisiera conocer los siguientes pasos.`;$('summary').value=message;$('email-summary').href='mailto:info@estenio.com.mx?subject='+encodeURIComponent(mode==='expat'?'Consulta AFORE e Infonavit — expatriado':'Revisión de pagos en demasía — IMSS')+'&body='+encodeURIComponent(message);$('copy-status').textContent='No se ha enviado ninguna solicitud.';$('consult-dialog').showModal();});
$('close-dialog').addEventListener('click',()=>$('consult-dialog').close());
$('consult-dialog').addEventListener('click',e=>{if(e.target===$('consult-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('copy-summary').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('summary').value);$('copy-status').textContent='Resumen copiado. Puedes pegarlo en tu mensaje.';}catch{$('summary').focus();$('summary').select();$('copy-status').textContent='Selecciona y copia el resumen con tu teclado.';}});
$('menu-toggle').addEventListener('click',()=>{const open=$('nav').classList.toggle('open');$('menu-toggle').setAttribute('aria-expanded',String(open));$('menu-toggle').setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>{$('nav').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');$('menu-toggle').setAttribute('aria-label','Abrir menú');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nav').classList.contains('open')){$('nav').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');$('menu-toggle').focus();}});
calculate();
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 try{Promise.resolve(document.modelContext.registerTool({name:'configure_patrimony_analysis',title:'Configurar análisis patrimonial',description:'Actualiza las cifras visibles del simulador. No determina elegibilidad, no envía información ni inicia un trámite.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['expat','imss']},firstAmount:{type:'number',minimum:0,maximum:1e9},secondAmount:{type:'number',minimum:0,maximum:1e9}},required:['mode','firstAmount','secondAmount'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!['expat','imss'].includes(input.mode)||[input.firstAmount,input.secondAmount].some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>1e9)||Object.keys(input).some(k=>!['mode','firstAmount','secondAmount'].includes(k)))throw new Error('Importes o modo inválidos');const ids=input.mode==='expat'?['afore','housing']:['paid','due'];$(ids[0]).value=String(input.firstAmount);$(ids[1]).value=String(input.secondAmount);setMode(input.mode);return {mode,resultAmount:mode==='expat'?input.firstAmount+input.secondAmount:Math.max(0,input.firstAmount-input.secondAmount),currency:'MXN',eligibilityDetermined:false,informationSent:false};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
