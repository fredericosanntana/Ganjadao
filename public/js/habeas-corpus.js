// Script específico para o gerador de Habeas Corpus

document.addEventListener('DOMContentLoaded', function() {
    initializeHabeasCorpusPage();
});

function initializeHabeasCorpusPage() {
    const form = document.querySelector('.hc-form');
    
    if (form) {
        // Adicionar validação específica para o formulário de HC
        form.addEventListener('submit', function(event) {
            // Validar quantidade de plantas (valor razoável)
            const plantasInput = document.getElementById('quantidadePlantas');
            if (plantasInput && parseInt(plantasInput.value) > 20) {
                event.preventDefault();
                
                // Verificar se já existe alerta
                let alertElement = document.querySelector('.plantas-alert');
                if (!alertElement) {
                    alertElement = document.createElement('div');
                    alertElement.className = 'alert plantas-alert';
                    alertElement.textContent = 'Atenção: Quantidades muito elevadas de plantas podem reduzir as chances de deferimento do HC. Considere justificar adequadamente na motivação.';
                    plantasInput.parentNode.appendChild(alertElement);
                }
                
                // Perguntar ao usuário se deseja continuar
                if (!confirm('A quantidade de plantas informada é elevada, o que pode reduzir as chances de deferimento do HC. Deseja continuar mesmo assim?')) {
                    return;
                }
            }
            
            // Validar motivação (comprimento mínimo)
            const motivacaoInput = document.getElementById('motivacao');
            if (motivacaoInput && motivacaoInput.value.length < 100) {
                event.preventDefault();
                
                let alertElement = document.querySelector('.motivacao-alert');
                if (!alertElement) {
                    alertElement = document.createElement('div');
                    alertElement.className = 'alert motivacao-alert';
                    alertElement.textContent = 'A motivação deve ser detalhada (mínimo de 100 caracteres) para aumentar as chances de deferimento.';
                    motivacaoInput.parentNode.appendChild(alertElement);
                }
            }
            
            // Validar seleção de pelo menos um fundamento jurídico
            const fundamentosChecked = form.querySelectorAll('input[name="fundamentosJuridicos"]:checked');
            if (fundamentosChecked.length === 0) {
                event.preventDefault();
                
                const fundamentosGroup = document.querySelector('.checkbox-group');
                let alertElement = document.querySelector('.fundamentos-alert');
                if (!alertElement && fundamentosGroup) {
                    alertElement = document.createElement('div');
                    alertElement.className = 'alert fundamentos-alert';
                    alertElement.textContent = 'Selecione pelo menos um fundamento jurídico para embasar seu HC.';
                    fundamentosGroup.parentNode.appendChild(alertElement);
                }
            }
        });
        
        // Adicionar contador de caracteres para a motivação
        const motivacaoInput = document.getElementById('motivacao');
        if (motivacaoInput) {
            // Criar elemento contador
            const counterElement = document.createElement('div');
            counterElement.className = 'char-counter';
            counterElement.textContent = '0/100 caracteres (mínimo recomendado)';
            motivacaoInput.parentNode.appendChild(counterElement);
            
            // Atualizar contador ao digitar
            motivacaoInput.addEventListener('input', function() {
                const count = motivacaoInput.value.length;
                counterElement.textContent = `${count}/100 caracteres (mínimo recomendado)`;
                
                if (count < 100) {
                    counterElement.classList.add('counter-warning');
                } else {
                    counterElement.classList.remove('counter-warning');
                }
            });
        }
        
        // Adicionar tooltips informativos para os fundamentos jurídicos
        const fundamentosTooltips = {
            'resp2121548': 'REsp 2.121.548: Decisão do STJ que reconheceu a possibilidade de cultivo de cannabis para fins medicinais.',
            're635659': 'RE 635659: Recurso Extraordinário que discute a inconstitucionalidade do art. 28 da Lei de Drogas.',
            'adpf187': 'ADPF 187: Ação que garantiu o direito à liberdade de expressão na defesa da legalização das drogas.'
        };
        
        const checkboxes = document.querySelectorAll('input[name="fundamentosJuridicos"]');
        checkboxes.forEach(checkbox => {
            const id = checkbox.id;
            if (fundamentosTooltips[id]) {
                const label = document.querySelector(`label[for="${id}"]`);
                if (label) {
                    // Adicionar ícone de informação
                    const infoIcon = document.createElement('span');
                    infoIcon.className = 'info-icon';
                    infoIcon.innerHTML = ' ℹ️';
                    infoIcon.title = fundamentosTooltips[id];
                    label.appendChild(infoIcon);
                    
                    // Adicionar tooltip ao passar o mouse
                    infoIcon.addEventListener('mouseover', function(e) {
                        const tooltip = document.createElement('div');
                        tooltip.className = 'tooltip';
                        tooltip.textContent = fundamentosTooltips[id];
                        document.body.appendChild(tooltip);
                        
                        // Posicionar tooltip
                        const rect = infoIcon.getBoundingClientRect();
                        tooltip.style.left = `${rect.left}px`;
                        tooltip.style.top = `${rect.bottom + 5}px`;
                        
                        // Remover tooltip ao tirar o mouse
                        infoIcon.addEventListener('mouseout', function() {
                            tooltip.remove();
                        });
                    });
                }
            }
        });
    }
}
