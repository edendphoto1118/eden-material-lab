// --- ACCESS CONTROL ---
const CORRECT_CODE = "EDEN2025";
const enterBtn = document.getElementById('enter-btn');
const accessInput = document.getElementById('access-code');
const lockScreen = document.getElementById('lock-screen');
const appContainer = document.getElementById('app-container');
const errorMsg = document.getElementById('error-msg');

enterBtn.addEventListener('click', checkAccess);
accessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkAccess();
});

function checkAccess() {
    const userCode = accessInput.value.trim().toUpperCase();
    if (userCode === CORRECT_CODE) {
        lockScreen.style.opacity = '0';
        lockScreen.style.transition = 'opacity 0.8s ease-in-out';
        setTimeout(() => {
            lockScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
    } else {
        errorMsg.innerText = "邀請碼錯誤，請確認後再試。";
        accessInput.value = "";
        accessInput.style.borderColor = '#c24f4f';
        setTimeout(() => { accessInput.style.borderColor = ''; }, 500);
    }
}

// --- MAIN APP LOGIC ---
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
            setTimeout(() => {
                renderResult(results, event.target.result);
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('result-section').classList.remove('hidden');
                document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
            }, 2500);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(file);
}

function analyzeImage(img) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100; canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);
    const imageData = ctx.getImageData(35, 35, 30, 30);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i+1]; b += data[i+2];
    }
    const count = data.length / 4;
    r = Math.floor(r / count); g = Math.floor(g / count); b = Math.floor(b / count);
    const isWarm = r > b * 1.1; 
    const max = Math.max(r, g, b); const min = Math.min(r, g, b);
    const contrast = (max - min) / max;
    const isHighContrast = contrast > 0.25; 
    return { isWarm, isHighContrast };
}

function renderResult(data, imgSrc) {
    document.getElementById('preview-img').src = imgSrc;
    let typeEn = "", typeZh = "", material = "", light = "", desc = "", colors = [];
    
    if (data.isWarm && !data.isHighContrast) {
        typeEn = "THE TIMBER MUSE"; typeZh = "溫潤木質調";
        material = "亞麻 / 羊毛 / 原木"; light = "3000K 柔和漫射光";
        desc = "你的視覺基調如同未經雕琢的原木，自帶一種溫暖、沉靜且不張揚的敘事感。你的五官輪廓不需要強烈的切割，而是適合在柔和的光影中暈染出層次。高光與銳利的線條反而會破壞你與生俱來的親和力與高級的慵懶感。";
        colors = ['#A1887F', '#D7CCC8', '#EFEBE9'];
    } else if (data.isWarm && data.isHighContrast) {
        typeEn = "VINTAGE BRICK"; typeZh = "醇厚紅磚調";
        material = "絲絨 / 皮革 / 黃銅"; light = "2700K 戲劇性點光";
        desc = "你擁有一種復古電影般的強烈存在感。你的面部結構承載得住濃郁的色彩與厚重的材質。你不需要過度平滑的光線，相反地，帶有方向性的、戲劇性的光影更能雕刻出你深邃的輪廓，展現出一種經過時間淬鍊的醇厚魅力。";
        colors = ['#8D4E43', '#FFAB91', '#4E342E'];
    } else if (!data.isWarm && !data.isHighContrast) {
        typeEn = "PURE CONCRETE"; typeZh = "清冷清水模";
        material = "純棉 / 銀飾 / 冷白"; light = "4000K 勻淨冷白光";
        desc = "你的氣質極淨，宛如當代建築中的清水模牆面，冷靜、克制且極具現代感。任何繁複的裝飾在你身上都顯得多餘。你適合極簡的剪裁與乾淨、均勻的冷色調光線，這能最大化你那種「毫不費力」的高級疏離感。";
        colors = ['#B0BEC5', '#ECEFF1', '#78909C'];
    } else {
        typeEn = "MODERN STEEL"; typeZh = "俐落鋼構調";
        material = "緞面 / 漆皮 / 墨黑"; light = "5600K 強烈硬光";
        desc = "你是高對比的都會靈魂，如同鋼骨結構般精準、銳利。你能夠駕馭極端的色彩對比與帶有反光性的材質。柔光會模糊你的優勢，你需要的是如正午陽光般銳利的硬光，在你的臉上切分出明確的光影界線，展現強大的氣場。";
        colors = ['#37474F', '#FFFFFF', '#212121'];
    }
    
    document.getElementById('material-type-en').innerText = typeEn;
    document.getElementById('material-type-zh').innerText = typeZh;
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

// --- 下載功能優化 (Clone Method) ---
document.getElementById('download-btn').addEventListener('click', function() {
    const card = document.getElementById('capture-area');
    const btn = this;
    const originalText = btn.innerText;

    btn.innerText = "正在封裝您的報告...";

    // 1. [Clone] 複製卡片，這樣我們可以在後台修改它的尺寸而不影響用戶看到的畫面
    const clone = card.cloneNode(true);
    
    // 2. [Style Clone] 強制設定為手機直式寬度 (420px)，解決寬螢幕導致變形的問題
    clone.style.width = "420px"; 
    clone.style.height = "auto";
    clone.style.position = "fixed";
    clone.style.top = "-9999px"; // 移到畫面外
    clone.style.left = "-9999px";
    clone.style.transform = "none";
    
    // 確保圖片在 Clone 中保持 Object-Fit
    const img = clone.querySelector('img');
    img.style.objectFit = "cover";
    img.style.height = "100%";

    document.body.appendChild(clone);

    // 3. [Capture] 截圖並放大 4 倍 (420px * 4 = 1680px 寬度)，保證高清
    html2canvas(clone, {
        scale: 4, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff",
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'EDEN_Material_Issue_2025.png';
        link.href = canvas.toDataURL("image/png", 1.0); // 最高品質
        link.click();
        
        // 清理
        document.body.removeChild(clone);
        btn.innerText = originalText;
    }).catch(err => {
        console.error(err);
        btn.innerText = "下載失敗，請重試";
        document.body.removeChild(clone);
    });
});
