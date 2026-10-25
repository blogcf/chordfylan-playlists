(function(){
'use strict';
var script=document.currentScript,base=new URL('.',script.src).href;
var configs=[{"slug": "lagu-populer", "title": "Lagu POPuler", "playlistId": "RDCLAK5uy_mTO_y_IUPcrRrOexwFjmhx5qCtKjKnUkI", "limit": 50, "pageUrl": "https://www.chordfylan.com/p/lagu-populer.html"}, {"slug": "pop-indonesia-terbaru", "title": "Pop Indonesia Terbaru", "playlistId": "RDCLAK5uy_kxD6vQQG7kmVW9tPuJ-ju24VmLDLRd3os", "limit": 50, "pageUrl": "https://www.chordfylan.com/p/pop-indonesia-terbaru.html"}, {"slug": "indie-indonesia-terbaru", "title": "Indie Indonesia Terbaru", "playlistId": "RDCLAK5uy_kmeSK0196PqJxBLa6gb78Lg8rbG8NwIp8", "limit": 50, "pageUrl": "https://www.chordfylan.com/p/indie-indonesia-terbaru.html"}, {"slug": "100-lagu-teratas-indonesia", "title": "100 Lagu Teratas Indonesia", "playlistId": "PL4fGSI1pDJn5ObxTlEPlkkornHXUiKX1z", "limit": null, "pageUrl": "https://www.chordfylan.com/p/100-lagu-teratas-indonesia.html"}];
if(!document.querySelector('link[data-cf-yt-css]')){var css=document.createElement('link');css.rel='stylesheet';css.href=base+'widget.css';css.dataset.cfYtCss='1';document.head.appendChild(css);}
function el(tag,text){var n=document.createElement(tag);if(text)n.textContent=text;return n;}
function safeImage(url){try{var u=new URL(url);return u.protocol==='https:'&&/(^|\.)(ytimg\.com|ggpht\.com|googleusercontent\.com)$/.test(u.hostname)?u.href:'';}catch(e){return '';}}
function picture(url,title){var img=el('img');img.alt=title;img.loading='lazy';var src=safeImage(url);if(src)img.src=src;return img;}
function external(url,text){var a=el('a',text);a.href=url;a.target='_blank';a.rel='noopener';return a;}
function load(c){return fetch(base+'data/'+c.slug+'.json').then(function(r){if(!r.ok)throw Error();return r.json();}).then(function(data){if(data.playlistId!==c.playlistId||!Array.isArray(data.songs))throw Error();return data;});}
function init(root){
if(root.dataset.cfYtReady)return;root.dataset.cfYtReady='1';root.classList.add('cf-yt');
var slug=root.dataset.cfYtPlaylist;
if(!slug){
 root.appendChild(el('h2','Jelajahi Playlist'));
 var grid=el('div');grid.className='cf-yt-grid';root.appendChild(grid);
 configs.forEach(function(c){var a=el('a');a.className='cf-yt-card';a.href=c.pageUrl;var label=el('small','Lihat daftar lagu');a.appendChild(el('strong',c.title));a.appendChild(label);grid.appendChild(a);
 load(c).then(function(d){a.insertBefore(picture(d.thumbnail,c.title),a.firstChild);label.textContent=d.songs.length+' lagu'+(c.limit?' pertama':'');}).catch(function(){label.textContent='Buka halaman playlist';});});
 return;
}
var c=configs.find(function(x){return x.slug===slug;});if(!c)return;
var status=el('p','Memuat daftar lagu...');root.appendChild(status);
root.appendChild(external('https://www.youtube.com/playlist?list='+encodeURIComponent(c.playlistId),'Lihat playlist lengkap di YouTube'));
load(c).then(function(d){
 status.textContent=(c.limit?'Menampilkan hingga 50 lagu pertama. ':'')+'Diperbarui: '+new Date(d.updatedAt).toLocaleString('id-ID');
 var player=el('div','Pilih lagu dari daftar untuk memutar video.');player.className='cf-yt-player';root.appendChild(player);
 var current=el('p');current.setAttribute('aria-live','polite');root.appendChild(current);
 var input=el('input');input.type='search';input.placeholder='Cari lagu dalam playlist';input.setAttribute('aria-label','Cari lagu dalam playlist');root.appendChild(input);
 var list=el('ol');list.className='cf-yt-list';root.appendChild(list);
 var rows=[];
 d.songs.forEach(function(song,i){
 if(!/^[A-Za-z0-9_-]{11}$/.test(song.videoId))return;
 var li=el('li');li.className='cf-yt-row';li.appendChild(picture(song.thumbnail,''));
 var button=el('button',(i+1)+'. '+song.title);button.type='button';button.appendChild(el('small',song.channel));li.appendChild(button);
 li.appendChild(external('https://www.youtube.com/watch?v='+encodeURIComponent(song.videoId),'YouTube'));
 button.addEventListener('click',function(){
 var frame=el('iframe');frame.title=song.title;frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;
 frame.src='https://www.youtube.com/embed/'+encodeURIComponent(song.videoId)+'?autoplay=1&playsinline=1';player.replaceChildren(frame);current.textContent=song.title;
 });
 list.appendChild(li);rows.push({node:li,key:(song.title+' '+song.channel).toLocaleLowerCase('id-ID')});
 });
 input.addEventListener('input',function(){var q=input.value.toLocaleLowerCase('id-ID').trim();rows.forEach(function(row){row.node.hidden=!row.key.includes(q);});});
}).catch(function(){status.textContent='Daftar lagu belum tersedia. Silakan buka playlist di YouTube atau coba lagi nanti.';});
}
function start(){document.querySelectorAll('[data-cf-yt]').forEach(init);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
