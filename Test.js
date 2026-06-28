// DIGITADOR INSTANTÂNEO - Mesmo método funcionando, mas super rápido
(function() {
    'use strict';

    const NS = '__digitadorRapido__';

    // ---- Limpeza ----
    if (window[NS]) {
        try {
            if (window[NS].listenerInstalado && window[NS].onDocClick) {
                document.removeEventListener('click', window[NS].onDocClick, true);
            }
            if (window[NS].typingTimeoutId) clearTimeout(window[NS].typingTimeoutId);
        } catch (_) {}
    }

    // ---- Estado ----
    window[NS] = {
        aguardandoCampo: false,
        listenerInstalado: false,
        onDocClick: null,
        typingTimeoutId: null,
        currentElement: null,
        currentText: '',
        currentIndex: 0
    };

    // ---- Listener de clique ----
    function ensureListenerInstalled() {
        if (window[NS].listenerInstalado && window[NS].onDocClick) {
            document.removeEventListener('click', window[NS].onDocClick, true);
            window[NS].listenerInstalado = false;
        }

        const onDocClick = (e) => {
            if (!window[NS].aguardandoCampo) return;

            const path = e.composedPath ? e.composedPath() : [];
            if (path.some(n => n && n.id && String(n.id).startsWith('digitadorV2-'))) return;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            window[NS].aguardandoCampo = false;

            const el = e.target;
            if (!(el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'))) {
                alert('❌ Isso não é um campo de texto!');
                return;
            }

            const texto = prompt('📋 Cole ou digite o texto:');
            if (texto == null) return;

            // Velocidade MÁXIMA (1ms entre caracteres) - parece instantâneo
            iniciarDigitacao(el, texto, 1);
        };

        window[NS].onDocClick = onDocClick;
        document.addEventListener('click', onDocClick, true);
        window[NS].listenerInstalado = true;
    }

    // ---- Funções de inserção ----
    function inserirCharEmInput(el, ch) {
        try {
            let pos = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;

            if (typeof el.setRangeText === 'function') {
                el.setRangeText(ch, pos, pos, 'end');
            } else {
                const v = el.value || '';
                const before = v.slice(0, pos);
                const after = v.slice(pos);
                el.value = before + ch + after;
                const newPos = pos + ch.length;
                try { el.setSelectionRange(newPos, newPos); } catch (_) {}
            }
        } catch (err) {
            el.value = (el.value || '') + ch;
        }
    }

    function inserirCharEmContentEditable(el, ch) {
        try {
            const doc = el.ownerDocument || document;
            const sel = doc.getSelection ? doc.getSelection() : null;
            let range;
            if (sel && sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (!el.contains(range.commonAncestorContainer)) {
                    range = null;
                }
            }
            if (!range) {
                range = doc.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
            }
            const txtNode = doc.createTextNode(ch);
            range.insertNode(txtNode);
            range.setStartAfter(txtNode);
            range.collapse(true);
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } catch (err) {
            el.innerText = (el.innerText || '') + ch;
        }
    }

    // ---- Função principal de digitação (velocidade máxima) ----
    function iniciarDigitacao(el, texto, velocidade) {
        if (window[NS].typingTimeoutId) {
            clearTimeout(window[NS].typingTimeoutId);
            window[NS].typingTimeoutId = null;
        }

        window[NS].currentElement = el;
        window[NS].currentText = texto;
        window[NS].currentIndex = 0;

        const isInputEl = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
        const isContentEditable = !!el.isContentEditable;

        let prevReadOnly = null;
        try {
            if (isInputEl) {
                prevReadOnly = el.readOnly;
                el.readOnly = true;
                try { el.focus({ preventScroll: true }); } catch (_) { try { el.focus(); } catch (_) {} }
                try {
                    const len = el.value ? el.value.length : 0;
                    el.setSelectionRange(len, len);
                } catch (_) {}
            }
        } catch (_) {}

        let i = 0;

        function digitarProximoCaractere() {
            if (i < texto.length) {
                const c = texto[i++];

                if (isInputEl) {
                    inserirCharEmInput(el, c);
                } else if (isContentEditable) {
                    inserirCharEmContentEditable(el, c);
                } else {
                    try { el.innerText = (el.innerText || '') + c; } catch (_) {}
                }

                try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
                if (i % 50 === 0) {
                    try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
                }

                window[NS].currentIndex = i;
                
                // Velocidade MÁXIMA - 1ms entre caracteres (quase instantâneo)
                window[NS].typingTimeoutId = setTimeout(digitarProximoCaractere, velocidade || 1);
            } else {
                window[NS].typingTimeoutId = null;

                try {
                    if (isInputEl) {
                        try { el.blur(); } catch (_) {}
                        if (prevReadOnly !== null && typeof prevReadOnly !== 'undefined') {
                            try { el.readOnly = prevReadOnly; } catch (_) {}
                        } else {
                            try { el.readOnly = false; } catch (_) {}
                        }
                    }
                } catch (_) {}

                try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
                try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (_) {}

                alert('✅ Texto digitado instantaneamente!');
            }
        }

        alert('🚀 Digitando em velocidade máxima...');
        window[NS].typingTimeoutId = setTimeout(digitarProximoCaractere, 10);
    }

    // ---- API ----
    window.digitarInstantaneo = function() {
        ensureListenerInstalled();
        window[NS].aguardandoCampo = true;
        alert('✍️ Clique no campo onde deseja digitar o texto.');
    };

    // ---- Inicia ----
    window.digitarInstantaneo();

})();
