// DIGITADOR INSTANTÂNEO - Digita tudo de uma vez (mesmo método que funciona)
(function() {
    'use strict';

    const NS = '__digitadorTurbo__';

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
        typingTimeoutId: null
    };

    // ============================================
    // FUNÇÃO QUE INSERE TUDO DE UMA VEZ
    // ============================================
    function inserirTextoInstantaneo(el, texto) {
        // Salva o texto original para referência
        const textoOriginal = texto;
        
        // ===== PARA INPUT E TEXTAREA =====
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            // Insere o texto completo
            el.value = texto;
            
            // Move o cursor para o final
            try {
                el.setSelectionRange(texto.length, texto.length);
            } catch(_) {}
            
            // Dispara eventos (CRUCIAIS para o site detectar)
            el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            
            // Dispara eventos de teclado
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keypress', { key: 'a', bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
            
            // ===== PARA REACT =====
            if (el._reactInternalInstance || el.__reactInternalInstance) {
                const nativeSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype, 'value'
                )?.set;
                if (nativeSetter) {
                    nativeSetter.call(el, el.value);
                }
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            // ===== PARA VUE =====
            if (el.__vue__ || el._vnode) {
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            // ===== PARA ANGULAR =====
            if (el.ngControl || el._ngZone) {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
            
        // ===== PARA CONTENTEDITABLE =====
        } else if (el.isContentEditable) {
            el.innerText = texto;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Dispara evento de foco/blur para garantir
        try {
            el.dispatchEvent(new Event('focus', { bubbles: true }));
            el.dispatchEvent(new Event('blur', { bubbles: true }));
            el.dispatchEvent(new Event('focusout', { bubbles: true }));
        } catch(_) {}

        // Força o scroll para o final
        try {
            el.scrollTop = el.scrollHeight;
        } catch(_) {}

        console.log('✅ Texto inserido instantaneamente!');
        console.log(`📝 ${texto.length} caracteres inseridos`);
    }

    // ============================================
    // LISTENER DE CLIQUE
    // ============================================
    function ensureListenerInstalled() {
        if (window[NS].listenerInstalado && window[NS].onDocClick) {
            document.removeEventListener('click', window[NS].onDocClick, true);
            window[NS].listenerInstalado = false;
        }

        const onDocClick = (e) => {
            if (!window[NS].aguardandoCampo) return;

            window[NS].aguardandoCampo = false;

            const el = e.target;
            
            // Verifica se é um campo de texto válido
            if (!(el && (el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'))) {
                alert('❌ Isso não é um campo de texto!');
                return;
            }

            const texto = prompt('📋 Cole ou digite o texto:');
            if (texto == null || texto.trim() === '') {
                alert('❌ Texto vazio!');
                return;
            }

            // ===== INSERE TUDO DE UMA VEZ =====
            alert('🚀 Inserindo texto...');
            inserirTextoInstantaneo(el, texto);
            alert('✅ Texto inserido com sucesso!');
        };

        window[NS].onDocClick = onDocClick;
        document.addEventListener('click', onDocClick, true);
        window[NS].listenerInstalado = true;
    }

    // ============================================
    // FUNÇÃO PARA INSERIR NO CAMPO SELECIONADO
    // ============================================
    function inserirNoCampoSelecionado() {
        const el = document.activeElement;
        
        if (!el) {
            alert('❌ Nenhum campo selecionado! Clique no campo primeiro.');
            return;
        }

        if (!(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
            alert('❌ O elemento selecionado não é um campo de texto!');
            return;
        }

        const texto = prompt('📋 Cole ou digite o texto:');
        if (texto == null || texto.trim() === '') {
            alert('❌ Texto vazio!');
            return;
        }

        alert('🚀 Inserindo texto...');
        inserirTextoInstantaneo(el, texto);
        alert('✅ Texto inserido com sucesso!');
    }

    // ============================================
    // FUNÇÃO PARA INSERIR DIRETO (sem prompt)
    // ============================================
    function inserirTextoDireto(texto) {
        const el = document.activeElement;
        
        if (!el) {
            alert('❌ Nenhum campo selecionado!');
            return;
        }

        if (!(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
            alert('❌ O elemento selecionado não é um campo de texto!');
            return;
        }

        inserirTextoInstantaneo(el, texto);
        alert('✅ Texto inserido com sucesso!');
    }

    // ============================================
    // API PÚBLICA
    // ============================================
    window.digitarInstantaneo = function() {
        ensureListenerInstalled();
        window[NS].aguardandoCampo = true;
        alert('✍️ Clique no campo onde deseja inserir o texto.');
    };

    window.inserirTexto = function(texto) {
        if (!texto) {
            alert('❌ Forneça o texto: inserirTexto("Seu texto aqui")');
            return;
        }
        inserirTextoDireto(texto);
    };

    window.inserirNoCampo = function() {
        inserirNoCampoSelecionado();
    };

    // ============================================
    // ATALHOS DE TECLADO
    // ============================================
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+I - Iniciar (modo clique)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            window.digitarInstantaneo();
        }
        // Ctrl+Shift+Insert - Inserir no campo selecionado
        if (e.ctrlKey && e.shiftKey && e.key === 'Insert') {
            e.preventDefault();
            window.inserirNoCampo();
        }
    });

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    console.log('🚀 DIGITADOR INSTANTÂNEO carregado!');
    console.log('📝 Como usar:');
    console.log('  1. digitarInstantaneo() - Clique no campo, depois cole o texto');
    console.log('  2. inserirNoCampo() - Insere no campo já selecionado');
    console.log('  3. inserirTexto("texto") - Insere texto diretamente');
    console.log('⌨️ Atalhos:');
    console.log('  Ctrl+Shift+I - Iniciar (modo clique)');
    console.log('  Ctrl+Shift+Insert - Inserir no campo selecionado');

    // Pergunta se quer iniciar
    setTimeout(() => {
        if (confirm('🚀 Digitador Instantâneo carregado!\n\nIniciar agora?')) {
            window.digitarInstantaneo();
        }
    }, 500);

})();
