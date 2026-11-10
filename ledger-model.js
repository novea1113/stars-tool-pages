(function(root){
const tags=r=>Array.isArray(r.artists)?r.artists:typeof r.artist==='string'?[r.artist]:[];
const normalize=records=>records.map(r=>({...r,artists:[...new Set(tags(r))]}));
function validArtists(a){return Array.isArray(a)&&a.length<=200&&new Set(a).size===a.length&&a.every(n=>typeof n==='string'&&n.trim()===n&&n.length>0&&n.length<=60&&n!=='全部')}
function validRecords(a,artists,categories){return Array.isArray(a)&&a.length<=20000&&new Set(a.map(r=>r?.id)).size===a.length&&a.every(r=>r&&typeof r.id==='string'&&r.id&&typeof r.name==='string'&&r.name.trim()&&Array.isArray(r.artists)&&r.artists.length>0&&new Set(r.artists).size===r.artists.length&&r.artists.every(n=>artists.includes(n))&&categories.includes(r.category)&&typeof r.amount==='number'&&Number.isFinite(r.amount)&&r.amount>=0&&typeof r.received==='boolean'&&['date','channel','payment','note'].every(k=>typeof r[k]==='string')&&(!r.date||/^\d{4}-\d{2}-\d{2}$/.test(r.date)))}
function decode(data,defaults,categories){const legacy=Array.isArray(data)||data?.version===1;const source=Array.isArray(data)?data:data?.records;if(!legacy&&data?.version!==2)throw Error('不支援的備份版本');if(!Array.isArray(source))throw Error('紀錄格式不正確');const records=normalize(source);const artists=legacy?[...new Set([...defaults,...records.flatMap(tags)])]:data.artists;if(!validArtists(artists)||!validRecords(records,artists,categories))throw Error('藝人或紀錄格式不正確');const result={version:2,artists,records};if(data?.artistEmojis!==undefined){if(!data.artistEmojis||typeof data.artistEmojis!=='object'||Array.isArray(data.artistEmojis)||Object.entries(data.artistEmojis).some(([k,v])=>!artists.includes(k)||typeof v!=='string'||v.length>60))throw Error('藝人 emoji 格式不正確');result.artistEmojis=data.artistEmojis}return result}
function editArtists(records,originals,edits){
 const names=edits.map(e=>e.name),kept=edits.filter(e=>e.original!==null).map(e=>e.original);
 if(!validArtists(names)||new Set(kept).size!==kept.length||kept.some(n=>!originals.includes(n)))throw Error('分類名稱不得空白或重複，不可使用「全部」，每個名稱最多 60 字。');
 if(edits.some(e=>typeof e.emoji!=='string'||e.emoji.length>60))throw Error('Emoji 欄位最多 60 字元。');
 if(records.some(r=>tags(r).some(a=>!kept.includes(a))))throw Error('仍有收藏或演出紀錄的分類無法刪除。');
 const rename=new Map(edits.filter(e=>e.original!==null).map(e=>[e.original,e.name]));
 return {artists:names,artistEmojis:Object.fromEntries(edits.map(e=>[e.name,e.emoji])),records:records.map(r=>{const updated={...r,artists:tags(r).map(a=>rename.get(a))};delete updated.artist;return updated})};
}
const api={tags,normalize,validArtists,validRecords,decode,editArtists};if(typeof module!=='undefined')module.exports=api;else root.LedgerModel=api;
})(globalThis);
