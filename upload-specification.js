(() => {
  const form = document.getElementById('upload-form');
  const input = document.getElementById('pdf-file');
  const zone = document.getElementById('drop-zone');
  const prompt = document.getElementById('file-prompt');
  const details = document.getElementById('file-details');
  const button = document.getElementById('submit-button');
  const status = document.getElementById('status');
  const maxBytes = 50 * 1024 * 1024;
  let selectedFile = null;

  function setStatus(message, kind = '') {
    status.textContent = message;
    status.className = 'status' + (kind ? ' ' + kind : '');
  }
  function formatSize(bytes) {
    return bytes >= 1024 * 1024 ? (bytes / 1024 / 1024).toFixed(1) + ' MB' : Math.ceil(bytes / 1024) + ' KB';
  }
  function validate(file) {
    if (!file) return 'اختار ملف PDF أولاً.';
    if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) return 'نوع الملف غير مدعوم. ارفع ملف PDF فقط.';
    if (file.size > maxBytes) return 'حجم الملف أكبر من 50 ميجابايت.';
    if (file.size === 0) return 'الملف فارغ. اختار ملفًا آخر.';
    return '';
  }
  function selectFile(file) {
    const error = validate(file);
    if (error) {
      selectedFile = null;
      details.hidden = true;
      button.disabled = true;
      prompt.textContent = 'اسحب ملف PDF هنا أو اضغط للاختيار';
      setStatus(error, 'error');
      return;
    }
    selectedFile = file;
    prompt.textContent = 'تم اختيار ملف المواصفات';
    details.hidden = false;
    details.textContent = file.name + ' · ' + formatSize(file.size);
    button.disabled = false;
    setStatus('');
  }
  input.addEventListener('change', () => selectFile(input.files[0]));
  ['dragenter', 'dragover'].forEach(type => zone.addEventListener(type, event => {
    event.preventDefault(); zone.classList.add('dragging');
  }));
  ['dragleave', 'drop'].forEach(type => zone.addEventListener(type, event => {
    event.preventDefault(); zone.classList.remove('dragging');
  }));
  zone.addEventListener('drop', event => {
    const file = event.dataTransfer.files[0];
    selectFile(file);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const error = validate(selectedFile);
    if (error) return setStatus(error, 'error');
    const data = new FormData();
    data.append('data', selectedFile, selectedFile.name);
    button.disabled = true;
    button.textContent = 'جارٍ إرسال الملف…';
    setStatus('يتم رفع الملف الآن، من فضلك لا تغلق الصفحة.');
    const request = new XMLHttpRequest();
    request.open('POST', '/api/public/pdf-intake');
    request.timeout = 180000;
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        setStatus('تم استلام ملفك بنجاح. شكرًا لثقتك في ATSH AI.', 'success');
        form.reset(); selectedFile = null; details.hidden = true;
        prompt.textContent = 'اسحب ملف PDF هنا أو اضغط للاختيار';
        button.textContent = 'تم الإرسال';
        return;
      }
      setStatus('تعذر إرسال الملف حاليًا. حاول مرة أخرى بعد قليل.', 'error');
      button.disabled = false; button.textContent = 'إعادة المحاولة';
    };
    request.onerror = request.ontimeout = () => {
      setStatus('حدثت مشكلة في الاتصال أو انتهت مهلة الرفع. حاول مرة أخرى.', 'error');
      button.disabled = false; button.textContent = 'إعادة المحاولة';
    };
    request.send(data);
  });
})();
