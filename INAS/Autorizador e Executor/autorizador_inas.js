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
const TEXTO_TABELA='22 - Procedimentos e eventos em saúde';
const tabelaSelecionada=()=>[...document.querySelectorAll('.css-1o0507n-singleValue')].some(el=>el.textContent?.trim()===TEXTO_TABELA);
for(let tentativa=1;tentativa<=3;tentativa++){
if(!tabelaSelecionada()){
const labelTabela=[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Tabela'));
if(!labelTabela)return false;
const setas=labelTabela.parentElement?.querySelectorAll('.css-1xc3v61-indicatorContainer');
const seta=setas?.[setas.length-1];
if(!seta)return false;
['mousedown','mouseup','click'].forEach(evt=>seta.dispatchEvent(new MouseEvent(evt,{bubbles:true,cancelable:true})));
const opcao22=await esperarElemento(()=>[...document.querySelectorAll('[role="option"],div')].find(el=>el.textContent?.trim()===TEXTO_TABELA),8000);
if(!opcao22)return false;
opcao22.click();
}
const confirmou=await esperar(()=>tabelaSelecionada(),3000,100);
if(!confirmou){console.warn(`Tabela 22 não confirmada na tentativa ${tentativa}`);return false;}
await new Promise(r=>setTimeout(r,150));
}
console.log('Tabela 22 confirmada 3 vezes');
return true;}
function lerItensTabela(){
return [...document.querySelectorAll('tbody tr')].reduce((itens,tr)=>{
const codigo=tr.querySelector('td.first-column')?.textContent?.trim();
const quantidadeTexto=tr.querySelector('td:nth-child(3)')?.textContent?.trim();
const quantidade=Number(quantidadeTexto?.replace(',', '.'));
if(codigo)itens[codigo]=(itens[codigo]||0)+(Number.isFinite(quantidade)?quantidade:1);
return itens;
},{});}
function obterCodigosPendentes(){
const itensTabela=lerItensTabela();
return codigos.reduce((pendentes,codigo)=>{
const faltante=mapaQuantidades[codigo]-(itensTabela[codigo]||0);
if(faltante>0)pendentes[codigo]=faltante;
return pendentes;
},{});}
async function localizarCampoProcedimento(){
return [...document.querySelectorAll('label')].find(l=>l.textContent.includes('Código e descrição'))?.parentElement?.querySelector('input[role="combobox"]');}
async function definirQuantidade(valor){
const campoQuantidade=[...document.querySelectorAll('label')].find(l=>l.textContent.includes('Quantidade'))?.parentElement?.querySelector('input[type="number"]');
if(!campoQuantidade)return false;
const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
setter.call(campoQuantidade,String(valor));
['input','change','blur'].forEach(evt=>campoQuantidade.dispatchEvent(new Event(evt,{bubbles:true})));
return true;}
let pendentes=obterCodigosPendentes();
console.log('Itens pendentes antes da inclusão:',pendentes);
for(const codigo of Object.keys(pendentes)){
try{console.log(`Processando: ${codigo} (Quantidade: ${mapaQuantidades[codigo]})`);
if(!(await selecionarTabela22()))continue;
await new Promise(r=>setTimeout(r,300));
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
await definirQuantidade(pendentes[codigo]);
await new Promise(r=>setTimeout(r,15));
document.querySelector('.button-add')?.click();
let adicionado=await esperar(()=>[...document.querySelectorAll('td.first-column')].some(td=>td.textContent?.trim()===codigo),3000);
if(!adicionado){console.log('Tentando segundo clique:',codigo);
document.querySelector('.button-add')?.click();
adicionado=await esperar(()=>[...document.querySelectorAll('td.first-column')].some(td=>td.textContent?.trim()===codigo),5000);}
if(!adicionado){console.warn('Inclusão não confirmada:',codigo);continue;}
}catch(e){console.error('Erro ao processar',codigo,e);}}
pendentes=obterCodigosPendentes();
if(Object.keys(pendentes).length){
console.warn('Códigos ou quantidades ainda pendentes:',pendentes);
for(const codigo of Object.keys(pendentes)){
console.log(`Refazendo inclusão: ${codigo} (Quantidade: ${pendentes[codigo]})`);
try{
if(!(await selecionarTabela22()))continue;
await new Promise(r=>setTimeout(r,300));
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
if(!opcao){console.warn('Código não encontrado na segunda tentativa:',codigo);continue;}
opcao.click();
await esperar(()=>[...document.querySelectorAll('label')].some(l=>l.textContent.includes('Quantidade')&&l.parentElement?.querySelector('input[type="number"]')),5000);
await definirQuantidade(pendentes[codigo]);
await new Promise(r=>setTimeout(r,15));
document.querySelector('.button-add')?.click();
}catch(e){console.error('Erro na segunda tentativa',codigo,e);}}
}
const faltantesFinais=obterCodigosPendentes();
if(Object.keys(faltantesFinais).length)console.warn('Após todas as tentativas, ainda faltam:',faltantesFinais);
alert('FINALIZADO!');})();
