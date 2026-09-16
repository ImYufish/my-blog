(function(){
  'use strict';
  const KEY = 'xiaoten_demo_dark';
  function apply(dark){
    document.documentElement.classList.toggle('dark', !!dark);
    document.body.classList.toggle('dark', !!dark);
  }
  function init(opts){
    opts = opts || {};
    const btnId = opts.btnId;
    const previewSelector = opts.previewSelector;
    // 恢复偏好
    try{
      const saved = localStorage.getItem(KEY);
      const dark = saved === '1';
      apply(dark);
      if(previewSelector){
        const el = document.querySelector(previewSelector);
        if(el) el.classList.toggle('dark', dark);
      }
    }catch(e){}

    if(btnId){
      const btn = document.getElementById(btnId);
      if(btn){
        btn.textContent = '🌓 主题';
        btn.addEventListener('click', ()=>{
          const isDark = !document.documentElement.classList.contains('dark');
          apply(isDark);
          try{ localStorage.setItem(KEY, isDark ? '1' : '0'); }catch(e){}
          if(previewSelector){
            const el = document.querySelector(previewSelector);
            if(el) el.classList.toggle('dark', isDark);
          }
        });
      }
    }
  }
  window.Theme = { init, apply, toggle: function(){ const d = !document.documentElement.classList.contains('dark'); apply(d); try{ localStorage.setItem(KEY, d ? '1':'0'); }catch(e){} } };
})();