document.addEventListener('DOMContentLoaded', function() {
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

    function checkAccess() {
        const userCode = accessInput.value.trim().toUpperCase();
        if (userCode === CORRECT_CODE) {
            lockScreen.style.opacity = '0';
            setTimeout(() => {
                lockScreen.classList.add('hidden');
                appContainer.classList.remove('hidden');
            }, 800);
        } else {
            errorMsg.innerText = "邀請碼錯誤。";
        }
    }

    if (enterBtn) enterBtn.addEventListener('click', checkAccess);
    if (accessInput) accessInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkAccess(); });

    if (uploadZone) {
        uploadZone.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => { if(e.target.files[0]) startAnalysis(e.target.files[0]); });
    }

    function startAnalysis(file) {
        uploadZone.classList.add('hidden');
        loader.classList.remove('hidden');
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const results = analyzeImage(img);
                renderResult(results, e.target.result);
                setTimeout(() => {
                    loader.classList.add('hidden');
                    resultSection.classList.remove('hidden');
                }, 2000);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function analyzeImage(img) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = 100; canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        const data = ctx.getImageData(0, 0, 100, 100).data;
        let r=0, g=0, b=0;
        for(let i=0; i<data.length; i+=4) { r+=data[i]; g+=data[i+1]; b+=data[i+2]; }
        const brightness = (r+g+b)/(data.length/4*3);
        return { isWarm: r > b, lightness: brightness > 128 ? "LIGHT" : "DARK" };
    }

    function renderResult(data, imgSrc) {
        document.getElementById('preview-bg').style.backgroundImage = `url(${imgSrc})`;
        // 範例結果渲染
        document.getElementById('material-type-en').innerText = "VINTAGE BRICK";
        document.getElementById('material-type-zh').innerText = "醇厚紅磚";
        document.getElementById('analysis-text').innerText = "你擁有一種復古電影般的文藝存在感，如同歲月沉澱後的紅磚建築。";
        document.getElementById('lighting-req').innerHTML = "Accent Spot 3000K";
        document.getElementById('texture-rec').innerHTML = "Brick / Leather";
        const chips = document.getElementById('color-chips');
        chips.innerHTML = '<div class="chip" style="background:#B22222"></div><div class="chip" style="background:#8B4513"></div><div class="chip" style="background:#A0522D"></div>';
    }

    // --- 核心修正：解決黑白霧化與 CORB 問題 ---
    if(downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const card = document.getElementById('capture-area');
            const btn = this;
            btn.innerText = "GENERATING...";

            window.scrollTo(0, 0);

            html2canvas(card, {
                scale: 3,
                useCORS: true,
                allowTaint: false,
                backgroundColor: "#FFFFFF", // 強制白底，防止黑霧
                logging: true,              // 開啟日誌，方便除錯
                onclone: (clonedDoc) => {
                    const clonedCard = clonedDoc.getElementById('capture-area');
                    
                    // 強制移除所有濾鏡與混合模式（霧化的元兇）
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        .texture-overlay { display: none !important; } 
                        .preview-bg { filter: none !important; opacity: 1 !important; background-color: #fff !important; }
                        * { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
                        .card { transform: none !important; box-shadow: none !important; border: 1px solid #eee !important; }
                        #material-type-en, #material-type-zh { color: #ffffff !important; text-shadow: 2px 2px 4px rgba(0,0,0,0.5) !important; }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `FACADE_REPORT_${Date.now()}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
                btn.innerText = "SAVED SUCCESS";
                setTimeout(() => btn.innerText = "SAVE TO ALBUM", 2000);
            }).catch(err => {
                console.error(err);
                btn.innerText = "SAVE ERROR";
            });
        });
    }
});
