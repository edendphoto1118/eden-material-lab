// ... (保留前面的 Access Control 和 Algorithm 部分) ...

// --- 優化後的自動截圖功能 ---
if(downloadBtn) {
    downloadBtn.addEventListener('click', function() {
        const card = document.getElementById('capture-area');
        const btn = this;
        const originalText = btn.innerText;
        
        // 獲取需要暫時調整的元素
        const noiseOverlay = document.querySelector('.noise-overlay');
        const imageLayer = document.querySelector('.image-layer');
        const coverTitleEn = document.querySelector('.cover-title-en');
        const coverTitleZh = document.querySelector('.cover-title-zh');

        btn.innerText = "正在封裝...";

        // [關鍵步驟 1] 截圖前：暫時移除特效以確保清晰度
        // 移除雜點層 (它會導致 html2canvas 產生霧化)
        if(noiseOverlay) noiseOverlay.style.display = 'none';
        
        // 移除圖片濾鏡 (避免顏色偏差)
        if(imageLayer) {
            imageLayer.style.filter = 'none'; 
            // 確保圖片完全不透明
            imageLayer.style.opacity = '1';
        }

        // 確保文字位置正確 (移除 transform 影響)
        if(coverTitleEn) coverTitleEn.style.transform = 'translateY(0)';
        if(coverTitleZh) coverTitleZh.style.transform = 'translateY(0)';

        // [關鍵步驟 2] 強制設定高解析度參數
        html2canvas(card, {
            scale: 3, // 3倍縮放 (Retina級清晰度)
            useCORS: true, // 允許跨域圖片
            allowTaint: true,
            backgroundColor: "#ffffff", // 強制白底
            logging: false, // 關閉日誌加快速度
            width: 375, // [強制鎖定寬度]
            height: 667, // [強制鎖定高度]
            windowWidth: 375,
            windowHeight: 667,
            onclone: (clonedDoc) => {
                // 在複製的 DOM 中確保沒有任何 CSS transform 影響版面
                const clonedCard = clonedDoc.getElementById('capture-area');
                if(clonedCard) {
                    clonedCard.style.transform = 'none';
                    clonedCard.style.boxShadow = 'none'; // 移除陰影避免邊緣瑕疵
                }
            }
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'EDEN_FACADE_REPORT_2026.png';
            link.href = canvas.toDataURL("image/png", 1.0); // 使用最高品質
            link.click();
            
            btn.innerText = "已保存至相簿 請發佈限動";
            setTimeout(() => { btn.innerText = originalText; }, 3000);

            // [關鍵步驟 3] 截圖後：恢復所有特效
            if(noiseOverlay) noiseOverlay.style.display = 'block';
            if(imageLayer) imageLayer.style.filter = ''; // 恢復 CSS 定義的濾鏡
            // 其他樣式會自動由 CSS class 控制，無需手動恢復
            
        }).catch(err => {
            console.error("截圖失敗:", err);
            btn.innerText = "儲存失敗，請重試";
            
            // 發生錯誤也要記得恢復特效
            if(noiseOverlay) noiseOverlay.style.display = 'block';
            if(imageLayer) imageLayer.style.filter = '';
        });
    });
}
