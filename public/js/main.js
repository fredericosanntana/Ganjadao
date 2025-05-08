// Script principal para todas as páginas

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização de componentes comuns
    initializeFormValidation();
    initializeResponsiveMenu();
    
    // Detectar página atual e inicializar funcionalidades específicas
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/juridico/habeas-corpus')) {
        initializeHabeasCorpusForm();
    } else if (currentPath.includes('/juridico/documentos')) {
        initializeDocumentosPage();
    } else if (currentPath.includes('/juridico/jurisprudencia')) {
        // A inicialização específica da jurisprudência está em seu próprio arquivo
    }
});

// Validação de formulários
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Criar mensagem de erro se não existir
                    let errorMsg = field.parentNode.querySelector('.error-message');
                    if (!errorMsg) {
                        errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.textContent = 'Este campo é obrigatório';
                        field.parentNode.appendChild(errorMsg);
                    }
                } else {
                    field.classList.remove('error');
                    const errorMsg = field.parentNode.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
            
            if (!isValid) {
                event.preventDefault();
            }
        });
    });
}

// Menu responsivo para dispositivos móveis
function initializeResponsiveMenu() {
    const header = document.querySelector('.main-header');
    
    if (header) {
        // Criar botão de menu hamburger para mobile
        const menuButton = document.createElement('button');
        menuButton.className = 'menu-toggle';
        menuButton.innerHTML = '&#9776;'; // Ícone de hamburger
        menuButton.style.display = 'none'; // Esconder inicialmente
        
        const nav = header.querySelector('.main-nav');
        
        // Adicionar botão antes da navegação
        if (nav) {
            header.querySelector('.container').insertBefore(menuButton, nav);
            
            // Verificar tamanho da tela e ajustar visibilidade
            function checkScreenSize() {
                if (window.innerWidth <= 768) {
                    menuButton.style.display = 'block';
                    nav.classList.add('mobile-nav');
                    nav.style.display = 'none';
                } else {
                    menuButton.style.display = 'none';
                    nav.classList.remove('mobile-nav');
                    nav.style.display = 'block';
                }
            }
            
            // Verificar no carregamento e ao redimensionar
            checkScreenSize();
            window.addEventListener('resize', checkScreenSize);
            
            // Alternar menu ao clicar no botão
            menuButton.addEventListener('click', function() {
                if (nav.style.display === 'none' || nav.style.display === '') {
                    nav.style.display = 'block';
                } else {
                    nav.style.display = 'none';
                }
            });
        }
    }
}

// Inicialização específica para o formulário de Habeas Corpus
function initializeHabeasCorpusForm() {
    const form = document.querySelector('.hc-form');
    
    if (form) {
        // Formatar campos
        const cpfInput = form.querySelector('#cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                if (value.length > 9) {
                    value = value.replace(/^(\d{3})(\d{3})(\d{3})/, '$1.$2.$3-');
                } else if (value.length > 6) {
                    value = value.replace(/^(\d{3})(\d{3})/, '$1.$2.');
                } else if (value.length > 3) {
                    value = value.replace(/^(\d{3})/, '$1.');
                }
                
                e.target.value = value;
            });
        }
        
        const telefoneInput = form.querySelector('#telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                if (value.length > 6) {
                    value = value.replace(/^(\d{2})(\d{5})/, '($1) $2-');
                } else if (value.length > 2) {
                    value = value.replace(/^(\d{2})/, '($1) ');
                }
                
                e.target.value = value;
            });
        }
    }
}

// Inicialização específica para a página de Documentos
function initializeDocumentosPage() {
    const uploadForm = document.querySelector('.upload-form');
    
    if (uploadForm) {
        const fileInput = uploadForm.querySelector('input[type="file"]');
        
        if (fileInput) {
            // Adicionar preview do arquivo
            fileInput.addEventListener('change', function(e) {
                const fileName = e.target.files[0]?.name;
                let filePreview = uploadForm.querySelector('.file-preview');
                
                if (!filePreview) {
                    filePreview = document.createElement('div');
                    filePreview.className = 'file-preview';
                    fileInput.parentNode.appendChild(filePreview);
                }
                
                filePreview.textContent = fileName || 'Nenhum arquivo selecionado';
            });
        }
    }
}
