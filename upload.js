
(function () {
    const STORAGE_KEY = 'liveitup_uploads';
 
    function getSaved() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }
 
    function saveEntry(entry) {
        const all = getSaved();
        all.unshift(entry); 
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
 
    function deleteEntry(id) {
        const all = getSaved().filter(e => e.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
 
    function getOrCreateUploadSection() {
        let section = document.getElementById('user-uploads-section');
        if (section) return section;
 
        section = document.createElement('section');
        section.id = 'user-uploads-section';
        section.className = 'channel-section';
 
        const heading = document.createElement('h1');
        heading.id = 'user-uploads-heading';
        heading.innerHTML = '<span class="upload-dot"></span>Your Uploads';
        section.appendChild(heading);
 
        const grid = document.createElement('div');
        grid.className = 'channel-grid';
        grid.id = 'user-uploads-grid';
        section.appendChild(grid);
 
        const container = document.getElementById('image-container');
        container.prepend(section);
 
        return section;
    }
 
    function renderUploadCard(entry) {
        const card = document.createElement('div');
        card.className = 'block user-block';
        card.dataset.uploadId = entry.id;
 
        const img = document.createElement('img');
        img.src = entry.dataUrl;
        img.alt = entry.caption || 'Uploaded image';
        card.appendChild(img);
 
        const title = document.createElement('h2');
        title.innerText = entry.caption || 'Untitled';
        card.appendChild(title);
 
        const meta = document.createElement('p');
        meta.className = 'description';
        meta.innerText = entry.borough !== 'none' ? entry.borough : '';
        card.appendChild(meta);
 
        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.title = 'Remove';
        del.innerHTML = '&times;';
        del.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteEntry(entry.id);
            card.remove();
            syncSectionVisibility();
        });
        card.appendChild(del);
 
        return card;
    }
 
    function syncSectionVisibility() {
        const grid = document.getElementById('user-uploads-grid');
        const section = document.getElementById('user-uploads-section');
        if (!grid || !section) return;
        section.style.display = grid.children.length === 0 ? 'none' : '';
    }
 
    function loadSavedUploads() {
        const saved = getSaved();
        if (saved.length === 0) return;
 
        getOrCreateUploadSection();
        const grid = document.getElementById('user-uploads-grid');
        saved.forEach(entry => grid.appendChild(renderUploadCard(entry)));
        syncSectionVisibility();
    }
 
    function buildModal() {
        const overlay = document.createElement('div');
        overlay.id = 'upload-overlay';
 
        const modal = document.createElement('div');
        modal.id = 'upload-modal';
 
        modal.innerHTML = `
            <button id="modal-close" title="Close">&times;</button>
            <p class="modal-label">DROP AN IMAGE</p>
 
            <div id="drop-zone">
                <div id="drop-inner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Drag &amp; drop or <label for="file-input" id="browse-label">browse</label></span>
                    <span id="drop-filename"></span>
                </div>
                <input type="file" id="file-input" accept="image/*" hidden>
            </div>
 
            <div class="modal-field">
                <label for="caption-input" class="modal-label">CAPTION</label>
                <input type="text" id="caption-input" placeholder="What's the vibe?" maxlength="80">
            </div>
 
            <div class="modal-field">
                <label for="borough-input" class="modal-label">BOROUGH</label>
                <select id="borough-input">
                    <option value="none">— untagged —</option>
                    <option value="Manhattan">Manhattan</option>
                    <option value="Brooklyn">Brooklyn</option>
                    <option value="Queens">Queens</option>
                    <option value="Bronx">Bronx</option>
                    <option value="Staten Island">Staten Island</option>
                </select>
            </div>
 
            <div id="preview-wrap" style="display:none">
                <img id="preview-img" alt="preview">
            </div>
 
            <button id="submit-upload">POST IT</button>
        `;
 
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
 

        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
        modal.querySelector('#modal-close').addEventListener('click', closeModal);
 

        const fileInput = modal.querySelector('#file-input');
        const dropZone  = modal.querySelector('#drop-zone');
        const preview   = modal.querySelector('#preview-img');
        const previewWrap = modal.querySelector('#preview-wrap');
        const filename  = modal.querySelector('#drop-filename');
        let pendingDataUrl = null;
 
        function loadFile(file) {
            if (!file || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                pendingDataUrl = ev.target.result;
                preview.src = pendingDataUrl;
                previewWrap.style.display = 'block';
                filename.innerText = file.name;
            };
            reader.readAsDataURL(file);
        }
 
        fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
 
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            loadFile(e.dataTransfer.files[0]);
        });
 
        modal.querySelector('#submit-upload').addEventListener('click', () => {
            if (!pendingDataUrl) { alert('Please select an image first.'); return; }
 
            const caption = modal.querySelector('#caption-input').value.trim();
            const borough = modal.querySelector('#borough-input').value;
 
            const entry = {
                id: Date.now().toString(),
                dataUrl: pendingDataUrl,
                caption,
                borough,
            };
 
            saveEntry(entry);
            getOrCreateUploadSection();
            const grid = document.getElementById('user-uploads-grid');
            grid.prepend(renderUploadCard(entry));
            syncSectionVisibility();
            closeModal();
        });
 
        return overlay;
    }
 
    let modalEl = null;
 
    function openModal() {
        if (!modalEl) modalEl = buildModal();
        modalEl.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
 
    function closeModal() {
        if (modalEl) modalEl.style.display = 'none';
        document.body.style.overflow = '';
    }
 
    function buildFAB() {
        const btn = document.createElement('button');
        btn.id = 'upload-fab';
        btn.title = 'Upload your photo';
        btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Upload</span>
        `;
        btn.addEventListener('click', openModal);
        document.body.appendChild(btn);
    }
 
    document.addEventListener('DOMContentLoaded', () => {
        buildFAB();
        loadSavedUploads();
    });
 
})();