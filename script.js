/* Reset básico */
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #eef2f7; }

.container {
    max-width: 1200px; margin: 30px auto; padding: 20px;
    background: #fff; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

h1 { text-align:center; margin-bottom:25px; color:#333; }

.upload-box {
    text-align:center; margin-bottom:25px;
}

.upload-label {
    background: linear-gradient(135deg,#4a73ff,#00c6ff);
    padding: 12px 25px; color:white; font-weight:bold;
    border-radius: 8px; cursor:pointer; transition: 0.3s;
}
.upload-label:hover { opacity: 0.85; }

#imageUpload { display:none; }

.workspace {
    display:flex; flex-wrap:wrap; gap:20px; justify-content:center; align-items:flex-start;
}

.image-area {
    position:relative; border-radius:12px; overflow:hidden;
}

#faceImage { max-width:500px; display:none; border-radius:12px; }

#canvas {
    position:absolute; top:0; left:0;
    display:none; cursor: crosshair;
}

.instruction-box {
    background:#f0f4ff; padding:20px; border-radius:12px;
    width:260px; min-height:120px; box-shadow:0 5px 15px rgba(0,0,0,0.05);
}

.instruction-box h3 { color:#333; margin-bottom:10px; }
.instruction-box p { font-size:16px; color:#555; }

.buttons { text-align:center; margin-top:20px; }
#calculateBtn, #downloadCsvBtn {
    padding:12px 25px; margin:5px; border:none; border-radius:8px; cursor:pointer;
    font-weight:bold; font-size:16px; transition:0.3s;
}
#calculateBtn { background:#28a745; color:white; }
#calculateBtn:hover { opacity:0.85; }
#downloadCsvBtn { background:#ff6b6b; color:white; }
#downloadCsvBtn:hover { opacity:0.85; }

#results {
    margin-top:25px; padding:20px; background:#f9f9f9; border-radius:12px;
    max-height:500px; overflow-y:auto; box-shadow:0 5px 15px rgba(0,0,0,0.05);
}

.metric { margin-bottom:15px; padding-bottom:5px; border-bottom:1px solid #ddd; }
.metric h3 { margin-bottom:5px; color:#444; }
.metric p { font-size:14px; color:#555; margin:2px 0; }
