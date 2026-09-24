(async()=>{const entrada=prompt('Cole os códigos:');
if(!entrada){alert('Nenhum código informado.');return;}
const listaCodigos=entrada.split(/[\s,;\n]+/).map(c=>c.trim()).filter(Boolean);
const mapaQuantidades={};
for(const codigo of listaCodigos){mapaQuantidades[codigo]=(mapaQuantidades[codigo]||0)+1;}
const codigos=Object.keys(mapaQuantidades);
console.log('Códigos únicos:',codigos);
console.log('Quantidades:',mapaQuantidades);
const esperar=(condicao,timeout=10000,intervalo=100)=>new Promise(resolve=>{const inicio=Date.now();
const timer=setInterval(()=>{
try{if(condicao()){clearInterval(timer);resolve(true);return;}
if(Date.now()-inicio>=timeout){clearInterval(timer);resolve(false);}
}catch{}},intervalo);});
const esperarElemento=(condicao,timeout=10000,intervalo=100)=>new Promise(resolve=>{
const inicio=Date.now();
const timer=setInterval(()=>{
try{const resultado=condicao();
if(resultado){clearInterval(timer);resolve(resultado);return;}
if(Date.now()-inicio>=timeout){clearInterval(timer);resolve(null);}}catch{}},intervalo);});
async function selecionarTabela22(){
const labelTabela=[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Tabela'));
if(!labelTabela)return false;
const setas=labelTabela.parentElement?.querySelectorAll('.css-1xc3v61-indicatorContainer');
const seta=setas?.[setas.length-1];
if(!seta)return false;
['mousedown','mouseup','click'].forEach(evt=>seta.dispatchEvent(new MouseEvent(evt,{bubbles:true,cancelable:true})));
const abriu=await esperar(()=>[...document.querySelectorAll('*')].some(el=>el.textContent?.trim()==='22 - Procedimentos e eventos em saúde'));
if(!abriu)return false;
const opcao22=[...document.querySelectorAll('*')].find(el=>el.textContent?.trim()==='22 - Procedimentos e eventos em saúde');
if(!opcao22)return false;
opcao22.click();
return true;}
async function localizarCampoProcedimento(){
return [...document.querySelectorAll('label')].find(l=>l.textContent.includes('Código e descrição'))?.parentElement?.querySelector('input[role="combobox"]');}
async function definirQuantidade(valor){
const campoQuantidade=[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Quantidade'))?.parentElement?.querySelector('input[type="number"]');
if(!campoQuantidade)return false;
const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
setter.call(campoQuantidade,String(valor));
['input','change','blur'].forEach(evt=>campoQuantidade.dispatchEvent(new Event(evt,{bubbles:true})));
return true;}
for(const codigo of codigos){
try{console.log(`Processando: ${codigo} (Quantidade: ${mapaQuantidades[codigo]})`);
if(!(await selecionarTabela22()))continue;
const campo=await localizarCampoProcedimento();if(!campo)continue;
campo.focus();
const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
setter.call(campo,'');
campo.dispatchEvent(new Event('input',{bubbles:true}));
setter.call(campo,codigo);
campo.dispatchEvent(new InputEvent('input',{bubbles:true,data:codigo,inputType:'insertText'}));
const opcao=await esperarElemento(()=>{const listbox=document.querySelector('[role="listbox"]');
if(!listbox)return null;
return [...listbox.querySelectorAll('[role="option"]')].find(el=>el.textContent?.trim().startsWith(codigo));},8000);
if(!opcao){console.warn('Código não encontrado:',codigo);continue;}
opcao.click();
await esperar(()=>{const qtd=[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Quantidade'))?.parentElement?.querySelector('input[type="number"]');
return !!qtd;},5000);
await definirQuantidade(mapaQuantidades[codigo]);
await new Promise(r=>setTimeout(r,15));
document.querySelector('.button-add')?.click();
let adicionado=await esperar(()=>[...document.querySelectorAll('td.first-column')].some(td=>td.textContent?.trim()===codigo),3000);
if(!adicionado){console.log('Tentando segundo clique:',codigo);
document.querySelector('.button-add')?.click();
adicionado=await esperar(()=>[...document.querySelectorAll('td.first-column')].some(td=>td.textContent?.trim()===codigo),5000);}
if(!adicionado){console.warn('Inclusão não confirmada:',codigo);continue;}
}catch(e){console.error('Erro ao processar',codigo,e);}}
alert('FINALIZADO!');})();
