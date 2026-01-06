// ... (前面代碼保持不變，直到最後的自動截圖功能) ...

// --- 自動截圖功能 ---
document.getElementById('download-btn').addEventListener('click', function() {
    const card = document.getElementById('capture-area');
    const btn = this;
    const originalText = btn.innerText;

    btn.innerText = "正在封裝...";

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
        
        // [修改] 下載完成提示，去標點
        btn.innerText = "已保存至相簿 請發佈限動";
        setTimeout(() => {
            btn.innerText = originalText;
        }, 3000);
    }).catch(err => {
        console.error(err);
        btn.innerText = "儲存失敗，請重試";
    });
});
