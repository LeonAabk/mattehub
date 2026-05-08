// --- HJELPEFUNKSJONER ---
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const formatNumber = (num) => Number.isInteger(num) ? num : parseFloat(num.toFixed(4));

// Dynamiske HTML-hjelpere for renere kode i arrayet
const ig = (lbl, id, placeholder="", val="") => `<div class="input-group"><label>${lbl}</label><input type="text" id="${id}" placeholder="${placeholder}" value="${val}"></div>`;
const igN = (lbl, id, val="") => `<div class="input-group"><label>${lbl}</label><input type="number" id="${id}" value="${val}"></div>`;

// Sandkasse for evaluering av matematikk i Hurtig-grafen
const safeEval = (expr, x) => {
    try {
        // Legger til vanlige math-funksjoner for å gjøre det enklere for brukeren (slipper "Math.sin")
        const safeExpr = expr.replace(/sin|cos|tan|sqrt|log|exp|abs|PI/g, match => `Math.${match}`);
        const fn = new Function('x', `return ${safeExpr};`);
        const res = fn(x);
        return isNaN(res) || !isFinite(res) ? null : res;
    } catch (e) { return null; }
};

// --- KJERNE-DATA: 61 Kalkulatorer ---
const calculators = [
    // --- GRUNNLEGGENDE ---
    { id: 1, folder: "Grunnleggende", name: "Prosent", emoji: "➕", formula: "(p/100)*tall", html: igN('Prosent (%)','i_1_1')+igN('Av tall','i_1_2'), calc: async () => { const p = parseFloat(document.getElementById('i_1_1').value); const t = parseFloat(document.getElementById('i_1_2').value); return { res: formatNumber((p/100)*t), exp: `(${p}/100) * ${t}` }; } },
    { id: 2, folder: "Grunnleggende", name: "Deling", emoji: "➗", formula: "a / b", html: igN('a (Teller)','i_2_1')+igN('b (Nevner)','i_2_2'), calc: async () => { const a = parseFloat(document.getElementById('i_2_1').value); const b = parseFloat(document.getElementById('i_2_2').value); return b===0 ? {res:"Feil", exp:"Kan ikke dele på null", error:true} : { res: formatNumber(a/b), exp: `${a} / ${b}` }; } },
    { id: 3, folder: "Grunnleggende", name: "Gange", emoji: "✖️", formula: "a * b", html: igN('a','i_3_1')+igN('b','i_3_2'), calc: async () => { const a = parseFloat(document.getElementById('i_3_1').value); const b = parseFloat(document.getElementById('i_3_2').value); return { res: formatNumber(a*b), exp: `${a} * ${b}` }; } },
    { id: 4, folder: "Grunnleggende", name: "Gange (Flere)", emoji: "🔢", formula: "a*b*c...", html: ig('Tall (komma-separert)','i_4_1','eks: 2,4,5'), calc: async () => { const valStr = document.getElementById('i_4_1').value; if(!valStr) return {res:"Mangler data", error:true}; const vals = valStr.split(',').map(Number); return { res: formatNumber(vals.reduce((a,b)=>a*b,1)), exp: `Ganger alle verdier: ${vals.join(' * ')}` }; } },
    { id: 5, folder: "Grunnleggende", name: "Potens", emoji: "⬆️", formula: "a^b", html: igN('Grunntall (a)','i_5_1')+igN('Eksponent (b)','i_5_2'), calc: async () => { const a = parseFloat(document.getElementById('i_5_1').value); const b = parseFloat(document.getElementById('i_5_2').value); return { res: formatNumber(Math.pow(a,b)), exp: `${a} opphøyd i ${b}` }; } },
    { id: 6, folder: "Grunnleggende", name: "Kvadratrot", emoji: "√", formula: "√x", html: igN('x','i_6_1'), calc: async () => { const x = parseFloat(document.getElementById('i_6_1').value); return x<0 ? {res:"Feil", exp:"Ingen reell rot for negative tall", error:true} : { res: formatNumber(Math.sqrt(x)), exp: `Kvadratroten av ${x}` }; } },

    // --- ALGEBRA ---
    { id: 7, folder: "Algebra", name: "Lineær funksjon", emoji: "📏", formula: "y = ax + b", html: igN('x1','i_7_1')+igN('y1','i_7_2')+igN('x2','i_7_3')+igN('y2','i_7_4'), calc: async () => { const x1=parseFloat(document.getElementById('i_7_1').value), y1=parseFloat(document.getElementById('i_7_2').value), x2=parseFloat(document.getElementById('i_7_3').value), y2=parseFloat(document.getElementById('i_7_4').value); const a=(y2-y1)/(x2-x1); const b=y1-a*x1; return {res:`y = ${a.toFixed(2)}x + ${b.toFixed(2)}`, exp:`a = (y2-y1)/(x2-x1) = ${a}\nb = y1-ax1 = ${b}`, graph: (x)=>a*x+b}; } },
    { id: 8, folder: "Algebra", name: "ABC-formelen", emoji: "x²", formula: "ax² + bx + c = 0", html: igN('a','i_8_1','1')+igN('b','i_8_2','2')+igN('c','i_8_3','-3'), calc: async () => { const a=parseFloat(document.getElementById('i_8_1').value), b=parseFloat(document.getElementById('i_8_2').value), c=parseFloat(document.getElementById('i_8_3').value); const d=b*b-4*a*c; if(d<0) return {res:"Ingen reelle løsninger", exp:`Diskriminanten er ${d} (negativ).`, error:true}; const x1=(-b+Math.sqrt(d))/(2*a), x2=(-b-Math.sqrt(d))/(2*a); return {res:`x1 = ${x1.toFixed(2)}, x2 = ${x2.toFixed(2)}`, exp:`d = ${b}² - 4*${a}*${c} = ${d}\nx = (-${b} ± √${d}) / (2*${a})`, graph: (x)=>a*x*x+b*x+c}; } },
    { id: 9, folder: "Algebra", name: "Topp/Bunnpunkt", emoji: "📍", formula: "x = -b / 2a", html: igN('a','i_9_1')+igN('b','i_9_2')+igN('c','i_9_3'), calc: async () => { const a=parseFloat(document.getElementById('i_9_1').value), b=parseFloat(document.getElementById('i_9_2').value), c=parseFloat(document.getElementById('i_9_3').value); const x=-b/(2*a); const y=a*x*x+b*x+c; return {res:`(${x.toFixed(2)}, ${y.toFixed(2)})`, exp:`x = -${b} / (2*${a})\nSettes inn i funksjonen for å finne y.`, graph: (v)=>a*v*v+b*v+c}; } },
    { id: 10, folder: "Algebra", name: "Nullpunkt (Lineær)", emoji: "0️⃣", formula: "ax + b = 0", html: igN('a','i_10_1')+igN('b','i_10_2'), calc: async () => { const a=parseFloat(document.getElementById('i_10_1').value), b=parseFloat(document.getElementById('i_10_2').value); return {res:`x = ${(-b/a).toFixed(2)}`, exp:`Flytter b over og deler på a.`, graph: (x)=>a*x+b}; } },
    { id: 11, folder: "Algebra", name: "Momentan vekstfart", emoji: "⚡", formula: "f'(x) = 2ax + b", html: igN('a (for x²)','i_11_1')+igN('b (for x)','i_11_2')+igN('x-verdi','i_11_3'), calc: async () => { const a=parseFloat(document.getElementById('i_11_1').value), b=parseFloat(document.getElementById('i_11_2').value), x=parseFloat(document.getElementById('i_11_3').value); return {res:`${2*a*x + b}`, exp:`Deriverer til 2ax + b. Setter inn x=${x}.`}; } },
    { id: 12, folder: "Algebra", name: "Gj.snittlig vekstfart", emoji: "📉", formula: "Δy / Δx", html: igN('x1','i_12_1')+igN('y1','i_12_2')+igN('x2','i_12_3')+igN('y2','i_12_4'), calc: async () => { const x1=parseFloat(document.getElementById('i_12_1').value), y1=parseFloat(document.getElementById('i_12_2').value), x2=parseFloat(document.getElementById('i_12_3').value), y2=parseFloat(document.getElementById('i_12_4').value); return {res:`${((y2-y1)/(x2-x1)).toFixed(2)}`, exp:`Endring i y delt på endring i x.`}; } },
    { id: 13, folder: "Algebra", name: "Eksponentiell", emoji: "📈", formula: "y = a * b^x", html: igN('Startverdi a','i_13_1')+igN('Vekstfaktor b','i_13_2')+igN('Tid x','i_13_3'), calc: async () => { const a=parseFloat(document.getElementById('i_13_1').value), b=parseFloat(document.getElementById('i_13_2').value), x=parseFloat(document.getElementById('i_13_3').value); return {res:`${(a*Math.pow(b,x)).toFixed(2)}`, exp:`${a} * ${b}^${x}`, graph: (v)=>a*Math.pow(b,v)}; } },
    { id: 14, folder: "Algebra", name: "Asymptoter", emoji: "➰", formula: "(ax+b)/(cx+d)", html: igN('a','i_14_1')+igN('b','i_14_2')+igN('c','i_14_3')+igN('d','i_14_4'), calc: async () => { const a=parseFloat(document.getElementById('i_14_1').value), b=parseFloat(document.getElementById('i_14_2').value), c=parseFloat(document.getElementById('i_14_3').value), d=parseFloat(document.getElementById('i_14_4').value); return {res:`Vertikal: x=${(-d/c).toFixed(2)}, Horisontal: y=${(a/c).toFixed(2)}`, exp:`Nevner = 0 gir vertikal. Ledende ledd gir horisontal.`, graph: (x)=>(a*x+b)/(c*x+d)}; } },
    { id: 15, folder: "Algebra", name: "Rasjonal ligning", emoji: "🟰", formula: "(ax+b)/(cx+d) = k", html: igN('a','i_15_1')+igN('b','i_15_2')+igN('c','i_15_3')+igN('d','i_15_4')+igN('k','i_15_5'), calc: async () => { const a=parseFloat(document.getElementById('i_15_1').value), b=parseFloat(document.getElementById('i_15_2').value), c=parseFloat(document.getElementById('i_15_3').value), d=parseFloat(document.getElementById('i_15_4').value), k=parseFloat(document.getElementById('i_15_5').value); return {res:`x = ${((k*d-b)/(a-k*c)).toFixed(2)}`, exp:`Kryssmultipliserer og løser for x.`}; } },
    { id: 16, folder: "Algebra", name: "Symmetrilinje", emoji: "🪞", formula: "x = -b / 2a", html: igN('a','i_16_1')+igN('b','i_16_2'), calc: async () => { const a=parseFloat(document.getElementById('i_16_1').value), b=parseFloat(document.getElementById('i_16_2').value); return {res:`x = ${(-b/(2*a)).toFixed(2)}`, exp:`Gjennomsnittet av nullpunktene.`}; } },
    { id: 17, folder: "Algebra", name: "Faktorisering (2.grad)", emoji: "✂️", formula: "a(x-x1)(x-x2)", html: igN('a','i_17_1')+igN('b','i_17_2')+igN('c','i_17_3'), calc: async () => { const a=parseFloat(document.getElementById('i_17_1').value), b=parseFloat(document.getElementById('i_17_2').value), c=parseFloat(document.getElementById('i_17_3').value); const d=b*b-4*a*c; if(d<0) return {res:"Kan ikke faktoriseres reelt", exp:"", error:true}; const x1=(-b+Math.sqrt(d))/(2*a), x2=(-b-Math.sqrt(d))/(2*a); return {res:`${a}(x - ${x1.toFixed(2)})(x - ${x2.toFixed(2)})`, exp:`Røtter funnet via ABC.`}; } },
    { id: 18, folder: "Algebra", name: "Faktorisering (3.grad)", emoji: "📦", formula: "Gjett & Divider", html: igN('a (x³)','i_18_1')+igN('b (x²)','i_18_2')+igN('c (x)','i_18_3')+igN('d','i_18_4'), calc: async () => { const a=parseFloat(document.getElementById('i_18_1').value), b=parseFloat(document.getElementById('i_18_2').value), c=parseFloat(document.getElementById('i_18_3').value), d=parseFloat(document.getElementById('i_18_4').value); const f=(x)=>a*x*x*x+b*x*x+c*x+d; let root=null; for(let i=-20; i<=20; i++) if(Math.abs(f(i))<0.001){root=i;break;} return root===null ? {res:"Ingen rot funnet", exp:"Prøver bare heltall mellom -20 og 20", error:true} : {res:`Første rot: x=${root}`, exp:`Du kan nå utføre polynomdivisjon med (x - ${root}).`}; } },
    { id: 19, folder: "Algebra", name: "Proporsjonalitet", emoji: "⚖️", formula: "y = kx", html: igN('x1','i_19_1')+igN('y1','i_19_2')+igN('Finn y for x2 =','i_19_3'), calc: async () => { const x1=parseFloat(document.getElementById('i_19_1').value), y1=parseFloat(document.getElementById('i_19_2').value), x2=parseFloat(document.getElementById('i_19_3').value); const k=y1/x1; return {res:`y2 = ${(k*x2).toFixed(2)}`, exp:`Konstant k = ${k}.`, graph: (x)=>k*x}; } },
    { id: 20, folder: "Algebra", name: "To Ukjente (Lign.sett)", emoji: "🔗", formula: "Cramers", html: igN('L1: a','i_20_1')+igN('L1: b','i_20_2')+igN('L1: c (svar)','i_20_3')+igN('L2: d','i_20_4')+igN('L2: e','i_20_5')+igN('L2: f (svar)','i_20_6'), calc: async () => { const a=parseFloat(document.getElementById('i_20_1').value), b=parseFloat(document.getElementById('i_20_2').value), c=parseFloat(document.getElementById('i_20_3').value), d=parseFloat(document.getElementById('i_20_4').value), e=parseFloat(document.getElementById('i_20_5').value), f=parseFloat(document.getElementById('i_20_6').value); const det=a*e-b*d; if(det===0) return {res:"Ingen/Uendelig løsninger", exp:"Determinanten er 0.", error:true}; return {res:`x = ${((c*e-b*f)/det).toFixed(2)}, y = ${((a*f-c*d)/det).toFixed(2)}`, exp:`Cramers regel brukt.`}; } },
    { id: 21, folder: "Algebra", name: "Fullstendig Kvadrat", emoji: "⬜", formula: "a(x+h)² + k", html: igN('a','i_21_1')+igN('b','i_21_2')+igN('c','i_21_3'), calc: async () => { const a=parseFloat(document.getElementById('i_21_1').value), b=parseFloat(document.getElementById('i_21_2').value), c=parseFloat(document.getElementById('i_21_3').value); const h=b/(2*a), k=c-(b*b)/(4*a); return {res:`${a}(x + ${h.toFixed(2)})² + ${k.toFixed(2)}`, exp:`h = b/2a, k = c - b²/4a`, graph: (x)=>a*Math.pow(x+h,2)+k}; } },
    { id: 22, folder: "Algebra", name: "Tangentens Ligning", emoji: "🖌️", formula: "y-y1=f'(x1)(x-x1)", html: igN('a','i_22_1')+igN('b','i_22_2')+igN('c','i_22_3')+igN('x-punkt','i_22_4'), calc: async () => { const a=parseFloat(document.getElementById('i_22_1').value), b=parseFloat(document.getElementById('i_22_2').value), c=parseFloat(document.getElementById('i_22_3').value), x1=parseFloat(document.getElementById('i_22_4').value); const y1=a*x1*x1+b*x1+c, stigning=2*a*x1+b; return {res:`y = ${stigning.toFixed(2)}x + ${(y1-stigning*x1).toFixed(2)}`, exp:`f'(${x1}) = ${stigning}. Satt inn i ett-punktsformelen.`, graph: (x)=>stigning*x+(y1-stigning*x1)}; } },

    // --- GEOMETRI ---
    { id: 23, folder: "Geometri", name: "Pytagoras", emoji: "📐", formula: "a² + b² = c²", html: igN('Katet a','i_23_1')+igN('Katet b','i_23_2'), calc: async () => { const a=parseFloat(document.getElementById('i_23_1').value), b=parseFloat(document.getElementById('i_23_2').value); return {res:`c = ${Math.sqrt(a*a+b*b).toFixed(2)}`, exp:`√(${a}² + ${b}²)`}; } },
    { id: 24, folder: "Geometri", name: "Areal Sirkel", emoji: "🟡", formula: "πr²", html: igN('Radius','i_24_1'), calc: async () => { const r=parseFloat(document.getElementById('i_24_1').value); return {res:`${(Math.PI*r*r).toFixed(2)}`, exp:`π * ${r}²`}; } },
    { id: 25, folder: "Geometri", name: "Kulevolum", emoji: "🔮", formula: "(4/3)πr³", html: igN('Radius','i_25_1'), calc: async () => { const r=parseFloat(document.getElementById('i_25_1').value); return {res:`${((4/3)*Math.PI*Math.pow(r,3)).toFixed(2)}`, exp:`(4/3) * π * ${r}³`}; } },
    { id: 26, folder: "Geometri", name: "Volum Boks", emoji: "📦", formula: "l * b * h", html: igN('Lengde','i_26_1')+igN('Bredde','i_26_2')+igN('Høyde','i_26_3'), calc: async () => { return {res:`${(parseFloat(document.getElementById('i_26_1').value)*parseFloat(document.getElementById('i_26_2').value)*parseFloat(document.getElementById('i_26_3').value)).toFixed(2)}`, exp:"Multipliserer sidene."}; } },
    { id: 27, folder: "Geometri", name: "Volum Sylinder", emoji: "🔋", formula: "πr²h", html: igN('Radius','i_27_1')+igN('Høyde','i_27_2'), calc: async () => { const r=parseFloat(document.getElementById('i_27_1').value), h=parseFloat(document.getElementById('i_27_2').value); return {res:`${(Math.PI*r*r*h).toFixed(2)}`, exp:`Grunnflate * høyde`}; } },
    { id: 28, folder: "Geometri", name: "Overflate Sylinder", emoji: "🩹", formula: "2πr² + 2πrh", html: igN('Radius','i_28_1')+igN('Høyde','i_28_2'), calc: async () => { const r=parseFloat(document.getElementById('i_28_1').value), h=parseFloat(document.getElementById('i_28_2').value); return {res:`${(2*Math.PI*r*r + 2*Math.PI*r*h).toFixed(2)}`, exp:`Bunn+Topp + Utbrettet side`}; } },
    { id: 29, folder: "Geometri", name: "Volum Pyramide", emoji: "🔺", formula: "(s² * h)/3", html: igN('Grunnlinje s','i_29_1')+igN('Høyde h','i_29_2'), calc: async () => { const s=parseFloat(document.getElementById('i_29_1').value), h=parseFloat(document.getElementById('i_29_2').value); return {res:`${((s*s*h)/3).toFixed(2)}`, exp:`Areal av kvadratisk bunn ganger høyde, delt på 3.`}; } },
    { id: 30, folder: "Geometri", name: "Volum Kjegle", emoji: "🍦", formula: "(πr²h)/3", html: igN('Radius','i_30_1')+igN('Høyde','i_30_2'), calc: async () => { const r=parseFloat(document.getElementById('i_30_1').value), h=parseFloat(document.getElementById('i_30_2').value); return {res:`${((Math.PI*r*r*h)/3).toFixed(2)}`, exp:`Sylinder volum delt på 3.`}; } },
    { id: 31, folder: "Geometri", name: "Areal Trapes", emoji: "⛺", formula: "((a+b)/2)*h", html: igN('Side a','i_31_1')+igN('Side b','i_31_2')+igN('Høyde h','i_31_3'), calc: async () => { const a=parseFloat(document.getElementById('i_31_1').value), b=parseFloat(document.getElementById('i_31_2').value), h=parseFloat(document.getElementById('i_31_3').value); return {res:`${(((a+b)/2)*h).toFixed(2)}`, exp:`Snittet av parallelle sider ganger høyden.`}; } },
    { id: 32, folder: "Geometri", name: "Areal Rombe", emoji: "💠", formula: "(p*q)/2", html: igN('Diagonal p','i_32_1')+igN('Diagonal q','i_32_2'), calc: async () => { const p=parseFloat(document.getElementById('i_32_1').value), q=parseFloat(document.getElementById('i_32_2').value); return {res:`${((p*q)/2).toFixed(2)}`, exp:`Halve produktet av diagonalene.`}; } },
    { id: 33, folder: "Geometri", name: "Trigonometri (Vinkel)", emoji: "🔗", formula: "sin/cos", html: igN('Vinkel i grader','i_33_1'), calc: async () => { const v=parseFloat(document.getElementById('i_33_1').value)*Math.PI/180; return {res:`Sin: ${Math.sin(v).toFixed(4)}, Cos: ${Math.cos(v).toFixed(4)}`, exp:`Konvertert til radianer og beregnet.`}; } },
    { id: 34, folder: "Geometri", name: "Eksakt Trig", emoji: "💎", formula: "Tabell", html: '<div class="input-group"><label>Vinkel</label><select id="i_34_1"><option value="30">30°</option><option value="45">45°</option><option value="60">60°</option><option value="90">90°</option></select></div>', calc: async () => { const v=document.getElementById('i_34_1').value; const m={"30":"Sin: 1/2, Cos: √3/2","45":"Sin: √2/2, Cos: √2/2","60":"Sin: √3/2, Cos: 1/2","90":"Sin: 1, Cos: 0"}; return {res:m[v], exp:"Slått opp i standardtabell."}; } },
    { id: 35, folder: "Geometri", name: "Trigonometri (Lengde)", emoji: "📏", formula: "arcsin(o/h)", html: igN('Motstående','i_35_1')+igN('Hypotenus','i_35_2'), calc: async () => { const o=parseFloat(document.getElementById('i_35_1').value), h=parseFloat(document.getElementById('i_35_2').value); return {res:`${(Math.asin(o/h)*180/Math.PI).toFixed(2)}°`, exp:`Bruker invers sinus.`}; } },
    { id: 36, folder: "Geometri", name: "Trekantløseren", emoji: "📐", formula: "Sin/Cos-setning", html: igN('Side a','i_36_1')+igN('Side b','i_36_2')+igN('Vinkel C (mellom a/b i grader)','i_36_3'), calc: async () => { const a=parseFloat(document.getElementById('i_36_1').value), b=parseFloat(document.getElementById('i_36_2').value), c_deg=parseFloat(document.getElementById('i_36_3').value); const c_rad = c_deg*Math.PI/180; const c2 = a*a + b*b - 2*a*b*Math.cos(c_rad); const c = Math.sqrt(c2); return {res:`Side c = ${c.toFixed(2)}`, exp:`Cosinussetningen: c² = a² + b² - 2ab*cos(C)`}; } },
    { id: 37, folder: "Geometri", name: "Formlikhet", emoji: "👯", formula: "Skalafaktor", html: igN('Side a (liten)','i_37_1')+igN('Side b (liten)','i_37_2')+igN('Side A (stor)','i_37_3'), calc: async () => { const a=parseFloat(document.getElementById('i_37_1').value), b=parseFloat(document.getElementById('i_37_2').value), A=parseFloat(document.getElementById('i_37_3').value); const k=A/a; return {res:`Side B = ${(b*k).toFixed(2)}`, exp:`Skalafaktor k = A/a = ${k}.`}; } },
    { id: 38, folder: "Geometri", name: "Kongruens-sjekk", emoji: "👯‍♂️", formula: "SSS", html: ig('Tre sider (Trekant 1)','i_38_1','eks: 3,4,5')+ig('Tre sider (Trekant 2)','i_38_2','eks: 5,3,4'), calc: async () => { const t1=document.getElementById('i_38_1').value.split(',').map(Number).sort(), t2=document.getElementById('i_38_2').value.split(',').map(Number).sort(); const match = t1.every((v,i)=>v===t2[i]); return {res:match?"Kongruente":"Ikke kongruente", exp:"Sorterer sidene og sjekker SSS."}; } },

    // --- MATTE ---
    { id: 39, folder: "Matte", name: "Brøk (Forenkle)", emoji: "✂️", formula: "GCD", html: igN('Teller','i_39_1')+igN('Nevner','i_39_2'), calc: async () => { const t=parseInt(document.getElementById('i_39_1').value), n=parseInt(document.getElementById('i_39_2').value); const f=gcd(t,n); return {res:`${t/f} / ${n/f}`, exp:`Største felles nevner er ${f}.`}; } },
    { id: 40, folder: "Matte", name: "Brøk til Desimal", emoji: "🔢", formula: "a / b", html: igN('Teller','i_40_1')+igN('Nevner','i_40_2'), calc: async () => { const t=parseFloat(document.getElementById('i_40_1').value), n=parseFloat(document.getElementById('i_40_2').value); return {res:`${(t/n).toFixed(4)}`, exp:`Enkelt divisjon.`}; } },
    { id: 41, folder: "Matte", name: "Derivasjon (Polynom)", emoji: "⚡", formula: "ax³+bx²+cx+d", html: igN('a (x³)','i_41_1')+igN('b (x²)','i_41_2')+igN('c (x)','i_41_3')+igN('d','i_41_4'), calc: async () => { const a=parseFloat(document.getElementById('i_41_1').value)||0, b=parseFloat(document.getElementById('i_41_2').value)||0, c=parseFloat(document.getElementById('i_41_3').value)||0; return {res:`f'(x) = ${3*a}x² + ${2*b}x + ${c}`, exp:`Bruker (xⁿ)' = n*xⁿ⁻¹`}; } },

    // --- STATISTIKK ---
    { id: 42, folder: "Statistikk", name: "Sannsynlighet", emoji: "🎲", formula: "g / m", html: igN('Gunstige','i_42_1')+igN('Mulige','i_42_2'), calc: async () => { const g=parseFloat(document.getElementById('i_42_1').value), m=parseFloat(document.getElementById('i_42_2').value); return {res:`${((g/m)*100).toFixed(2)}%`, exp:`Gunstige / Mulige`}; } },
    { id: 43, folder: "Statistikk", name: "Gjennomsnitt", emoji: "📊", formula: "Sum / n", html: ig('Tall (komma)','i_43_1','eks: 10,20,30'), calc: async () => { const vals=document.getElementById('i_43_1').value.split(',').map(Number); return {res:`${(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)}`, exp:`Summen delt på ${vals.length}.`}; } },
    { id: 44, folder: "Statistikk", name: "Lineær Regresjon", emoji: "📉", formula: "Minste kvadrater", html: ig('x-verdier','i_44_1','1,2,3')+ig('y-verdier','i_44_2','2,4,6'), calc: async () => { const x=document.getElementById('i_44_1').value.split(',').map(Number), y=document.getElementById('i_44_2').value.split(',').map(Number); const n=x.length; let sumX=0,sumY=0,sumXY=0,sumX2=0; for(let i=0;i<n;i++){sumX+=x[i];sumY+=y[i];sumXY+=x[i]*y[i];sumX2+=x[i]*x[i];} const a=(n*sumXY-sumX*sumY)/(n*sumX2-sumX*sumX), b=(sumY-a*sumX)/n; return {res:`y = ${a.toFixed(2)}x + ${b.toFixed(2)}`, exp:`Beste tilpassede rett linje.`, graph: (v)=>a*v+b}; } },

    // --- FYSIKK ---
    { id: 45, folder: "Fysikk", name: "Bølge", emoji: "🌊", formula: "v = f * λ", html: igN('Frekvens (Hz)','i_45_1')+igN('Bølgelengde (m)','i_45_2'), calc: async () => { const f=parseFloat(document.getElementById('i_45_1').value), l=parseFloat(document.getElementById('i_45_2').value); return {res:`${(f*l).toFixed(2)} m/s`, exp:`Fart = frekvens * bølgelengde`}; } },
    { id: 46, folder: "Fysikk", name: "Lydfart", emoji: "🔊", formula: "331.3 + 0.6t", html: igN('Temp °C','i_46_1'), calc: async () => { const t=parseFloat(document.getElementById('i_46_1').value); return {res:`${(331.3+0.6*t).toFixed(2)} m/s`, exp:`Justeres etter temperatur i luft.`}; } },
    { id: 47, folder: "Fysikk", name: "Fart/Vei/Tid", emoji: "🚗", formula: "s = v * t", html: igN('Fart v','i_47_1')+igN('Vei s','i_47_2')+igN('Tid t','i_47_3'), calc: async () => { const v=parseFloat(document.getElementById('i_47_1').value), s=parseFloat(document.getElementById('i_47_2').value), t=parseFloat(document.getElementById('i_47_3').value); if(isNaN(v)) return {res:`v = ${(s/t).toFixed(2)}`, exp:"Fart = vei / tid"}; if(isNaN(s)) return {res:`s = ${(v*t).toFixed(2)}`, exp:"Vei = fart * tid"}; return {res:`t = ${(s/v).toFixed(2)}`, exp:"Tid = vei / fart"}; } },
    { id: 48, folder: "Fysikk", name: "Kinetisk Energi", emoji: "🏃", formula: "E = ½mv²", html: igN('Masse kg','i_48_1')+igN('Fart m/s','i_48_2'), calc: async () => { const m=parseFloat(document.getElementById('i_48_1').value), v=parseFloat(document.getElementById('i_48_2').value); return {res:`${(0.5*m*v*v).toFixed(2)} Joule`, exp:`Energi grunnet bevegelse.`}; } },

    // --- ØKONOMI ---
    { id: 49, folder: "Økonomi", name: "Rentes rente", emoji: "📈", formula: "K * v^t", html: igN('Kapital','i_49_1')+igN('Vekstfaktor','i_49_2','1.05')+igN('År','i_49_3'), calc: async () => { const k=parseFloat(document.getElementById('i_49_1').value), v=parseFloat(document.getElementById('i_49_2').value), t=parseFloat(document.getElementById('i_49_3').value); return {res:`${(k*Math.pow(v,t)).toFixed(2)} kr`, exp:`Eksponentiell vekst over tid.`}; } },
    { id: 50, folder: "Økonomi", name: "Opprinnelig verdi", emoji: "🔙", formula: "N / (1-r)", html: igN('Nåverdi','i_50_1')+igN('Rabatt %','i_50_2'), calc: async () => { const n=parseFloat(document.getElementById('i_50_1').value), r=parseFloat(document.getElementById('i_50_2').value); return {res:`${(n/(1-r/100)).toFixed(2)} kr`, exp:`Beregner prisen før rabatten ble trukket.`}; } },
    { id: 51, folder: "Økonomi", name: "Valutakalkulator", emoji: "💵", formula: "API Sanntid", html: igN('Beløp','i_51_1','100')+'<div class="input-group"><label>Fra / Til</label><div style="display:flex; gap:10px;"><select id="i_51_2" style="flex:1;"><option value="NOK">NOK</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="SEK">SEK</option></select><select id="i_51_3" style="flex:1;"><option value="EUR">EUR</option><option value="USD">USD</option><option value="NOK">NOK</option><option value="SEK">SEK</option></select></div></div>', calc: async () => { const amt=document.getElementById('i_51_1').value, from=document.getElementById('i_51_2').value, to=document.getElementById('i_51_3').value; try{ const res=await fetch(`https://open.er-api.com/v6/latest/${from}`); const d=await res.json(); const rate=d.rates[to]; return {res:`${(amt*rate).toFixed(2)} ${to}`, exp:`1 ${from} = ${rate.toFixed(4)} ${to}`}; }catch(e){return {res:"Feil", exp:"Ingen internett.", error:true};} } },
    { id: 52, folder: "Økonomi", name: "Lånekalkulator", emoji: "🏦", formula: "Annuitet", html: igN('Lånebeløp','i_52_1','2000000')+igN('Rente %','i_52_2','5')+igN('År','i_52_3','25'), calc: async () => { const P=parseFloat(document.getElementById('i_52_1').value), r=parseFloat(document.getElementById('i_52_2').value)/100/12, n=parseFloat(document.getElementById('i_52_3').value)*12; const m=(P*r)/(1-Math.pow(1+r,-n)); return {res:`${Math.round(m)} kr/mnd`, exp:`Total tilbakebetaling: ${Math.round(m*n)} kr`}; } },

    // --- KONVERTERING ---
    { id: 53, folder: "Konvertering", name: "CM til Feet", emoji: "👣", formula: "cm / 30.48", html: igN('CM','i_53_1'), calc: async () => { return {res:`${(parseFloat(document.getElementById('i_53_1').value)/30.48).toFixed(2)} ft`, exp:`1 fot = 30.48 cm`}; } },
    { id: 54, folder: "Konvertering", name: "Hekto til Gram", emoji: "⚖️", formula: "hg * 100", html: igN('HG','i_54_1'), calc: async () => { return {res:`${parseFloat(document.getElementById('i_54_1').value)*100} g`, exp:`1 hekto = 100 gram`}; } },
    { id: 55, folder: "Konvertering", name: "Liter til dl/ml", emoji: "🥤", formula: "*10 / *1000", html: igN('Liter','i_55_1'), calc: async () => { const l=parseFloat(document.getElementById('i_55_1').value); return {res:`${l*10} dl / ${l*1000} ml`, exp:`Standard metrisk.`}; } },
    { id: 56, folder: "Konvertering", name: "Temperatur", emoji: "🌡️", formula: "C/F/K", html: igN('Verdi','i_56_1')+'<div class="input-group"><select id="i_56_2"><option value="C">Celsius</option><option value="F">Fahrenheit</option><option value="K">Kelvin</option></select></div>', calc: async () => { const v=parseFloat(document.getElementById('i_56_1').value), u=document.getElementById('i_56_2').value; if(u==="C") return {res:`${(v*1.8+32).toFixed(1)} F / ${(v+273.15).toFixed(1)} K`, exp:"Fra C"}; if(u==="F") return {res:`${((v-32)/1.8).toFixed(1)} C / ${((v-32)/1.8+273.15).toFixed(1)} K`, exp:"Fra F"}; return {res:`${(v-273.15).toFixed(1)} C / ${((v-273.15)*1.8+32).toFixed(1)} F`, exp:"Fra K"}; } },

    // --- DIVERSE ---
    { id: 57, folder: "Diverse", name: "BMI", emoji: "⚖️", formula: "kg / m²", html: igN('Vekt kg','i_57_1')+igN('Høyde cm','i_57_2'), calc: async () => { const w=parseFloat(document.getElementById('i_57_1').value), h=parseFloat(document.getElementById('i_57_2').value)/100; const bmi=w/(h*h); let s="Normalvekt"; if(bmi<18.5) s="Undervekt"; else if(bmi>25) s="Overvekt"; return {res:`BMI: ${bmi.toFixed(1)}`, exp:`Kategori: ${s}`}; } },
    { id: 58, folder: "Diverse", name: "Dato-differanse", emoji: "📅", formula: "d1 - d2", html: '<div class="input-group"><input type="date" id="i_58_1" style="margin-bottom:10px;"><input type="date" id="i_58_2"></div>', calc: async () => { const d1=new Date(document.getElementById('i_58_1').value), d2=new Date(document.getElementById('i_58_2').value); return {res:`${Math.abs(d1-d2)/(1000*60*60*24)} dager`, exp:`Tid mellom datoer.`}; } },
    { id: 59, folder: "Diverse", name: "Tilfeldig tall", emoji: "🎲", formula: "Random", html: igN('Min','i_59_1','1')+igN('Maks','i_59_2','100'), calc: async () => { const min=parseInt(document.getElementById('i_59_1').value), max=parseInt(document.getElementById('i_59_2').value); return {res:`${Math.floor(Math.random()*(max-min+1))+min}`, exp:`Trukket tilfeldig.`}; } },
    { id: 60, folder: "Diverse", name: "Passordgenerator", emoji: "🔐", formula: "Random string", html: igN('Lengde','i_60_1','12'), calc: async () => { const l=parseInt(document.getElementById('i_60_1').value); const char="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&"; let p=""; for(let i=0;i<l;i++) p+=char.charAt(Math.floor(Math.random()*char.length)); return {res:p, exp:`Sterkt passord generert.`}; } },
    { id: 61, folder: "Diverse", name: "Om appen", emoji: "ℹ️", formula: "Info", html: '<div style="text-align:center; padding: 20px;"><h2 style="color:var(--primary); margin-bottom:10px;">Total Kalkulator v4.0</h2><p style="color:var(--text-dim); line-height:1.6;">Fullstendig bygget i HTML, CSS og JS.<br>Med PWA, interaktive grafer, Live Widgets og 60+ kalkulatorer.</p></div>', calc: async () => { return {res:"Alt-i-Ett", exp:"Utviklet for maksimal effektivitet."}; } }
];

/**
 * CORE APP ENGINE
 */
const app = {
    activeView: 'folders',
    favorites: JSON.parse(localStorage.getItem('calc_favs') || '[]'),
    history: JSON.parse(localStorage.getItem('calc_history') || '[]'),
    activeCalc: null,
    mainGraph: null,

    init() {
        this.showFolderView();
        this.updateHistoryUI();
        this.initWidgets();
        this.registerPWA();
        this.setupKeyboardListeners();
    },

    setupKeyboardListeners() {
        // Enter-key for utregning
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.activeView === 'calc') {
                this.runCalculation();
            }
        });
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
    },

    showFolderView() {
        this.activeView = 'folders';
        const container = document.getElementById('mainContainer');
        const folders = [...new Set(calculators.map(c => c.folder)), "Favoritter"];
        const icons = { "Grunnleggende": "🧮", "Algebra": "📈", "Geometri": "📐", "Matte": "➕", "Statistikk": "📊", "Fysikk": "🧪", "Økonomi": "💸", "Konvertering": "🔁", "Diverse": "📦", "Favoritter": "⭐" };
        
        let html = `
            <div style="margin-bottom: 40px;">
                <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 10px;">God dag! 👋</h1>
                <p style="color: var(--text-dim); font-size: 1.1rem;">Hva vil du regne ut i dag? Velg en kategori nedenfor.</p>
            </div>
            <div class="folder-grid">`;
        
        folders.forEach(f => {
            html += `
                <div class="glass-card folder-card clickable-card" onclick="app.showListView('${f}')">
                    <div class="folder-icon">${icons[f] || '📁'}</div>
                    <div class="folder-name">${f}</div>
                </div>`;
        });
        container.innerHTML = html + `</div>`;
    },

    showListView(folder) {
        this.activeView = 'list';
        const container = document.getElementById('mainContainer');
        let list = folder === "Favoritter" ? calculators.filter(c => this.favorites.includes(c.id)) : calculators.filter(c => c.folder === folder);
        
        let html = `
            <div class="calc-header">
                <button class="btn-secondary" onclick="app.showFolderView()">← Tilbake</button>
                <h1>${folder}</h1>
            </div>
            <div class="list-view">`;
        
        if(list.length === 0) html += `<p style="color:var(--text-dim); padding:20px;">Ingen kalkulatorer her ennå.</p>`;
        
        list.forEach(c => {
            const isFav = this.favorites.includes(c.id);
            html += `
                <div class="glass-card calc-item clickable-card" onclick="app.showCalcView(${c.id})">
                    <div style="display:flex; align-items:center; gap:20px;">
                        <div style="font-size:2rem; background:rgba(255,255,255,0.05); padding:10px; border-radius:15px;">${c.emoji}</div>
                        <div>
                            <div style="font-weight:700; font-size:1.1rem; margin-bottom:4px;">${c.name}</div>
                            <div style="font-size:0.85rem; color:var(--primary); font-family:monospace;">${c.formula}</div>
                        </div>
                    </div>
                    <button class="star-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleFavorite(${c.id})">★</button>
                </div>`;
        });
        container.innerHTML = html + `</div>`;
    },

    showCalcView(id) {
        this.activeView = 'calc';
        const calc = calculators.find(c => c.id === id);
        this.activeCalc = calc;
        const container = document.getElementById('mainContainer');
        
        container.innerHTML = `
            <div class="calc-header">
                <button class="btn-secondary" onclick="app.showListView('${calc.folder}')">← Tilbake</button>
                <h1>${calc.name}</h1>
            </div>
            <div class="calc-body-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:40px; align-items: start;">
                <div class="glass-card">
                    <div style="margin-bottom:25px; padding:15px; background:rgba(0,0,0,0.2); border-radius:12px; border-left:4px solid var(--secondary);">
                        <small style="color:var(--text-dim); font-weight:bold;">FORMEL</small>
                        <div style="font-family:monospace; font-size:1.1rem; color:var(--primary); margin-top:5px;">${calc.formula}</div>
                    </div>
                    <div id="calcForm">${calc.html}</div>
                    <button class="btn-calc" onclick="app.runCalculation()">Regn ut nå</button>
                    
                    <div id="resArea" style="display:none;">
                        <div id="resBox" class="result-box">
                            <small style="color:inherit; font-weight:800; opacity:0.8;">RESULTAT</small>
                            <div id="resVal" style="font-size:2.2rem; font-weight:800; margin:10px 0; word-break:break-word;"></div>
                            <button class="btn-secondary" style="font-size:0.8rem; padding:8px 15px;" onclick="app.copyResult()">Kopier til utklippstavle</button>
                        </div>
                        <div style="margin-top:20px; padding:20px; background:var(--glass); border-radius:16px; border: 1px solid var(--glass-border);">
                            <h4 style="margin-bottom:10px; color:var(--text-dim); font-size:0.85rem; text-transform:uppercase;">Forklaring / Fremgangsmåte</h4>
                            <p id="resExp" style="font-size:0.95rem; color:var(--text); line-height:1.7; white-space:pre-line;"></p>
                        </div>
                    </div>
                </div>
                <div id="graphBox" class="glass-card" style="display:none; position:sticky; top:100px;">
                    <div class="widget-title">📈 Visuell Graf</div>
                    <div class="widget-canvas-container" style="height:400px;"><canvas id="mainGraph"></canvas></div>
                    <p style="color:var(--text-dim); font-size:0.85rem; text-align:center;">Dra med musen for å panorere. Bruk scrollehjulet for å zoome.</p>
                </div>
            </div>`;
    },

    async runCalculation() {
        try {
            const data = await this.activeCalc.calc();
            
            const resArea = document.getElementById('resArea');
            const resBox = document.getElementById('resBox');
            
            resArea.style.display = 'block';
            document.getElementById('resVal').innerText = data.res;
            document.getElementById('resExp').innerText = data.exp;
            
            if (data.error) {
                resBox.classList.add('error');
            } else {
                resBox.classList.remove('error');
                this.addToHistory(`${this.activeCalc.name}: ${data.res}`);
            }

            if(data.graph && !data.error) {
                document.getElementById('graphBox').style.display = 'block';
                if(!this.mainGraph) this.mainGraph = new GraphEngine('mainGraph');
                this.mainGraph.setFunction(data.graph);
            } else {
                document.getElementById('graphBox').style.display = 'none';
            }
        } catch(err) {
            alert("En feil oppstod. Sjekk at alle felt er riktig utfylt.");
        }
    },

    addToHistory(str) {
        this.history.unshift(str);
        if(this.history.length > 20) this.history.pop();
        localStorage.setItem('calc_history', JSON.stringify(this.history));
        this.updateHistoryUI();
    },

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calc_history');
        this.updateHistoryUI();
        const t = document.getElementById('toast'); 
        t.innerText = "Historikk slettet";
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    },

    updateHistoryUI() {
        const list = document.getElementById('historyList');
        if(!list) return;
        if(this.history.length === 0) {
            list.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-dim)">Ingen historikk ennå.</p>`;
            return;
        }
        list.innerHTML = this.history.map(h => `<div class="history-item" onclick="app.copyText('${h.split(': ')[1]}')">${h}</div>`).join('');
    },

    toggleFavorite(id) {
        if(this.favorites.includes(id)) this.favorites = this.favorites.filter(i => i !== id);
        else this.favorites.push(id);
        localStorage.setItem('calc_favs', JSON.stringify(this.favorites));
        if(this.activeView === 'list') {
            this.showListView(this.activeCalc ? this.activeCalc.folder : "Favoritter");
        }
    },

    copyResult() {
        this.copyText(document.getElementById('resVal').innerText);
    },

    copyText(txt) {
        const dummy = document.createElement("textarea");
        document.body.appendChild(dummy); dummy.value = txt; dummy.select();
        document.execCommand("copy"); document.body.removeChild(dummy);
        const t = document.getElementById('toast'); 
        t.innerText = "Kopiert!";
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2000);
    },

    handleSearch() {
        const q = document.getElementById('searchInput').value.toLowerCase();
        if(!q) return this.showFolderView();
        this.activeView = 'search';
        const filtered = calculators.filter(c => c.name.toLowerCase().includes(q) || c.folder.toLowerCase().includes(q));
        const container = document.getElementById('mainContainer');
        
        let html = `
            <div class="calc-header"><h1>Søkeresultater</h1></div>
            <div class="list-view">`;
        
        if(filtered.length === 0) html += `<p style="color:var(--text-dim)">Ingen treff på "${q}".</p>`;
        
        html += filtered.map(c => `
            <div class="glass-card calc-item clickable-card" onclick="app.showCalcView(${c.id})">
                <div style="display:flex; align-items:center; gap:20px;">
                    <div style="font-size:2rem; background:rgba(255,255,255,0.05); padding:10px; border-radius:15px;">${c.emoji}</div>
                    <div>
                        <div style="font-weight:700; font-size:1.1rem; margin-bottom:4px;">${c.name}</div>
                        <div style="font-size:0.85rem; color:var(--text-dim); text-transform:uppercase;">Kategori: ${c.folder}</div>
                    </div>
                </div>
            </div>`).join('') + `</div>`;
        
        container.innerHTML = html;
    },

    // --- STANDARD CALCULATOR WIDGET ---
    stdCalcData: "",
    stdCalc(val) {
        const disp = document.getElementById('stdCalcDisplay');
        if(val === 'C') { this.stdCalcData = ""; }
        else if(val === '=') {
            try {
                // Veldig enkel evaluering kun for den lille kalkulatoren
                const safeMath = this.stdCalcData.replace(/[^0-9+\-*/.]/g, '');
                this.stdCalcData = new Function(`return ${safeMath}`)().toString();
            } catch(e) { this.stdCalcData = "Feil"; }
        } 
        else {
            if(this.stdCalcData === "Feil") this.stdCalcData = "";
            this.stdCalcData += val;
        }
        disp.value = this.stdCalcData;
    },

    // --- WIDGET LOGIC ---
    initWidgets() {
        this.drawQuickGraph();
        this.drawUnitCircle();
        this.drawProjectile();
        this.drawStats();
        window.addEventListener('resize', () => {
            this.drawQuickGraph(); this.drawUnitCircle(); this.drawProjectile(); this.drawStats();
        });
    },

    drawQuickGraph() {
        const canvas = document.getElementById('quickGraphCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const expr = document.getElementById('quickFunc').value;
        canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
        
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        // Rutenett & Akser
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke();
        
        ctx.strokeStyle = 'var(--primary)'; ctx.lineWidth = 2;
        ctx.beginPath();
        let first = true;
        for(let px=0; px<canvas.width; px+=2) {
            const x = (px - canvas.width/2) / 20;
            const y = safeEval(expr, x);
            if(y !== null) {
                const py = canvas.height/2 - y*20;
                if(first) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                first = false;
            }
        }
        ctx.stroke();
    },

    drawUnitCircle() {
        const canvas = document.getElementById('unitCircleCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const angle = document.getElementById('unitAngle').value;
        const rad = angle * Math.PI / 180;
        canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
        
        const cx = canvas.width/2, cy = canvas.height/2, r = Math.min(cx,cy) - 20;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height); ctx.stroke();
        
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
        
        const x = cx + r * Math.cos(-rad);
        const y = cy + r * Math.sin(-rad);
        
        ctx.setLineDash([4,4]);
        ctx.strokeStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, cy); ctx.stroke();
        ctx.strokeStyle = '#10b981'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx, y); ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.strokeStyle = 'var(--primary)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        
        // Tegn punktet
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();

        document.getElementById('unitResults').innerHTML = `
            <span>Sin(v): <b style="color:#ef4444">${Math.sin(rad).toFixed(3)}</b></span>
            <span>Cos(v): <b style="color:#10b981">${Math.cos(rad).toFixed(3)}</b></span>`;
    },

    drawProjectile() {
        const canvas = document.getElementById('projectileCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const v0 = parseFloat(document.getElementById('projV0').value) || 0;
        const deg = parseFloat(document.getElementById('projAngle').value) || 0;
        const rad = deg * Math.PI / 180; const g = 9.81;
        canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
        
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        // Bakke
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(0, canvas.height-15); ctx.lineTo(canvas.width, canvas.height-15); ctx.stroke();

        ctx.strokeStyle = 'var(--secondary)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(15, canvas.height-15);
        
        let maxH = 0, maxL = 0;
        for(let t=0; t<20; t+=0.05) {
            const x = v0 * Math.cos(rad) * t;
            const y = v0 * Math.sin(rad) * t - 0.5 * g * t * t;
            if(y < 0 && t > 0.1) { maxL = x; break; }
            if(y > maxH) maxH = y;
            ctx.lineTo(15 + x*2.5, canvas.height - 15 - y*2.5);
        }
        ctx.stroke();
        document.getElementById('projResults').innerHTML = `<span>H-maks: <b style="color:var(--text)">${maxH.toFixed(1)}m</b></span><span>L-maks: <b style="color:var(--text)">${maxL.toFixed(1)}m</b></span>`;
    },

    drawStats() {
        const canvas = document.getElementById('statsCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const mu = parseFloat(document.getElementById('statsMean').value) || 100;
        const sigma = parseFloat(document.getElementById('statsStd').value) || 15;
        const xVal = parseFloat(document.getElementById('statsVal').value) || 100;
        canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
        
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        // Tegn område under grafen
        ctx.fillStyle = 'rgba(0, 210, 255, 0.15)';
        ctx.beginPath(); ctx.moveTo(0, canvas.height-15);
        
        for(let i=0; i<=canvas.width; i++) {
            const x = (i/canvas.width) * (sigma*8) + (mu - sigma*4);
            const y = (1/(sigma*Math.sqrt(2*Math.PI))) * Math.exp(-0.5 * Math.pow((x-mu)/sigma, 2));
            const py = canvas.height - 15 - y * 350 * sigma;
            ctx.lineTo(i, py);
            if(x <= xVal) ctx.lineTo(i, canvas.height-15);
        }
        ctx.fill();
        
        // Tegn selve linjen
        ctx.strokeStyle = 'var(--primary)'; ctx.lineWidth = 2; ctx.beginPath();
        for(let i=0; i<=canvas.width; i++) {
            const x = (i/canvas.width) * (sigma*8) + (mu - sigma*4);
            const y = (1/(sigma*Math.sqrt(2*Math.PI))) * Math.exp(-0.5 * Math.pow((x-mu)/sigma, 2));
            const py = canvas.height - 15 - y * 350 * sigma;
            if(i===0) ctx.moveTo(i, py); else ctx.lineTo(i, py);
        }
        ctx.stroke();
        
        // Grunnlinje
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(0, canvas.height-15); ctx.lineTo(canvas.width, canvas.height-15); ctx.stroke();

        const z = (xVal - mu) / sigma;
        document.getElementById('statsResults').innerHTML = `<span>Z-score: <b>${z.toFixed(2)}</b></span><span>P(X<x): <b>${(this.getNormalP(z)*100).toFixed(1)}%</b></span>`;
    },

    getNormalP(z) {
        const t = 1 / (1 + 0.2316419 * Math.abs(z));
        const d = 0.3989423 * Math.exp(-z * z / 2);
        let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return z > 0 ? 1 - p : p;
    },

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        this.initWidgets();
    },

    registerPWA() {
        if ('serviceWorker' in navigator) {
            const sw = `self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))));`;
            const blob = new Blob([sw], { type: 'text/javascript' });
            navigator.serviceWorker.register(URL.createObjectURL(blob));
        }
    }
};

// GraphEngine med Pan & Zoom funksjonalitet (Fullstendig)
class GraphEngine {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.func = null;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
        this.scale = 40;
        
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;

        this.initEvents();
        this.draw();
    }

    initEvents() {
        this.canvas.onmousedown = (e) => { this.isDragging = true; this.lastX = e.clientX; this.lastY = e.clientY; this.canvas.style.cursor = 'grabbing';};
        window.onmouseup = () => { this.isDragging = false; this.canvas.style.cursor = 'crosshair';};
        window.onmousemove = (e) => {
            if (!this.isDragging) return;
            this.offsetX += e.clientX - this.lastX;
            this.offsetY += e.clientY - this.lastY;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.draw();
        };
        this.canvas.onwheel = (e) => {
            e.preventDefault();
            const zoom = e.deltaY > 0 ? 0.9 : 1.1;
            // Begrens zoom
            if(this.scale * zoom > 5 && this.scale * zoom < 500) {
                this.scale *= zoom;
                this.draw();
            }
        };
    }

    setFunction(f) { 
        this.func = f; 
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
        this.scale = 40;
        this.draw(); 
    }

    draw() {
        const { ctx, canvas, offsetX, offsetY, scale } = this;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        // Rutenett
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
        for (let x = offsetX % scale; x < canvas.width; x += scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
        for (let y = offsetY % scale; y < canvas.height; y += scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

        // Akser
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, offsetY); ctx.lineTo(canvas.width, offsetY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(offsetX, 0); ctx.lineTo(offsetX, canvas.height); ctx.stroke();
        
        // Graf
        if(this.func) {
            ctx.strokeStyle = 'var(--primary)'; ctx.lineWidth = 3; ctx.beginPath();
            let first = true;
            for(let px=0; px<canvas.width; px++) {
                const x = (px-offsetX)/scale;
                try {
                    const y = this.func(x);
                    if(isNaN(y) || !isFinite(y)) { first = true; continue; } // Unngå streker til uendelighet
                    const py = offsetY - y*scale;
                    if(first) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    first = false;
                } catch(e) {}
            }
            ctx.stroke();
        }
    }
}

// Start applikasjonen når alt er lastet
window.onload = () => app.init();
