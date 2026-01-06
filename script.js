// --- ACCESS CONTROL ---
const CORRECT_CODE = "EDEN2025";
const enterBtn = document.getElementById('enter-btn');
const accessInput = document.getElementById('access-code');
const lockScreen = document.getElementById('lock-screen');
const appContainer = document.getElementById('app-container');
const errorMsg = document.getElementById('error-msg');

// 點擊按鈕或按 Enter 鍵觸發
enterBtn.addEventListener('click', checkAccess);
accessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkAccess();
});

function checkAccess() {
    const userCode = accessInput.value.trim().toUpperCase(); // 強制轉大寫
    if (userCode === CORRECT_CODE) {
        // 成功：淡出鎖定頁面，顯示主程式
        lockScreen.style.opacity = '0';
        lockScreen.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            lockScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
        }, 500);
    } else {
        // 失敗
        errorMsg.innerText = "ACCESS DENIED. INCORRECT CODE.";
        accessInput.value = "";
    }
}

// --- MAIN APP LOGIC ---

// 觸發文件選擇
document.getElementById('upload-zone').addEventListener('click', function() {
    document.getElementById('imageInput').click();
});

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
            // 模擬運算時間 (2秒)
            setTimeout(() => {
                renderResult(results, event.target.result);
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('result-section').classList.remove('hidden');
            }, 2000);
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
    
    // 建築系文案 (保留之前的邏輯)
    if (data.isWarm && !data.isHighContrast) {
        type = "TIMBER";
        material = "Linen / Wood / Matte";
        light = "Diffused Warm";
        desc = "你的特質溫潤，如未經打磨的原木。強光會破壞你的質感，建議使用柔和的漫射光與吸光材質。";
        colors = ['#8D6E63', '#D7CCC8', '#5D4037'];
    } else if (data.isWarm && data.isHighContrast) {
        type = "BRICK";
        material = "Leather / Velvet";
        light = "Spot / Dramatic";
        desc = "你擁有強烈的視覺重量。你需要有重量感的材質與戲劇性的點光源來強調深邃輪廓。";
        colors = ['#BF360C', '#FFAB91', '#3E2723'];
    } else if (!data.isWarm && !data.isHighContrast) {
        type = "CONCRETE";
        material = "Cotton / Pure White";
        light = "Soft Cool";
        desc = "你的氣質純淨如清水模。過多的裝飾是累贅，極簡的剪裁與冷白光能最大化你的高級感。";
        colors = ['#CFD8DC', '#90A4AE', '#455A64'];
    } else {
        type = "STEEL";
        material = "Satin / Glass / Black";
        light = "Hard Daylight";
        desc = "你是高對比的冷調存在。大膽嘗試反光材質與銳利的硬光，展現建築鋼構般的俐落感。";
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
    btn.innerText = "RENDERING...";
    
    html2canvas(card, {
        scale: 2, 
        backgroundColor: "#0a0a0a", // 確保下載圖片背景正確
        useCORS: true 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'EDEN_Material_ID.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
        btn.innerText = originalText;
    });
});
