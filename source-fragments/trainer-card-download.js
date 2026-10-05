async function downloadTrainerCard(){if(publicMode||!trainerCardFaction())return toast("Join a team to create a Trainer Card.");const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),W=1200,H=700;canvas.width=W;canvas.height=H;const colors=trainerCardColors(),grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,colors[0]);grad.addColorStop(1,colors[1]);roundedRectPath(ctx,12,12,W-24,H-24,42);ctx.fillStyle=grad;ctx.fill();
const banner=await loadCanvasImage(trainerCardBannerUrl());
if(banner){ctx.save();roundedRectPath(ctx,12,12,W-24,H-24,42);ctx.clip();const scale=Math.max(W/banner.width,H/banner.height),dw=banner.width*scale,dh=banner.height*scale;ctx.drawImage(banner,(W-dw)/2,(H-dh)/2,dw,dh);const shade=ctx.createLinearGradient(0,0,W,0);shade.addColorStop(0,"rgba(0,0,0,.12)");shade.addColorStop(1,"rgba(0,0,0,.52)");ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);ctx.restore();}
if(isCurrentTeamLeader()){ctx.strokeStyle="#f3c84b";ctx.lineWidth=10;roundedRectPath(ctx,17,17,W-34,H-34,38);ctx.stroke();}ctx.save();roundedRectPath(ctx,12,12,W-24,H-24,42);ctx.clip();ctx.globalAlpha=.11;ctx.strokeStyle="#fff";ctx.lineWidth=56;ctx.beginPath();ctx.arc(1050,640,250,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.12;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(120,80,220,0,Math.PI*2);ctx.fill();ctx.restore();const display=profile?.display_name||profile?.username||"Trainer",f=trainerCardFaction(),a=all(),c=a.filter(caught).length;ctx.fillStyle="rgba(255,255,255,.16)";roundedRectPath(ctx,65,112,315,455,34);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.28)";ctx.lineWidth=2;ctx.stroke();const img=await loadVisibleCharacterImage(trainerCardAvatarUrl());if(img){const scale=Math.min(280/img.width,420/img.height),dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,65+(315-dw)/2,135+(410-dh),dw,dh)}else{ctx.fillStyle="rgba(255,255,255,.85)";ctx.font="900 92px system-ui";ctx.textAlign="center";ctx.fillText((display.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("")||"RF").toUpperCase(),222,385);ctx.textAlign="left"}ctx.fillStyle="rgba(255,255,255,.82)";ctx.font="900 21px system-ui";ctx.fillText("READING FRENZY • TRAINER CARD",430,150);ctx.fillStyle="#fff";ctx.font="1000 62px system-ui";ctx.fillText(display.slice(0,28),430,230);ctx.fillStyle="rgba(255,255,255,.86)";ctx.font="800 29px system-ui";ctx.fillText(profile?.username?`@${profile.username}`:"@reader",430,278);const pct=a.length?c/a.length*100:0,pctText=pct<1&&c?pct.toFixed(1)+"%":Math.round(pct)+"%";const boxes=[[430,330,215,125,"TEAM",f?.name||"Team"],[665,330,215,125,"CAUGHT",`${c} / ${a.length}`],[900,330,215,125,"COMPLETE",pctText]];boxes.forEach(([x,y,w,h,label,value])=>{ctx.fillStyle="rgba(0,0,0,.15)";roundedRectPath(ctx,x,y,w,h,20);ctx.fill();ctx.fillStyle="rgba(255,255,255,.72)";ctx.font="900 17px system-ui";ctx.fillText(label,x+22,y+36);ctx.fillStyle="#fff";ctx.font="900 28px system-ui";ctx.fillText(String(value).slice(0,20),x+22,y+82)});const badgeRows=selectedSpecialBadges().slice(0,5),badgeCount=badgeRows.length,badgeLayout=trainerBadgeLayout(badgeCount,W,false),badgeSize=badgeLayout.size,badgeGap=badgeLayout.gap,badgeStep=badgeSize+badgeGap;const leaderCardNow=isCurrentTeamLeader();if(leaderCardNow){const leaderLabel=f?.leader_character?`TEAM LEADER • ${f.leader_character}`:"TEAM LEADER";ctx.fillStyle="#f6d25b";roundedRectPath(ctx,430,470,360,50,25);ctx.fill();ctx.fillStyle="#3c2b00";ctx.font="1000 18px system-ui";ctx.fillText(leaderLabel.slice(0,30),454,502);for(let bi=0;bi<badgeRows.length;bi++){const bsrc=specialBadgeImage(badgeRows[bi].slug);if(!bsrc)continue;try{const bimg=await loadVisibleCharacterImage(bsrc);if(bimg)ctx.drawImage(bimg,430+bi*badgeStep,526,badgeSize,badgeSize)}catch(_){}}}else{for(let bi=0;bi<badgeRows.length;bi++){const bsrc=specialBadgeImage(badgeRows[bi].slug);if(!bsrc)continue;try{const bimg=await loadVisibleCharacterImage(bsrc);if(bimg)ctx.drawImage(bimg,430+bi*badgeStep,466,badgeSize,badgeSize)}catch(_){}}}ctx.strokeStyle="rgba(255,255,255,.72)";ctx.lineWidth=8;ctx.beginPath();ctx.arc(1080,105,44,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(1080,105,12,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,.88)";ctx.fill();ctx.beginPath();ctx.moveTo(1000,105);ctx.lineTo(1036,105);ctx.moveTo(1124,105);ctx.lineTo(1160,105);ctx.stroke();try{const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));if(!blob)throw new Error("No image");const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=`Reading-Frenzy-Trainer-Card-${(profile?.username||"trainer").replace(/[^a-z0-9_-]/gi,"-")}.png`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Trainer Card downloaded.")}catch(e){console.error(e);toast("Could not download Trainer Card.")}}
function drawImageCover(ctx,img,x,y,w,h){const scale=Math.max(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function drawImageContain(ctx,img,x,y,w,h){const scale=Math.min(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
async function downloadTrainerCardWithPokemon(){
if(publicMode||!trainerCardFaction())return toast("Join a team to create a Trainer Card.");

const liveCard=document.getElementById("trainerCardTestMockup");
if(!liveCard)return toast("Trainer Card is not available.");

let frame=null;
try{
  renderTrainerCardTestMockup();

  if(document.fonts?.ready){
    try{await document.fonts.ready}catch(_){}
  }

  const liveImgs=[...liveCard.querySelectorAll("img")];
  await Promise.all(liveImgs.map(img=>{
    if(img.complete&&img.naturalWidth)return Promise.resolve();
    return new Promise(resolve=>{
      const done=()=>resolve();
      img.addEventListener("load",done,{once:true});
      img.addEventListener("error",done,{once:true});
      setTimeout(done,3000);
    });
  }));

  if(typeof window.html2canvas!=="function"){
    await new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-rf-html2canvas="1"]');
      if(existing){
        if(typeof window.html2canvas==="function")return resolve();
        existing.addEventListener("load",resolve,{once:true});
        existing.addEventListener("error",()=>reject(new Error("html2canvas failed to load")),{once:true});
        return;
      }
      const script=document.createElement("script");
      script.src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      script.async=true;
      script.crossOrigin="anonymous";
      script.dataset.rfHtml2canvas="1";
      script.onload=resolve;
      script.onerror=()=>reject(new Error("html2canvas failed to load"));
      document.head.appendChild(script);
    });
  }
  if(typeof window.html2canvas!=="function")throw new Error("html2canvas unavailable");

  frame=document.createElement("iframe");
  frame.setAttribute("aria-hidden","true");
  frame.style.position="fixed";
  frame.style.left="-20000px";
  frame.style.top="0";
  frame.style.width="1200px";
  frame.style.height="720px";
  frame.style.border="0";
  frame.style.pointerEvents="none";
  document.body.appendChild(frame);

  const doc=frame.contentDocument;
  if(!doc)throw new Error("Could not create export viewport");

  doc.open();
  doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
  doc.close();

  const base=doc.createElement("base");
  base.href=document.baseURI;
  doc.head.appendChild(base);

  // Copy the exact same site styles that rendered the live card.
  for(const node of document.head.querySelectorAll('style,link[rel="stylesheet"]')){
    doc.head.appendChild(node.cloneNode(true));
  }

  const reset=doc.createElement("style");
  reset.textContent='html,body{margin:0!important;padding:0!important;width:1200px!important;min-width:1200px!important;background:transparent!important;overflow:hidden!important}';
  doc.head.appendChild(reset);

  const exportCard=liveCard.cloneNode(true);
  exportCard.id="trainerCardTestMockup";
  exportCard.classList.add("trainer-card-live-visible");
  exportCard.style.display="block";
  exportCard.style.width="1200px";
  exportCard.style.minWidth="1200px";
  exportCard.style.maxWidth="1200px";
  doc.body.appendChild(exportCard);

  if(doc.fonts?.ready){
    try{await doc.fonts.ready}catch(_){}
  }

  const imgs=[...exportCard.querySelectorAll("img")];
  await Promise.all(imgs.map(img=>{
    if(img.complete&&img.naturalWidth)return Promise.resolve();
    return new Promise(resolve=>{
      const done=()=>resolve();
      img.addEventListener("load",done,{once:true});
      img.addEventListener("error",done,{once:true});
      setTimeout(done,3000);
    });
  }));

  // html2canvas can distort object-fit images. Bake the avatar into a
  // transparent bitmap at the exact portrait-box size before capture.
  const exportAvatar=doc.getElementById("ttmAvatar");
  const exportAvatarWrap=exportAvatar?.closest(".ttm-avatar-wrap");
  if(exportAvatar&&exportAvatarWrap&&exportAvatar.naturalWidth&&exportAvatar.naturalHeight){
    const boxW=Math.max(1,Math.round(exportAvatarWrap.clientWidth));
    const boxH=Math.max(1,Math.round(exportAvatarWrap.clientHeight));
    const ratio=Math.min(boxW/exportAvatar.naturalWidth,boxH/exportAvatar.naturalHeight);
    const drawW=Math.max(1,Math.round(exportAvatar.naturalWidth*ratio));
    const drawH=Math.max(1,Math.round(exportAvatar.naturalHeight*ratio));
    const drawX=Math.round((boxW-drawW)/2);
    const drawY=Math.round(boxH-drawH);

    const avatarCanvas=doc.createElement("canvas");
    avatarCanvas.width=boxW;
    avatarCanvas.height=boxH;
    const avatarCtx=avatarCanvas.getContext("2d");
    if(avatarCtx){
      avatarCtx.clearRect(0,0,boxW,boxH);
      avatarCtx.imageSmoothingEnabled=true;
      avatarCtx.imageSmoothingQuality="high";
      avatarCtx.drawImage(exportAvatar,drawX,drawY,drawW,drawH);
      exportAvatar.src=avatarCanvas.toDataURL("image/png");
      exportAvatar.removeAttribute("width");
      exportAvatar.removeAttribute("height");
      exportAvatar.style.width="100%";
      exportAvatar.style.height="100%";
      exportAvatar.style.maxWidth="100%";
      exportAvatar.style.maxHeight="100%";
      exportAvatar.style.objectFit="fill";
      exportAvatar.style.objectPosition="center center";
      await new Promise(resolve=>{
        if(exportAvatar.complete&&exportAvatar.naturalWidth)return resolve();
        exportAvatar.addEventListener("load",resolve,{once:true});
        exportAvatar.addEventListener("error",resolve,{once:true});
        setTimeout(resolve,2000);
      });
    }
  }

  // Exact same text-fit behavior used by the live card.
  const fit=(el,maxPx,minPx)=>{
    if(!el)return;
    el.style.fontSize=maxPx+"px";
    el.style.letterSpacing="";
    let size=maxPx;
    while(size>minPx && el.scrollWidth>el.clientWidth){
      size-=1;
      el.style.fontSize=size+"px";
    }
  };
  fit(doc.getElementById("ttmName"),40,18);
  {
const teamEl=doc.getElementById("ttmTeam");
const teamText=String(teamEl?.textContent||"").trim();
if(teamEl){
  teamEl.style.whiteSpace=teamText.length>12?"normal":"nowrap";
  teamEl.style.lineHeight=teamText.length>12?"1.02":"1.05";
  teamEl.style.overflowWrap="normal";
  fit(teamEl,teamText.length>12?16:22,10);
}
}
  fit(doc.getElementById("ttmCaught"),18,10);
  fit(doc.getElementById("ttmComplete"),18,10);

  await new Promise(resolve=>frame.contentWindow.requestAnimationFrame(
    ()=>frame.contentWindow.requestAnimationFrame(resolve)
  ));

  const canvas=await window.html2canvas(exportCard,{
    backgroundColor:null,
    scale:2,
    useCORS:true,
    allowTaint:false,
    logging:false,
    imageTimeout:8000,
    width:1200,
    height:720,
    windowWidth:1200,
    windowHeight:720,
    scrollX:0,
    scrollY:0
  });

  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
  if(!blob)throw new Error("Could not create PNG");

  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download=`${String(profile?.username||"reading-frenzy").replace(/[^a-z0-9_-]+/gi,"-")}-trainer-card.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
  toast("Trainer Card downloaded.");
}catch(e){
  console.error("Trainer Card exact-approved-layout export failed",e);
  toast("Could not download Trainer Card.");
}finally{
  frame?.remove();
}
}
downloadTrainerCard=downloadTrainerCardWithPokemon;