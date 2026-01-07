document.addEventListener('DOMContentLoaded', function() {
    // --- 1. 定義 DOM 元素 ---
    const enterBtn = document.getElementById('enter-btn');
    const accessInput = document.getElementById('access-code');
    const lockScreen = document.getElementById('lock-screen');
    const appContainer = document.getElementById('app-container');
    const errorMsg = document.getElementById('error-msg');
    const uploadZone = document.getElementById('upload-zone');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('result-section');
    const loadingText = document.getElementById('loading-text');
    const imageInput = document.getElementById('imageInput');
    const downloadBtn = document.getElementById('download-btn');

    const CORRECT_CODE = "EDEN2026";

    // --- 2. 門禁系統邏輯 ---
    function checkAccess() {
        const userCode = accessInput.value.trim().toUpperCase();
        if (userCode === CORRECT_CODE) {
            lockScreen.style.opacity = '0';
            lockScreen.style.transition = 'opacity 0.8s ease-in-out';
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                if(appContainer) {
                    appContainer.classList.remove('hidden');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 800);
        } else {
            errorMsg.innerText = "邀請碼錯誤，請確認後再試。";
            accessInput.value = "";
            accessInput.style.borderColor = '#c24f4f';
            setTimeout(() => { accessInput.style.borderColor = ''; }, 500);
        }
    }

    if (enterBtn) enterBtn.addEventListener('click', checkAccess);
    if (accessInput) accessInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') checkAccess(); });

    // --- 3. 圖片上傳與分析邏輯 ---
    if (uploadZone && imageInput) {
        uploadZone.addEventListener('click', function() { imageInput.click(); });
        imageInput.addEventListener('change', function(e) { if(e.target.files && e.target.files[0]) startAnalysis(e.target.files[0]); });
    }

    const loadingSequence = ["CALCULATING SURFACE GEOMETRY...", "SAMPLING SKIN TEXTURE...", "ANALYZING LIGHT PATH...", "MATCHING FACADE ARCHETYPE...", "GENERATING ISSUE #2026..."];

    function startAnalysis(file) {
        if(uploadZone) uploadZone.classList.add('hidden');
        if(loader) loader.classList.remove('hidden');
        let step = 0;
        if(loadingText) loadingText.innerText = loadingSequence[0];
        const loadingInterval = setInterval(() => {
            step++;
            if (loadingText && step < loadingSequence.length) loadingText.innerText = loadingSequence[step];
        }, 600);

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const results = analyzeImage(img);
                setTimeout(() => {
                    clearInterval(loadingInterval);
                    renderResult(results, event.target.result);
                    if(loader) loader.classList.add('hidden');
                    if(resultSection) {
                        resultSection.classList.remove('hidden');
                        setTimeout(() => {
                            resultSection.classList.add('animate-in');
                            const layer = document.querySelector('.image-layer');
                            if(layer) layer.classList.add('developed');
                        }, 100);
                        resultSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 3000);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }

    // --- 4. 12原型核心演算法 ---
    function analyzeImage(img) {
        const canvas = document.getElementById('canvas');
        if(!canvas) return { isWarm: true, lightnessLevel: "MED", isHard: false };

        const ctx = canvas.getContext('2d');
        const processSize = 200;
        canvas.width = processSize; canvas.height = processSize;
        const ratio = Math.max(processSize / img.width, processSize / img.height);
        const centerShift_x = (processSize - img.width * ratio) / 2;
        const centerShift_y = (processSize - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        
        const startX = processSize * 0.25; const endX = processSize * 0.75;
        const startY = processSize * 0.20; const endY = processSize * 0.80;
        const imageData = ctx.getImageData(startX, startY, endX - startX, endY - startY);
        const data = imageData.data;
        
        let rSum = 0, gSum = 0, bSum = 0;
        let skinPixelCount = 0;
        let brightnessSum = 0;
        let maxBrightness = 0; let minBrightness = 255;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i]; const g = data[i+1]; const b = data[i+2];
            const brightness = (r + g + b) / 3;
            const isLikelySkin = (r > b) && (brightness > 30 && brightness < 245);
            if (isLikelySkin) {
                rSum += r; gSum += g; bSum += b;
                brightnessSum += brightness;
                skinPixelCount++;
                if (brightness > maxBrightness) maxBrightness = brightness;
                if (brightness < minBrightness) minBrightness = brightness;
            }
        }
        
        if (skinPixelCount < 50) { 
            skinPixelCount = 1; rSum = 180; gSum = 170; bSum = 160; brightnessSum = 170; maxBrightness = 180; minBrightness = 160;
        }

        const rAvg = rSum / skinPixelCount; const bAvg = bSum / skinPixelCount;
        const isWarm = rAvg > (bAvg * 1.1); 
        const avgBrightness = brightnessSum / skinPixelCount;
        let lightnessLevel = "MED";
        if (avgBrightness > 170) lightnessLevel = "LIGHT"; else if (avgBrightness < 100) lightnessLevel = "DARK";
        const localContrast = (maxBrightness - minBrightness) / maxBrightness;
        const isHard = localContrast > 0.35;

        return { isWarm, lightnessLevel, isHard };
    }

    function renderResult(data, imgSrc) {
        const bgLayer = document.getElementById('preview-bg');
        if(bgLayer) { bgLayer.classList.remove('developed'); bgLayer.style.backgroundImage = `url(${imgSrc})`; }
        
        let archetypes = {};
        archetypes["WARM_LIGHT_SOFT"] = { en: "CREAM TRAVERTINE", zh: "米黃洞石", mat: "Travertine / Cashmere<span class='zh-sub'>洞石 / 羊絨</span>", light: "Diffused Warm 2700K<span class='zh-sub'>2700K 柔和漫射光</span>", desc: "你的氣質如同羅馬古建築中的米黃洞石，充滿古典與優雅的韻味。你的立面不需要過度修飾，柔和的漫射暖光最能襯托你細膩、溫潤的層次感。", cols: ['#F5F5DC', '#E6D8AD', '#C1B68F'] };
        archetypes["WARM_LIGHT_HARD"] = { en: "CHAMPAGNE MESH", zh: "香檳金屬網", mat: "Champagne Gold / Silk<span class='zh-sub'>香檳金 / 絲綢</span>", light: "Shimmering Light<span class='zh-sub'>微光閃爍</span>", desc: "你擁有精緻且帶有透亮感的現代奢華特質。如同建築立面上的香檳色金屬網，在光線下閃爍著微光。你需要帶有光澤感的材質來呼應你的高貴氣息。", cols: ['#F7E7CE', '#D4AF37', '#FFF8E7'] };
        archetypes["WARM_MED_SOFT"] = { en: "RAW TIMBER", zh: "溫潤原木", mat: "Raw Wood / Linen<span class='zh-sub'>原木 / 亞麻</span>", light: "Natural Sunlight<span class='zh-sub'>自然日照</span>", desc: "你的視覺基調如同未經大漆的原木，自帶一種有機、親和且療癒的敘事感。任何人工的過度拋光都會破壞你與生俱來的自然美，保持本真就是最高級。", cols: ['#C19A6B', '#8B5A2B', '#EADDCA'] };
        archetypes["WARM_MED_HARD"] = { en: "VINTAGE BRICK", zh: "醇厚紅磚", mat: "Brick / Leather<span class='zh-sub'>紅磚 / 皮革</span>", light: "Accent Spot 3000K<span class='zh-sub'>3000K 重點投射光</span>", desc: "你擁有一種復古電影般的文藝存在感，如同歲月沉澱後的紅磚建築。你的面部結構承載得住濃郁的色彩與厚重材質，適合演繹有故事感的經典風格。", cols: ['#B22222', '#8B4513', '#A0522D'] };
        archetypes["WARM_DARK_SOFT"] = { en: "CORTEN STEEL", zh: "耐候鋼", mat: "Rusted Steel / Wool<span class='zh-sub'>耐候鋼 / 羊毛</span>", light: "Ambient Warm<span class='zh-sub'>暖調氛圍光</span>", desc: "你的氣質帶有強烈的藝術性與時間感，如同建築大師喜愛的耐候鋼，隨著時間呈現出獨特的橘紅鏽色。你適合粗獷、有質感的材質，展現不隨波逐流的個性。", cols: ['#8B3A3A', '#654321', '#800000'] };
        archetypes["WARM_DARK_HARD"] = { en: "TITANIUM BRONZE", zh: "鈦古銅", mat: "Bronze / Velvet<span class='zh-sub'>鈦古銅 / 絲絨</span>", light: "Dramatic Hard Light<span class='zh-sub'>戲劇性硬光</span>", desc: "你對應的是頂級豪宅立面常用的鈦古銅。深邃、霸氣且極具權威感。你能夠駕馭極具戲劇性的光影，在黑暗中閃耀著沈穩的金屬光澤，氣場強大。", cols: ['#CD7F32', '#4B3621', '#B87333'] };
        archetypes["COOL_LIGHT_SOFT"] = { en: "FROSTED GLASS", zh: "霧面玻璃", mat: "Frosted Glass / Chiffon<span class='zh-sub'>霧面玻璃 / 雪紡</span>", light: "Soft White 4000K<span class='zh-sub'>4000K 柔和白光</span>", desc: "你的氣質空靈、通透，宛如美術館的霧面玻璃立面，將光線柔化成朦朧的詩意。你適合極度輕盈、半透明的材質，展現一種不沾世俗的仙氣。", cols: ['#E0FFFF', '#F0F8FF', '#B0E0E6'] };
        archetypes["COOL_LIGHT_HARD"] = { en: "CARRARA MARBLE", zh: "卡拉拉大理石", mat: "White Marble / Satin<span class='zh-sub'>大理石 / 緞面</span>", light: "Crisp Daylight<span class='zh-sub'>清冽日光</span>", desc: "你如同義大利卡拉拉大理石，白底中帶有清晰冷冽的灰紋。高貴、冷豔且條理分明。你需要乾淨銳利的光線來勾勒你精緻的線條，展現菁英般的距離感。", cols: ['#F2F3F4', '#D3D3D3', '#708090'] };
        archetypes["COOL_MED_SOFT"] = { en: "FAIR-FACED CONCRETE", zh: "清水混凝土", mat: "Concrete / Cotton<span class='zh-sub'>清水模 / 純棉</span>", light: "Even Cool Light<span class='zh-sub'>勻淨冷光</span>", desc: "你的氣質極淨、克制，宛如安藤忠雄的清水模建築。摒棄一切多餘裝飾，追求本質的純粹。你適合極簡剪裁與低飽和度的灰階色調，展現哲學般的冷靜。", cols: ['#D3D3D3', '#A9A9A9', '#778899'] };
        archetypes["COOL_MED_HARD"] = { en: "ANODIZED ALUMINUM", zh: "陽極鋁", mat: "Aluminum / Synthetic<span class='zh-sub'>陽極鋁 / 機能布料</span>", light: "Tech Cool<span class='zh-sub'>科技冷光</span>", desc: "你帶有強烈的未來主義與科技感，如同現代建築的陽極處理鋁板。理性、平滑且精準。你適合帶有光澤的科技布料或金屬配飾，展現前衛的時尚態度。", cols: ['#C0C0C0', '#E5E4E2', '#848482'] };
        archetypes["COOL_DARK_SOFT"] = { en: "BLUE SLATE", zh: "深藍板岩", mat: "Slate / Denim<span class='zh-sub'>板岩 / 丹寧</span>", light: "Dim Cool<span class='zh-sub'>微光冷調</span>", desc: "你的氣質內斂而神秘，如同深海般的藍灰色板岩。表面看似平靜，實則蘊含深沉的力量。你適合深色、粗糙質感的材質，在低調中展現不凡的品味。", cols: ['#2F4F4F', '#483D8B', '#36454F'] };
        archetypes["COOL_DARK_HARD"] = { en: "OBSIDIAN", zh: "黑曜岩", mat: "Black Glass / Leather<span class='zh-sub'>黑玻 / 皮革</span>", light: "High Contrast Spot<span class='zh-sub'>高反差點光</span>", desc: "你是黑夜中的王者，如同黑曜岩般銳利、漆黑且閃耀。極致的對比度是你最好的武器。大膽嘗試全黑造型與強烈的硬光，展現令人屏息的強大氣場。", cols: ['#000000', '#1C1C1C', '#2C3E50'] };

        const tempKey = data.isWarm ? "WARM" : "COOL";
        const lightKey = data.lightnessLevel; const hardKey = data.isHard ? "HARD" : "SOFT";
        const resultKey = `${tempKey}_${lightKey}_${hardKey}`;
        const result = archetypes[resultKey] || archetypes["WARM_MED_SOFT"]; 

        if(document.getElementById('material-type-en')) document.getElementById('material-type-en').innerText = result.en;
        if(document.getElementById('material-type-zh')) document.getElementById('material-type-zh').innerText = result.zh;
        if(document.getElementById('lighting-req')) document.getElementById('lighting-req').innerHTML = result.light;
        if(document.getElementById('texture-rec')) document.getElementById('texture-rec').innerHTML = result.mat;
        if(document.getElementById('analysis-text')) document.getElementById('analysis-text').innerText = result.desc;
        
        const chips = document.getElementById('color-chips');
        if(chips) { chips.innerHTML = ''; result.cols.forEach(c => { let div = document.createElement('div'); div.className = 'chip'; div.style.backgroundColor = c; chips.appendChild(div); }); }
    }

    // --- 5. [重寫] 儲存功能：使用 onclone 技術解決霧化與變形 ---
    if(downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const card = document.getElementById('capture-area');
            const btn = this;
            const originalText = btn.innerText;

            btn.innerText = "正在封裝...";

            html2canvas(card, {
                scale: 2, // 使用穩定的 2 倍縮放
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#fff",
                onclone: (documentClone) => {
                    const clone = documentClone.getElementById('capture-area');
                    
                    // 1. 強制重置變形與邊距
                    clone.style.transform = 'none';
                    clone.style.boxShadow = 'none';
                    clone.style.margin = '0';

                    // 2. 解決 "Texture Fog" (漸層變灰)
                    const texture = clone.querySelector('.texture-overlay');
                    if (texture) {
                        texture.style.mixBlendMode = 'normal';
                        texture.style.background = 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)'; 
                    }

                    // 3. 解決 "Noise Fog" (雜點變白霧) - 直接隱藏
                    const noise = clone.querySelector('.noise-overlay');
                    if (noise) {
                        noise.style.display = 'none';
                    }

                    // 4. [新增] 移除照片濾鏡，確保不模糊
                    const imgLayer = clone.querySelector('.image-layer');
                    if(imgLayer) {
                        imgLayer.style.filter = 'none';
                    }
                }
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'EDEN_FACADE_REPORT_2026.png';
                link.href = canvas.toDataURL("image/png");
                link.click();
                
                btn.innerText = "已保存至相簿 SAVED";
                setTimeout(() => { btn.innerText = originalText; }, 3000);
            }).catch(err => {
                console.error("截圖失敗:", err);
                btn.innerText = "儲存失敗，請重試";
            });
        });
    }
});
