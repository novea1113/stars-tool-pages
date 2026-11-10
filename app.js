const $=s=>document.querySelector(s), KEY='starry-ledger-v1';
let artists=ARTISTS.slice(1),records=LedgerModel.normalize(SEED),page='all',artist='全部';
try{const saved=localStorage.getItem(KEY);if(saved){const data=LedgerModel.decode(JSON.parse(saved),artists,CATEGORIES);artists=data.artists;records=data.records}}catch{alert('無法讀取已存資料，已載入原始紀錄。請先匯出備份，避免覆蓋舊資料。')}
const recordArtists=LedgerModel.tags;
const money=n=>new Intl.NumberFormat('zh-TW',{maximumFractionDigits:2}).format(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isEvent=r=>['演唱會','見面會 / FAN-CON','音樂節 / 公開演出'].includes(r.category);
function validRecords(a,names=artists){return LedgerModel.validRecords(a,names,CATEGORIES)}
function toast(s){$('#toast').textContent=s;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',2600)}
function save(next,nextArtists=artists){try{localStorage.setItem(KEY,JSON.stringify({version:2,artists:nextArtists,records:next}));records=next;artists=nextArtists;return true}catch{alert('儲存失敗，瀏覽器空間可能不足。此次變更未儲存，請先匯出備份。');return false}}
function render(){const events=records.filter(isEvent),goods=records.filter(r=>!isEvent(r));$('#overview').innerHTML=[['收藏花費',`<small>NT$</small>${money(goods.reduce((sum,r)=>sum+r.amount,0))}`,`${goods.length} 件收藏 · 專輯、周邊與品牌產品`,'♧'],['演出花費',`<small>NT$</small>${money(events.reduce((sum,r)=>sum+r.amount,0))}`,`${events.length} 場演出 · 演唱會、見面會與音樂節`,'♬'],['待確認收貨',`${records.filter(r=>!r.received).length} <small>筆</small>`,'包含待確認的實體收藏與票券','▱'],['演出回憶',`${events.length} <small>場</small>`,'演唱會、見面會與音樂節','♬']].map(([l,v,n,i])=>`<div class="metric"><span class="metric-icon">${i}</span><div class="metric-label">${l}</div><div class="metric-value">${v}</div><div class="metric-note">${n}</div></div>`).join('');
$('#ledger').hidden=page==='stats';$('#stats').hidden=page!=='stats';$('#crumb').textContent=page==='events'?'演出足跡':page==='stats'?'花費統計':'收藏帳本';$('#title').innerHTML=page==='events'?'每一次見面，都閃閃發光 <span>♬</span>':page==='stats'?'喜歡的份量，一目瞭然 <span>◷</span>':'把喜歡，一件件收藏 <span>✧</span>';$('#subtitle').textContent=page==='stats'?'用數字回顧那些心動，為下一份喜歡留下空間。':page==='events'?'記下每一場相遇，把現場的感動好好珍藏。':'從一張專輯到一場見面，每一筆都是心動的證明。';if(page==='stats'){renderStats();return}renderRows()}
function renderRows(){const base=records.filter(r=>page==='events'?isEvent(r):!isEvent(r));const selectedCategory=$('#category').value;$('#category').innerHTML='<option value="">所有分類</option>'+CATEGORIES.filter(c=>page==='events'?isEvent({category:c}):!isEvent({category:c})).map(c=>`<option>${esc(c)}</option>`).join('');$('#category').value=Array.from($('#category').options).some(o=>o.value===selectedCategory)?selectedCategory:'';$('#list-title').innerHTML=`${page==='events'?'我的演出足跡':'我的收藏'} <span>${base.length}</span>`;$('#artists').innerHTML=['全部',...artists].map(a=>`<button data-artist="${esc(a)}" class="${artist===a?'active':''}">${EMOJI[a]||'✳'} ${esc(a)} <small>${a==='全部'?base.length:base.filter(r=>recordArtists(r).includes(a)).length}</small></button>`).join('');const term=$('#search').value.toLowerCase();const list=base.filter(r=>(artist==='全部'||recordArtists(r).includes(artist))&&(!$('#category').value||r.category===$('#category').value)&&(!$('#status').value||r.received===($('#status').value==='received'))&&[r.name,r.channel,r.note,...recordArtists(r)].join(' ').toLowerCase().includes(term));$('#rows').innerHTML=list.map(r=>`<tr><td><div class="item"><div class="item-icon">${isEvent(r)?'♫':r.category==='專輯'?'▣':r.category==='品牌產品'?'♧':r.category==='出版品'?'▤':'✧'}</div><div><div class="item-title">${esc(r.name)}</div><div class="item-note">${esc([r.date,r.note].filter(Boolean).join(' · ')||'收藏生活裡的一點心動')}</div></div></td><td><div class="record-tags">${recordArtists(r).map(a=>`<span class="tag ${a==='Ling'?'ling':a==='Orm'?'orm':a==='LingOrm'?'lo':a.includes('MAMAMOO')?'group':''}">${EMOJI[a]||'✧'} ${esc(a)}</span>`).join('')}</div></td><td><span class="category">${esc(r.category)}</span></td><td class="amount">${r.note.includes('約略')?'≈ ':''}$ ${money(r.amount)}</td><td>${esc(r.channel||'待補')}<div class="payment">${esc(r.payment)}</div></td><td><input type="checkbox" data-received="${esc(r.id)}" ${r.received?'checked':''} aria-label="${esc(r.name)} 已收到"></td><td><button class="row-action" data-edit="${esc(r.id)}" aria-label="編輯 ${esc(r.name)}">✎</button><button class="row-action" data-delete="${esc(r.id)}" aria-label="刪除 ${esc(r.name)}">×</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">還沒有符合的紀錄，試試調整篩選或新增一份喜歡。</td></tr>';$('#results').textContent=`共 ${list.length} 筆紀錄 · 篩選金額 NT$ ${money(list.reduce((a,r)=>a+r.amount,0))}`}
function renderStats(){const oldArtist=$('#stats-artist')?.value||'',oldCat=$('#stats-category')?.value||'',oldYear=$('#stats-year')?.value||'';$('#stats').innerHTML=`<div class="stats-filter"><select id="stats-artist"><option value="">所有藝人</option>${artists.map(a=>`<option>${esc(a)}</option>`).join('')}</select><select id="stats-category"><option value="">所有分類</option>${CATEGORIES.map(a=>`<option>${esc(a)}</option>`).join('')}</select><select id="stats-year"><option value="">所有年份（含未填日期）</option><option value="undated">未填日期</option>${[...new Set(records.map(r=>r.date.slice(0,4)).filter(Boolean))].sort().map(y=>`<option>${y}</option>`).join('')}</select></div><div id="stats-body"></div>`;$('#stats-artist').value=oldArtist;$('#stats-category').value=oldCat;$('#stats-year').value=oldYear;updateStats();['#stats-artist','#stats-category','#stats-year'].forEach(s=>$(s).onchange=updateStats)}
function updateStats(){const a=$('#stats-artist').value,c=$('#stats-category').value,y=$('#stats-year').value;const list=records.filter(r=>(!a||recordArtists(r).includes(a))&&(!c||r.category===c)&&(!y||(y==='undated'?!r.date:r.date.startsWith(y))));const total=list.reduce((s,r)=>s+r.amount,0);function chart(field,title){const groups=Object.create(null);list.forEach(r=>(field==='artist'?recordArtists(r):[r[field]]).forEach(k=>groups[k]=(groups[k]||0)+r.amount));return `<div class="chart"><h2>${title}</h2>${Object.entries(groups).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-label"><span>${esc(k)}</span><span>NT$ ${money(v)} · ${total?(v/total*100).toFixed(1):0}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${total?v/total*100:0}%"></div></div>`).join('')||'<p>沒有符合條件的紀錄</p>'}</div>`}$('#stats-body').innerHTML=`<div class="stats-total">${list.length} 筆紀錄的花費 <strong>NT$ ${money(total)}</strong><p>以已登錄金額計算，包含未收貨與約略金額；未填運費不另計。複選藝人的紀錄會完整計入各藝人的花費，藝人占比可能合計超過 100%；上方總額與分類統計每筆只計一次。</p></div><div class="chart-grid">${chart('artist','依藝人 / 團體')}${chart('category','依品項分類')}</div>`}
const form=$('#record-form');form.elements.category.innerHTML=CATEGORIES.map(a=>`<option>${esc(a)}</option>`).join('');$('#category').innerHTML+=CATEGORIES.map(a=>`<option>${esc(a)}</option>`).join('');
function renderArtistPicker(selected=[]){$('#artist-picker').innerHTML=artists.map(a=>`<label class="artist-option"><input type="checkbox" name="artists" value="${esc(a)}" ${selected.includes(a)?'checked':''}> ${EMOJI[a]||'✧'} ${esc(a)}</label>`).join('')}
function edit(id){form.reset();$('#form-error').textContent='';const r=records.find(r=>r.id===id);form.elements.id.value=id||'';if(r)Object.keys(r).forEach(k=>{if(k!=='artists'&&form.elements[k]){if(k==='received')form.elements[k].checked=r[k];else form.elements[k].value=r[k]}});else if(page==='events')form.elements.category.value='演唱會';renderArtistPicker(r?recordArtists(r):[]);$('#modal-title').textContent=r?'編輯紀錄':'新增收藏紀錄';$('#editor').showModal()}
$('#add').onclick=()=>edit();$('#close').onclick=$('#cancel').onclick=()=>$('#editor').close();
function newRecordId(){
 if(typeof globalThis.crypto?.randomUUID==='function')return globalThis.crypto.randomUUID();
 if(typeof globalThis.crypto?.getRandomValues==='function')return 'r-'+Array.from(globalThis.crypto.getRandomValues(new Uint32Array(4)),n=>n.toString(16).padStart(8,'0')).join('');
 let id;do{id='r-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}while(records.some(r=>r.id===id));return id;
}
function saveRecord(){
 const feedback=$('#form-error'),button=$('#save-record');
 feedback.textContent='正在檢查紀錄…';
 try{
  const field=k=>form.elements.namedItem(k);
  const value=k=>field(k).value.trim();
  const fail=(message,key)=>{feedback.textContent=message;if(key)field(key).focus();};
  if(!value('name'))return fail('請填寫品項或活動名稱。','name');
  if(value('name').length>240)return fail('品項名稱請勿超過 240 個字。','name');
  const amountText=value('amount').normalize('NFKC').replace(/^(?:NT\$|TWD|\$)\s*/i,'').replace(/,/g,'');
  if(!/^\d+(?:\.\d{1,2})?$/.test(amountText))return fail('請填寫有效金額，例如 2765、2,765 或 100.50；免費活動請填 0。','amount');
  const amount=Number(amountText);
  if(!Number.isFinite(amount))return fail('金額過大，請重新確認。','amount');
  if(field('date').validity.badInput)return fail('請輸入完整日期，或將日期清空。','date');
  const selectedArtists=Array.from(form.querySelectorAll('[name=artists]:checked'),input=>input.value);
  if(!selectedArtists.length)return fail('請至少選擇一位藝人或團體。');
  const r={id:value('id')||newRecordId(),name:value('name'),amount,artists:selectedArtists,category:value('category'),date:value('date'),channel:value('channel'),payment:value('payment'),note:value('note'),received:field('received').checked};
  if(!validRecords([r]))return fail('藝人、分類或日期格式不正確，請重新選擇。');
  button.disabled=true;button.textContent='儲存中…';
  const next=records.some(x=>x.id===r.id)?records.map(x=>x.id===r.id?r:x):[r,...records];
  if(save(next)){
   artist='全部';$('#search').value='';$('#category').value='';$('#status').value='';
   $('#editor').close();render();toast('已儲存「'+r.name+'」 ✧');
  }else feedback.textContent='無法寫入瀏覽器儲存空間。表單內容已保留，請檢查網站儲存權限或先匯出備份。';
 }catch(error){feedback.textContent='儲存未完成：'+(error.message||'發生未預期的錯誤')+'。表單內容已保留，請先勿關閉。';}
 finally{button.disabled=false;button.textContent='儲存紀錄';}
}
$('#save-record').addEventListener('click',saveRecord);
form.addEventListener('submit',e=>{e.preventDefault();saveRecord()});

$('nav').onclick=e=>{const b=e.target.closest('[data-page]');if(!b)return;page=b.dataset.page;artist='全部';$('#search').value='';$('#category').value='';$('#status').value='';document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x===b));render()};
$('#artists').onclick=e=>{const b=e.target.closest('[data-artist]');if(b){artist=b.dataset.artist;renderRows()}};['#search','#category','#status'].forEach(s=>$(s).addEventListener(s==='#search'?'input':'change',renderRows));
$('#rows').onchange=e=>{const id=e.target.dataset.received;if(id){if(save(records.map(r=>r.id===id?{...r,received:e.target.checked}:r)))toast(e.target.checked?'已確認收到 ♡':'已改為待確認收貨');render()}};
$('#rows').onclick=e=>{const editId=e.target.closest('[data-edit]')?.dataset.edit,deleteId=e.target.closest('[data-delete]')?.dataset.delete;if(editId)edit(editId);if(deleteId&&confirm('確定刪除此筆紀錄？此操作無法復原。')){if(save(records.filter(r=>r.id!==deleteId))){render();toast('已刪除紀錄')}}};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({version:2,artists,records},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`星藏備份-${new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Taipei'})}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('備份已匯出，請妥善保存')};
let pendingImport=null;
$('#import').onclick=()=>$('#import-file').click();
$('#cancel-import').onclick=()=>{pendingImport=null;$('#import-dialog').close()};
$('#import-file').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 pendingImport=null;$('#confirm-import').hidden=true;$('#import-message').textContent='正在讀取備份…';$('#import-dialog').showModal();
 try{
  if(file.size>10000000)throw Error('檔案超過 10 MB');
  const parsed=JSON.parse(await file.text());
  pendingImport=LedgerModel.decode(parsed,ARTISTS.slice(1),CATEGORIES);
  const received=pendingImport.records.filter(r=>r.received).length;
  $('#import-message').textContent=`${file.name}：共 ${pendingImport.records.length} 筆，已收到 ${received} 筆、待確認收貨 ${pendingImport.records.length-received} 筆。確認後將取代目前 ${records.length} 筆紀錄與藝人分類，建議先匯出目前資料備份。`;
  $('#confirm-import').hidden=false;
 }catch(error){$('#import-message').textContent='無法匯入：'+(error.message||'請選擇有效的星藏 JSON 備份檔');}
 finally{e.target.value=''}
};
$('#confirm-import').onclick=()=>{
 if(!pendingImport)return;
 const data=pendingImport;
 if(!save(data.records,data.artists)){$('#import-message').textContent='匯入未完成：瀏覽器無法儲存資料，原有紀錄未更動。請檢查網站儲存權限後重試。';return}
 pendingImport=null;artist='全部';$('#search').value='';$('#category').value='';$('#status').value='';
 render();$('#import-dialog').close();
 const received=records.filter(r=>r.received).length;
 $('#import-result').hidden=false;
 $('#import-result').textContent=`匯入完成：共 ${records.length} 筆，已收到 ${received} 筆、待確認收貨 ${records.length-received} 筆。`;
 toast('備份匯入完成');
};
function renderArtistManager(){
 $('#artist-manager-list').innerHTML=artists.map((a,i)=>`<label class="artist-manager-row"><span>${EMOJI[a]||'✧'}</span><input data-artist-index="${i}" aria-label="藝人分類 ${i+1}" value="${esc(a)}" maxlength="60"><small>${records.filter(r=>recordArtists(r).includes(a)).length} 筆</small></label>`).join('');
 $('#artist-manager-error').textContent='';$('#new-artist').value='';
}
$('#manage-artists').onclick=()=>{renderArtistManager();$('#artist-manager').showModal()};
$('#close-artists').onclick=()=>$('#artist-manager').close();
$('#add-artist-row').onclick=()=>{
 const name=$('#new-artist').value.trim(),inputs=Array.from($('#artist-manager-list').querySelectorAll('input'));
 if(!name||name==='全部'||inputs.some(input=>input.value.trim()===name)||inputs.length>=200){$('#artist-manager-error').textContent='請輸入不同的分類名稱（不可使用「全部」），最多 200 個。';return}
 const row=document.createElement('label');row.className='artist-manager-row';row.innerHTML=`<span>✧</span><input data-artist-index="${inputs.length}" aria-label="藝人分類 ${inputs.length+1}" value="${esc(name)}" maxlength="60"><small>新增</small>`;
 $('#artist-manager-list').append(row);$('#new-artist').value='';$('#artist-manager-error').textContent='';row.querySelector('input').focus();
};
$('#save-artists').onclick=()=>{
 const names=Array.from($('#artist-manager-list').querySelectorAll('input'),input=>input.value.trim());
 if(!LedgerModel.validArtists(names)){$('#artist-manager-error').textContent='分類名稱不得空白或重複，不可使用「全部」，每個名稱最多 60 字。';return}
 const renamed=new Map(artists.map((a,i)=>[a,names[i]]));
 const next=records.map(r=>{const updated={...r,artists:recordArtists(r).map(a=>renamed.get(a)||a)};delete updated.artist;return updated});
 if(save(next,names)){artist=renamed.get(artist)||artist;$('#artist-manager').close();render();toast('已儲存藝人分類，相關紀錄已同步更新')}
};
const SIDEBAR_KEY='starry-sidebar-collapsed';
function setSidebarCollapsed(collapsed){
 document.body.classList.toggle('sidebar-collapsed',collapsed);
 $('#sidebar').hidden=collapsed;
 const button=$('#sidebar-toggle');
 button.setAttribute('aria-expanded',String(!collapsed));
 button.setAttribute('aria-label',collapsed?'展開側邊欄':'收起側邊欄');
 button.title=collapsed?'展開側邊欄':'收起側邊欄';
}
try{setSidebarCollapsed(localStorage.getItem(SIDEBAR_KEY)==='true')}catch{setSidebarCollapsed(false)}
$('#sidebar-toggle').onclick=()=>{
 const collapsed=!document.body.classList.contains('sidebar-collapsed');
 setSidebarCollapsed(collapsed);
 try{localStorage.setItem(SIDEBAR_KEY,String(collapsed))}catch{toast('已切換側邊欄；瀏覽器未允許保存此偏好')}
};
render();
