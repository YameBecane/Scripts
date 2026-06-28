// AUTO DIGITADOR - VERSÃO INSTANTÂNEA
(function() {
    'use strict';

    const NS = '__digitadorInstantaneo__';

    // ---- Limpeza ----
    if (window[NS]) {
        try {
            if (window[NS].listenerInstalado && window[NS].onDocClick) {
                document.removeEventListener('click', window[NS].onDocClick, true);
            }
        } catch (_) {}
    }

    // ---- Estado ----
    window[NS] = {
        aguardandoCampo: false,
        listenerInstalado: false,
        onDocClick: null
    };

    // ---- Listener de clique ----
    function ensureListenerInstalled() {
        if (window[NS].listenerInstalado && window[NS].onDocClick) {
            document.removeEventListener('click', window[NS].onDocClick, true);
            window[NS].listenerInstalado = false;
        }

        const onDocClick = (e) => {
            if (!window[NS].aguardandoCampo) return;

            window[NS].aguardandoCampo = false;

            const el = e.target;
            if (!(el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'))) {
                alert('❌ Isso não é um campo de texto!');
                return;
            }

            const texto = prompt('📋 Cole o texto:');
            if (texto == null) return;

            // ===== INSERE TUDO DE UMA VEZ =====
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = texto;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
                el.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
            } else if (el.isContentEditable) {
                el.innerText = texto;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Para React/Vue
            if (el._reactInternalInstance || el.__reactInternalInstance) {
                const setter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                )?.set;
                if (setter) {
                    setter.call(el, el.value);
                }
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }

            alert('✅ Texto inserido instantaneamente!');
        };

        window[NS].onDocClick = onDocClick;
        document.addEventListener('click', onDocClick, true);
        window[NS].listenerInstalado = true;
    }

    // ---- API ----
    window.inserirInstantaneo = function() {
        ensureListenerInstalled();
        window[NS].aguardandoCampo = true;
        alert('📌 Clique no campo onde deseja inserir o texto');
    };

    // ---- Inicia ----
    window.inserirInstantaneo();

})();
