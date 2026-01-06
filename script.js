document.getElementById('imageInput').addEventListener('change', function(e) {
    if(e.target.files && e.target.files[0]) {
        startAnalysis(e.target.files[0]);
    }
});

function startAnalysis(file) {
    document.getElementById('upload-zone').classList.add('hidden');
    document.getElementById('loader').classList.remove('hidden');
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            const results = analyzeImage(img);
            setTimeout(() => {
                renderResult(results, event.target.result);
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('result-section').classList.remove('hidden');
            }, 1500);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

function analyzeImage(img) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100; 
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);
    
    const imageData = ctx.getImageData(30, 30, 40, 40);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i+1]; b += data[i+2];
    }
    
    const count = data.length / 4;
    r = Math.floor(r / count); g = Math.floor(g / count); b = Math.floor(b / count);
    
    const isWarm = r > b; 
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const isHighContrast = ((max - min) / max) > 0.15;
    
    return { isWarm, isHighContrast };
}

function renderResult(data, imgSrc) {
    document.getElementById('preview-img').src = imgSrc;
    
    let type = "", material = "", light = "", desc = "", colors = [];
    
    if (data.isWarm && !data.isHighContrast) {
        type = "TIMBER (木質調)";
        material = "LINEN / WOOD / EARTH";
        light = "WARM 3000K / DIFFUSED";
        desc = "你的特質溫潤且低反射。高光會讓你的質感流失，建議使用漫射光與吸光材質。";
        colors = ['#8D6E63', '#D7CCC8', '#5D4037'];
    } else if (data.isWarm && data.isHighContrast) {
        type = "BRICK (紅磚調)";
        material = "LEATHER / VELVET / BRASS";
        light = "WARM 2700K / SPOT";
        desc = "你擁有強烈的視覺重量。你需要有重量感的材質與戲劇性的點光源來強調輪廓。";
        colors = ['#BF360C', '#FFAB91', '#3E2723'];
    } else if (!data.isWarm && !data.isHighContrast) {
        type = "CONCRETE (清水模)";
        material = "COTTON / PURE WHITE / SILVER";
        light = "COOL 4000K / SOFT";
        desc = "你的氣質純淨。簡單的剪裁與冷白光能最大化你的高級感。";
        colors = ['#CFD8DC', '#90A4AE', '#455A64'];
    } else {
        type = "STEEL (鋼構調)";
        material = "SATIN / GLASS / BLACK";
        light = "DAYLIGHT 5600K / HARD";
        desc = "你是高對比的冷調存在。大膽嘗試反光材質與銳利的硬光，展現俐落感。";
        colors = ['#263238', '#ECEFF1', '#000000'];
    }
    
    document.getElementById('material-type').innerText = type;
    document.getElementById('lighting-req').innerText = light;
    document.getElementById('texture-rec').innerText = material;
    document.getElementById('analysis-text').innerText = desc;
    
    const chips = document.getElementById('color-chips');
    chips.innerHTML = '';
    colors.forEach(c => {
        let div = document.createElement('div');
        div.className = 'chip';
        div.style.backgroundColor = c;
        chips.appendChild(div);
    });
}

// Download Function
document.getElementById('download-btn').addEventListener('click', function() {
    const card = document.getElementById('capture-area');
    const btn = this;
    const originalText = btn.innerText;
    btn.innerText = "GENERATING...";
    
    html2canvas(card, {
        scale: 2, 
        backgroundColor: "#141414",
        useCORS: true 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'EDEN_Material_ID.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
        btn.innerText = originalText;
    });
});
