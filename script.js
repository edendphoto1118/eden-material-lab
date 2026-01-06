// --- ACCESS CONTROL ---
const CORRECT_CODE = "EDEN2026";
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

// --- 12 ARCHETYPES ALGORITHM ---
function analyzeImage(img) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100; canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);
    
    // 取樣：臉部核心區域
    const imageData = ctx.getImageData(30, 30, 40, 40);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    let brightnessSum = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i+1]; b += data[i+2];
        brightnessSum += (data[i] + data[i+1] + data[i+2]) / 3;
    }
    
    const count = data.length / 4;
    r = r / count; g = g / count; b = b / count;
    
    // 1. 判斷冷暖 (Temp)
    // 簡單算法：紅 > 藍*1.05 為暖 (因膚色多偏暖，稍微嚴格一點)
    const isWarm = r > (b * 1.05);

    // 2. 判斷明度 (Lightness) - 0~255
    const avgBrightness = brightnessSum / count;
    let lightnessLevel = "MED";
    if (avgBrightness > 160) lightnessLevel = "LIGHT"; // 淺色
    else if (avgBrightness < 90) lightnessLevel = "DARK"; // 深色

    // 3. 判斷對比/質地 (Contrast/Texture)
    // 利用最大值與最小值的差異比率模擬
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const contrastRatio = (maxVal - minVal) / maxVal;
    
    // 0.2 是一個經驗閾值，高於此視為銳利/高對比，低於此視為柔和/啞光
    const isHard = contrastRatio > 0.22;

    return { isWarm, lightnessLevel, isHard };
}

function renderResult(data, imgSrc) {
    const bgLayer = document.getElementById('preview-bg');
    bgLayer.style.backgroundImage = `url(${imgSrc})`;
    
    let archetypes = {};

    // --- 定義 12 原型資料庫 ---
    // Key 格式: WARM/COOL + LIGHT/MED/DARK + SOFT/HARD
    
    // 1. WARM GROUP
    archetypes["WARM_LIGHT_SOFT"] = {
        en: "CREAM TRAVERTINE", zh: "米黃洞石",
        mat: "Travertine / Cashmere", light: "Diffused Warm 2700K",
        desc: "你的氣質如同羅馬古建築中的米黃洞石，充滿古典與優雅的韻味。你的立面不需要過度修飾，柔和的漫射暖光最能襯托你細膩、溫潤的層次感。",
        cols: ['#F5F5DC', '#E6D8AD', '#C1B68F']
    };
    archetypes["WARM_LIGHT_HARD"] = {
        en: "CHAMPAGNE MESH", zh: "香檳金屬網",
        mat: "Champagne Gold / Silk", light: "Shimmering Light",
        desc: "你擁有精緻且帶有透亮感的現代奢華特質。如同建築立面上的香檳色金屬網，在光線下閃爍著微光。你需要帶有光澤感的材質來呼應你的高貴氣息。",
        cols: ['#F7E7CE', '#D4AF37', '#FFF8E7']
    };
    archetypes["WARM_MED_SOFT"] = {
        en: "RAW TIMBER", zh: "溫潤原木",
        mat: "Raw Wood / Linen", light: "Natural Sunlight",
        desc: "你的視覺基調如同未經大漆的原木，自帶一種有機、親和且療癒的敘事感。任何人工的過度拋光都會破壞你與生俱來的自然美，保持本真就是最高級。",
        cols: ['#C19A6B', '#8B5A2B', '#EADDCA']
    };
    archetypes["WARM_MED_HARD"] = {
        en: "VINTAGE BRICK", zh: "醇厚紅磚",
        mat: "Brick / Leather", light: "Accent Spot 3000K",
        desc: "你擁有一種復古電影般的文藝存在感，如同歲月沉澱後的紅磚建築。你的面部結構承載得住濃郁的色彩與厚重材質，適合演繹有故事感的經典風格。",
        cols: ['#B22222', '#8B4513', '#A0522D']
    };
    archetypes["WARM_DARK_SOFT"] = {
        en: "CORTEN STEEL", zh: "耐候鋼",
        mat: "Rusted Steel / Wool", light: "Ambient Warm",
        desc: "你的氣質帶有強烈的藝術性與時間感，如同建築大師喜愛的耐候鋼，隨著時間呈現出獨特的橘紅鏽色。你適合粗獷、有質感的材質，展現不隨波逐流的個性。",
        cols: ['#8B3A3A', '#654321', '#800000']
    };
    archetypes["WARM_DARK_HARD"] = {
        en: "TITANIUM BRONZE", zh: "鈦古銅",
        mat: "Bronze / Velvet", light: "Dramatic Hard Light",
        desc: "你對應的是頂級豪宅立面常用的鈦古銅。深邃、霸氣且極具權威感。你能夠駕馭極具戲劇性的光影，在黑暗中閃耀著沈穩的金屬光澤，氣場強大。",
        cols: ['#CD7F32', '#4B3621', '#B87333']
    };

    // 2. COOL GROUP
    archetypes["COOL_LIGHT_SOFT"] = {
        en: "FROSTED GLASS", zh: "霧面玻璃",
        mat: "Frosted Glass / Chiffon", light: "Soft White 4000K",
        desc: "你的氣質空靈、通透，宛如美術館的霧面玻璃立面，將光線柔化成朦朧的詩意。你適合極度輕盈、半透明的材質，展現一種不沾世俗的仙氣。",
        cols: ['#E0FFFF', '#F0F8FF', '#B0E0E6']
    };
    archetypes["COOL_LIGHT_HARD"] = {
        en: "CARRARA MARBLE", zh: "卡拉拉大理石",
        mat: "White Marble / Satin", light: "Crisp Daylight",
        desc: "你如同義大利卡拉拉大理石，白底中帶有清晰冷冽的灰紋。高貴、冷豔且條理分明。你需要乾淨銳利的光線來勾勒你精緻的線條，展現菁英般的距離感。",
        cols: ['#F2F3F4', '#D3D3D3', '#708090']
    };
    archetypes["COOL_MED_SOFT"] = {
        en: "FAIR-FACED CONCRETE", zh: "清水混凝土",
        mat: "Concrete / Cotton", light: "Even Cool Light",
        desc: "你的氣質極淨、克制，宛如安藤忠雄的清水模建築。摒棄一切多餘裝飾，追求本質的純粹。你適合極簡剪裁與低飽和度的灰階色調，展現哲學般的冷靜。",
        cols: ['#D3D3D3', '#A9A9A9', '#778899']
    };
    archetypes["COOL_MED_HARD"] = {
        en: "ANODIZED ALUMINUM", zh: "陽極鋁",
        mat: "Aluminum / Synthetic", light: "Tech Cool",
        desc: "你帶有強烈的未來主義與科技感，如同現代建築的陽極處理鋁板。理性、平滑且精準。你適合帶有光澤的科技布料或金屬配飾，展現前衛的時尚態度。",
        cols: ['#C0C0C0', '#E5E4E2', '#848482']
    };
    archetypes["COOL_DARK_SOFT"] = {
        en: "BLUE SLATE", zh: "深藍板岩",
        mat: "Slate / Denim", light: "Dim Cool",
        desc: "你的氣質內斂而神秘，如同深海般的藍灰色板岩。表面看似平靜，實則蘊含深沉的力量。你適合深色、粗糙質感的材質，在低調中展現不凡的品味。",
        cols: ['#2F4F4F', '#483D8B', '#36454F']
    };
    archetypes["COOL_DARK_HARD"] = {
        en: "OBSIDIAN", zh: "黑曜岩",
        mat: "Black Glass / Leather", light: "High Contrast Spot",
        desc: "你是黑夜中的王者，如同黑曜岩般銳利、漆黑且閃耀。極致的對比度是你最好的武器。大膽嘗試全黑造型與強烈的硬光，展現令人屏息的強大氣場。",
        cols: ['#000000', '#1C1C1C', '#2C3E50']
    };

    // --- 匹配邏輯 ---
    const tempKey = data.isWarm ? "WARM" : "COOL";
    const lightKey = data.lightnessLevel; // LIGHT, MED, DARK
    const hardKey = data.isHard ? "HARD" : "SOFT";
    
    const resultKey = `${tempKey}_${lightKey}_${hardKey}`;
    const result = archetypes[resultKey] || archetypes["WARM_MED_SOFT"]; // Fallback

    // 注入資料
    document.getElementById('material-type-en').innerText = result.en;
    document.getElementById('material-type-zh').innerText = result.zh;
    document.getElementById('lighting-req').innerText = result.light;
    document.getElementById('texture-rec').innerText = result.mat;
    document.getElementById('analysis-text').innerText = result.desc;
    
    const chips = document.getElementById('color-chips');
    chips.innerHTML = '';
    result.cols.forEach(c => {
        let div = document.createElement('div');
        div.className = 'chip';
        div.style.backgroundColor = c;
        chips.appendChild(div);
    });
}

// --- 自動截圖功能 ---
document.getElementById('download-btn').addEventListener('click', function() {
    const card = document.getElementById('capture-area');
    const btn = this;
    const originalText = btn.innerText;

    btn.innerText = "正在儲存...";

    html2canvas(card, {
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff",
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'EDEN_FACADE_REPORT_2026.png';
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        btn.innerText = originalText;
    }).catch(err => {
        console.error(err);
        btn.innerText = "儲存失敗，請重試";
    });
});
