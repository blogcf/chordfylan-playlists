(function(){
'use strict';
var script=document.currentScript,base=new URL('.',script.src).href;
var configs=[{"slug": "lagu-populer", "title": "Lagu POPuler", "playlistId": "RDCLAK5uy_mTO_y_IUPcrRrOexwFjmhx5qCtKjKnUkI", "limit": 50, "pageUrl": "https://www.chordfylan.com/p/lagu-populer.html"}, {"slug": "pop-indonesia-terbaru", "title": "Pop Indonesia Terbaru", "playlistId": "RDCLAK5uy_kxD6vQQG7kmVW9tPuJ-ju24VmLDLRd3os", "limit": 50, "pageUrl": "https://www.chordfylan.com/p/pop-indonesia-terbaru.html"}, {"slug": "indie-indonesia-terbaru", "title": "Indie Indonesia Terbaru", "playlistId": "RDCLAK5uy_kmeSK0196PqJxBLa6gb78Lg8rbG8NwIp8", "limit": 50, "pageUrl": "https://www.chordfylan.com/p/indie-indonesia-terbaru.html"}, {"slug": "100-lagu-teratas-indonesia", "title": "100 Lagu Teratas Indonesia", "playlistId": "PL4fGSI1pDJn5ObxTlEPlkkornHXUiKX1z", "limit": null, "pageUrl": "https://www.chordfylan.com/p/100-lagu-teratas-indonesia.html"}];
if(!document.querySelector('link[data-cf-yt-css]')){var css=document.createElement('link');css.rel='stylesheet';css.href=base+'widget.css?v=20261025-2';css.dataset.cfYtCss='1';document.head.appendChild(css);}
function el(tag,text){var n=document.createElement(tag);if(text)n.textContent=text;if(tag==='a'){n.target='_blank';n.rel='noopener';}return n;}
function safeImage(url){try{var u=new URL(url);return u.protocol==='https:'&&/(^|\.)(ytimg\.com|ggpht\.com|googleusercontent\.com)$/.test(u.hostname)?u.href:'';}catch(e){return '';}}
function picture(url,title,fallbacks){
 var img=el('img');img.alt=title;img.loading='lazy';
 var sources=[url].concat(fallbacks||[]).map(safeImage).filter(function(src,i,all){return src&&all.indexOf(src)===i;});
 function next(){if(sources.length){img.src=sources.shift();return;}
  img.onerror=null;img.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#047857"/><path d="M280 100v135a35 35 0 1 1-20-32V120l140-30v115a35 35 0 1 1-20-32V65z" fill="#fff"/></svg>');
 }
 img.onerror=next;next();return img;
} 
function load(c){return fetch(base+'data/'+c.slug+'.json').then(function(r){if(!r.ok)throw Error();return r.json();}).then(function(data){if(data.playlistId!==c.playlistId||!Array.isArray(data.songs))throw Error();return data;});}
// Match complete cleaned titles; ambiguous titles retain a blog search link.
function chordKey(title){return title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
 .replace(/\([^)]*(?:official|video|lyric|audio|visualizer)[^)]*\)|\[[^\]]*(?:official|video|lyric|audio|visualizer)[^\]]*\]/g,' ')
 .replace(/\b(?:official|music video|lyric video|lyrics?|audio|visualizer|chord|kunci gitar|chord gitar|gitar|feat|ft|featuring)\b/g,' ')
 .replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean).sort().join(' ');}
var chordIndexPromise,chordListeners=[],chordItems=[];
function chordIndex(progress){
 if(progress){chordListeners.push(progress);progress(chordItems);}
 if(chordIndexPromise)return chordIndexPromise;
 chordIndexPromise=new Promise(function(resolve){
 var items=[],seen=new Set(),offset=1;
 function page(){
 var callback='cfPlaylistFeed'+Date.now()+Math.floor(Math.random()*1000000),tag=el('script'),timer,finished=false;
 function finish(json){if(finished)return;finished=true;clearTimeout(timer);tag.remove();window[callback]=function(){};setTimeout(function(){delete window[callback];},60000);
 var entries=json&&json.feed&&json.feed.entry||[],added=0;
 entries.forEach(function(entry){var link=(entry.link||[]).find(function(x){return x.rel==='alternate';});
 if(!link)return;try{var url=new URL(link.href);if(url.protocol!=='https:'||url.hostname!=='www.chordfylan.com'||!/^\/\d{4}\/\d{2}\//.test(url.pathname)||seen.has(url.pathname))return;
 seen.add(url.pathname);items.push({key:chordKey(entry.title.$t),url:url.href});added++;}catch(e){} });
 chordItems=items;chordListeners.forEach(function(notify){notify(items);});
 if(entries.length&&added&&offset<20001){offset+=entries.length;page();}else {resolve(items);chordListeners=[];}
 }
 window[callback]=finish;tag.onerror=function(){finish(null);};
 tag.src='https://www.chordfylan.com/feeds/posts/summary?alt=json-in-script&max-results=150&start-index='+offset+'&callback='+callback;
 timer=setTimeout(function(){finish(null);},12000);document.head.appendChild(tag);
 }
 page();
 });return chordIndexPromise;
}
function connectChord(song,link,index){
 var key=chordKey(song.title),matches=index.filter(function(post){return post.key===key;});
 if(matches.length===1){link.href=matches[0].url;link.textContent='Lihat Chord';link.classList.remove('cf-yt-chord-search');link.classList.add('cf-yt-chord-found');link.title='Buka chord '+song.title;}
}
function init(root){
if(root.dataset.cfYtReady)return;root.dataset.cfYtReady='1';root.classList.add('cf-yt');
var slug=root.dataset.cfYtPlaylist;
if(!slug){
 root.appendChild(el('h2','Jelajahi Playlist'));
 var grid=el('div');grid.className='cf-yt-grid';root.appendChild(grid);
 configs.forEach(function(c){var a=el('a');a.className='cf-yt-card';a.href=c.pageUrl;var label=el('small','Lihat daftar lagu');a.appendChild(el('strong',c.title));a.appendChild(label);grid.appendChild(a);
 load(c).then(function(d){a.insertBefore(picture(d.thumbnail,c.title,d.songs.slice(0,3).reduce(function(urls,song){if(/^[A-Za-z0-9_-]{11}$/.test(song.videoId))urls.push('https://i.ytimg.com/vi/'+song.videoId+'/hqdefault.jpg');urls.push(song.thumbnail);return urls;},[])),a.firstChild);label.textContent=d.songs.length+' lagu'+(c.limit?' pertama':'');}).catch(function(){label.textContent='Buka halaman playlist';});});
 return;
}
var c=configs.find(function(x){return x.slug===slug;});if(!c)return;
var status=el('p','Memuat daftar lagu...');root.appendChild(status);
load(c).then(function(d){
 status.textContent=(c.limit?'Menampilkan hingga 50 lagu pertama. ':'')+'Diperbarui: '+new Date(d.updatedAt).toLocaleString('id-ID');
 var player=el('div');player.className='cf-yt-player';player.hidden=true;root.appendChild(player);
 var current=el('p');current.hidden=true;current.setAttribute('aria-live','polite');root.appendChild(current);
 var input=el('input');input.type='search';input.placeholder='Cari lagu dalam playlist';input.setAttribute('aria-label','Cari lagu dalam playlist');root.appendChild(input);
 var list=el('ol');list.className='cf-yt-list';root.appendChild(list);
 var rows=[],chordLinks=[],matchingDone=false;
 function filterRows(){var q=input.value.toLocaleLowerCase('id-ID').trim();rows.forEach(function(row){row.node.hidden=!row.ready||!row.key.includes(q);});}
 var chordNote=el('p','Mencocokkan lagu dengan chord di blog...');chordNote.setAttribute('role','status');root.appendChild(chordNote);
 d.songs.forEach(function(song,i){
 if(!/^[A-Za-z0-9_-]{11}$/.test(song.videoId))return;
 var li=el('li');li.className='cf-yt-row';li.hidden=true;li.appendChild(picture(song.thumbnail,''));
 var button=el('button',(i+1)+'. '+song.title);button.type='button';button.appendChild(el('small',song.channel));li.appendChild(button);
 var actions=el('div');actions.className='cf-yt-actions';
 var chordLink=el('a','Cari Chord');chordLink.className='cf-yt-chord cf-yt-chord-search';
 chordLink.href='https://www.chordfylan.com/search?q='+encodeURIComponent(song.title.replace(/\([^)]*\)|\[[^\]]*\]/g,' ').trim());
 actions.appendChild(chordLink);chordLinks.push({song:song,link:chordLink,searchUrl:chordLink.href});
 li.appendChild(actions);
 button.addEventListener('click',function(){
 var frame=el('iframe');frame.title=song.title;frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;
 frame.src='https://www.youtube.com/embed/'+encodeURIComponent(song.videoId)+'?autoplay=1&playsinline=1';player.replaceChildren(frame);player.hidden=false;current.hidden=false;current.textContent=song.title;
 });
 list.appendChild(li);rows.push({node:li,ready:false,key:(song.title+' '+song.channel).toLocaleLowerCase('id-ID')});
 });
 function updateMatches(index){
 chordLinks.forEach(function(item,i){
 item.link.href=item.searchUrl;item.link.textContent='Cari Chord';item.link.title='Cari chord '+item.song.title;
 item.link.classList.remove('cf-yt-chord-found');item.link.classList.add('cf-yt-chord-search');
 connectChord(item.song,item.link,index);rows[i].ready=matchingDone||item.link.classList.contains('cf-yt-chord-found');
 });filterRows();
 if(!matchingDone)chordNote.textContent=rows.filter(function(row){return row.ready;}).length+' lagu sudah cocok. Masih mencocokkan lagu lainnya...';
 }
 chordIndex(updateMatches).then(function(index){matchingDone=true;updateMatches(index);chordNote.textContent='Pencocokan selesai. Gunakan Cari Chord untuk lagu yang belum cocok otomatis.';});
 input.addEventListener('input',filterRows);
}).catch(function(){status.textContent='Daftar lagu belum tersedia. Silakan coba lagi nanti.';});
}
function start(){document.querySelectorAll('[data-cf-yt]').forEach(init);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
