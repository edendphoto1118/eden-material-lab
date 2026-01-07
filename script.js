// --- 5. [終極修正] 解決黑白霧化，還原第一張圖質感 ---
    if(downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const card = document.getElementById('capture-area');
            const btn = this;
            const originalText = btn.innerText;

            btn.innerText = "正在封裝...";

            // 1. 先處理捲動軸問題，避免位移
            window.scrollTo(0, 0);

            // 2. 暫時記錄原始樣式
            const originalTransform = card.style.transform;
            card.style.transform = 'none';

            html2canvas(card, {
                scale: 3,               // 高解析度
                useCORS: true,          // 支援跨域圖片
                allowTaint: false,      // 防止污染
                backgroundColor: null,  // 重要：設為 null 保持透明底，不強制補黑或補白
                logging: false,
                width: card.offsetWidth,
                height: card.offsetHeight,
                onclone: (clonedDoc) => {
                    // 3. 在克隆出來的層裡面「動手術」，確保不會影響到網頁畫面
                    const clonedCard = clonedDoc.getElementById('capture-area');
                    clonedCard.style.transform = 'none';
                    clonedCard.style.boxShadow = 'none';
                    
                    // 針對霧化問題：強制移除可能導致渲染錯誤的 CSS 濾鏡
                    const overlays = clonedCard.querySelectorAll('.texture-overlay, .mask-reveal');
                    overlays.forEach(el => {
                        el.style.backdropFilter = 'none'; // 移除最干擾的毛玻璃
                        el.style.webkitBackdropFilter = 'none';
                        // 如果圖片還是太暗，可以取消下面這一行的註解
                        // el.style.backgroundColor = 'transparent'; 
                    });
                }
            }).then(canvas => {
                // 4. 匯出 PNG 格式，確保層次感正確
                const imageData = canvas.toDataURL("image/png");
                
                const link = document.createElement('a');
                link.download = `THE_FACADE_REPORT_${Date.now()}.png`;
                link.href = imageData;
                link.click();
                
                btn.innerText = "已保存至相簿 SAVED";
                setTimeout(() => { btn.innerText = originalText; }, 3000);

                // 恢復網頁上的 3D 效果
                card.style.transform = originalTransform;

            }).catch(err => {
                console.error("截圖失敗:", err);
                btn.innerText = "儲存失敗，請重試";
                card.style.transform = originalTransform;
            });
        });
    }
