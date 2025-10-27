(function(){
    const GRID = document.getElementById('grid');
    const TEMPLATE = document.getElementById('cell-template');
    const CANVAS = document.getElementById('snapCanvas');
    const ctx = CANVAS.getContext('2d');
    const downloadBtn = document.getElementById('downloadCollageBtn');
  
    // Crear las 6 celdas
    for(let i=0;i<6;i++){
      const node = TEMPLATE.content.cloneNode(true);
      GRID.appendChild(node);
    }
  
    const cells = Array.from(GRID.querySelectorAll('.cell'));
  
    cells.forEach(setupCell);
  
    function setupCell(cell){
      const startBtn = cell.querySelector('.start');
      const previewDiv = cell.querySelector('.preview');
      const resultDiv = cell.querySelector('.result');
      const captureBtn = cell.querySelector('.capture');
      const deleteBtn = cell.querySelector('.delete');
      const video = cell.querySelector('video');
      const img = cell.querySelector('img');
      let stream = null;
  
      startBtn.addEventListener('click', async ()=>{
        cell.querySelector('.initial').style.display='none';
        previewDiv.style.display='flex';
        try{
          stream = await navigator.mediaDevices.getUserMedia({
            video:{ facingMode:{exact:"user"}, width:{ideal:1280}, height:{ideal:720}},
            audio:false
          });
          video.srcObject = stream;
        }catch(err){
          alert('No se pudo acceder a la cámara');
          console.error(err);
        }
      });
  
      captureBtn.addEventListener('click', ()=>{
        if(!video.srcObject) return;
        const w = video.videoWidth, h = video.videoHeight;
        CANVAS.width = w; CANVAS.height = h;
        ctx.save();
        ctx.translate(w,0); 
        ctx.drawImage(video,0,0,w,h);
        ctx.restore();
        const dataUrl = CANVAS.toDataURL('image/png');
        img.src = dataUrl;
  
        if(stream){
          stream.getTracks().forEach(t=>t.stop());
          stream=null;
        }
        previewDiv.style.display='none';
        resultDiv.style.display='flex';
        checkAllTaken();
      });
  
      deleteBtn.addEventListener('click', ()=>{
        img.src='';
        resultDiv.style.display='none';
        cell.querySelector('.initial').style.display='flex';
        checkAllTaken();
      });
    }
  
    function checkAllTaken(){
      const allDone = Array.from(GRID.querySelectorAll('.result img'))
        .every(img => img.src && img.src.length > 0);
      if(allDone){
        downloadBtn.classList.remove('disabled');
        downloadBtn.disabled = false;
      }else{
        downloadBtn.classList.add('disabled');
        downloadBtn.disabled = true;
      }
    }
  
    downloadBtn.addEventListener('click', async ()=>{
      if(downloadBtn.disabled) return;
  
      // Ocultar botones (delete y download) temporalmente
      const deletes = document.querySelectorAll('.delete');
      deletes.forEach(d => d.style.visibility='hidden');
      downloadBtn.style.visibility='hidden';
  
      // Capturar TODO el body (fondo, título, fotos, etc.)
      await html2canvas(document.body, {
        scale:2,
        useCORS:true,
        ignoreElements: (el) => el === downloadBtn, body
      }).then(canvas=>{
        const link = document.createElement('a');
        link.download = 'color-catcher.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
  
      // Restaurar visibilidad
      deletes.forEach(d => d.style.visibility='visible');
      downloadBtn.style.visibility='visible';
    });
  })();
  