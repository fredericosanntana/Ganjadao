// Script específico para a página de jurisprudência

document.addEventListener('DOMContentLoaded', function() {
    initializeJurisprudenciaPage();
});

// Variáveis globais para paginação
let paginaAtual = 1;
let totalPaginas = 1;
let ultimosParametros = null;

function initializeJurisprudenciaPage() {
    const filterForm = document.getElementById('jurisprudenciaFilter');
    const resultsContainer = document.getElementById('jurisprudenciaResults');
    const fonteDataJud = document.getElementById('fonteDataJud');
    const termoBuscaContainer = document.getElementById('termoBuscaContainer');
    const paginacaoContainer = document.getElementById('paginacao');
    const resultadosFontes = document.getElementById('resultadosFontes');
    const paginaAnterior = document.getElementById('paginaAnterior');
    const proximaPagina = document.getElementById('proximaPagina');
    
    // Inicializar variáveis de paginação
    paginaAtual = 1;
    totalPaginas = 1;
    
    if (filterForm && resultsContainer) {
        // Mostrar/ocultar campo de termo de busca quando DataJud é selecionado
        if (fonteDataJud && termoBuscaContainer) {
            fonteDataJud.addEventListener('change', function() {
                termoBuscaContainer.style.display = this.checked ? 'block' : 'none';
            });
        }
        
        // Manipular envio do formulário de filtro
        filterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Resetar paginação ao fazer nova busca
            paginaAtual = 1;
            
            // Coletar dados do formulário
            const formData = new FormData(filterForm);
            const queryParams = new URLSearchParams();
            
            // Verificar se pelo menos uma fonte está selecionada
            const fonteLocal = document.getElementById('fonteLocal');
            const fonteDataJud = document.getElementById('fonteDataJud');
            
            if (fonteLocal && fonteDataJud && !fonteLocal.checked && !fonteDataJud.checked) {
                alert('Selecione pelo menos uma fonte de dados para a busca.');
                return;
            }
            
            for (const [key, value] of formData.entries()) {
                if (value) {
                    queryParams.append(key, value);
                }
            }
            
            // Adicionar parâmetro de página
            queryParams.append('pagina', paginaAtual);
            
            // Salvar parâmetros para uso na paginação
            ultimosParametros = queryParams;
            
            // Exibir indicador de carregamento
            resultsContainer.innerHTML = '<div class="loading">Carregando resultados...</div>';
            
            // Fazer requisição AJAX para o servidor
            fetch(`/juridico/jurisprudencia/filtro?${queryParams.toString()}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.results.length > 0) {
                        displayResults(data.results);
                        
                        // Exibir informações sobre as fontes utilizadas
                        if (resultadosFontes) {
                            let fontesTexto = [];
                            if (data.fontes) {
                                if (data.fontes.local > 0) {
                                    fontesTexto.push(`Base Local (${data.fontes.local} resultados)`);
                                }
                                if (data.fontes.datajud > 0) {
                                    fontesTexto.push(`DataJud (${data.fontes.datajud} resultados)`);
                                }
                            }
                            
                            if (fontesTexto.length > 0) {
                                document.getElementById('fontesUtilizadas').textContent = fontesTexto.join(' e ');
                                resultadosFontes.style.display = 'block';
                            } else {
                                resultadosFontes.style.display = 'none';
                            }
                        }
                        
                        // Configurar paginação se DataJud estiver sendo usado
                        if (fonteDataJud && fonteDataJud.checked && data.totalPaginas) {
                            totalPaginas = data.totalPaginas;
                            document.getElementById('infoPagina').textContent = `Página ${paginaAtual} de ${totalPaginas}`;
                            paginaAnterior.disabled = paginaAtual <= 1;
                            proximaPagina.disabled = paginaAtual >= totalPaginas;
                            paginacaoContainer.style.display = 'flex';
                        } else {
                            paginacaoContainer.style.display = 'none';
                        }
                    } else {
                        resultsContainer.innerHTML = '<p class="empty-results">Nenhum resultado encontrado para os filtros selecionados.</p>';
                        resultadosFontes.style.display = 'none';
                        paginacaoContainer.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar jurisprudência:', error);
                    resultsContainer.innerHTML = '<p class="error-message">Ocorreu um erro ao buscar os resultados. Por favor, tente novamente.</p>';
                    resultadosFontes.style.display = 'none';
                    paginacaoContainer.style.display = 'none';
                });
        });
        
        // Limpar resultados ao resetar o formulário
        filterForm.addEventListener('reset', function() {
            resultsContainer.innerHTML = '<p class="empty-results">Utilize os filtros acima para buscar decisões judiciais.</p>';
            resultadosFontes.style.display = 'none';
            paginacaoContainer.style.display = 'none';
            
            // Resetar checkbox de DataJud e ocultar campo de termo de busca
            if (fonteDataJud && termoBuscaContainer) {
                termoBuscaContainer.style.display = 'none';
            }
        });
        
        // Configurar botões de paginação
        if (paginaAnterior && proximaPagina) {
            paginaAnterior.addEventListener('click', function() {
                if (paginaAtual > 1) {
                    paginaAtual--;
                    buscarComPaginacao();
                }
            });
            
            proximaPagina.addEventListener('click', function() {
                if (paginaAtual < totalPaginas) {
                    paginaAtual++;
                    buscarComPaginacao();
                }
            });
        }
    }
}

function buscarComPaginacao() {
    if (!ultimosParametros) return;
    
    const resultsContainer = document.getElementById('jurisprudenciaResults');
    const paginacaoContainer = document.getElementById('paginacao');
    const resultadosFontes = document.getElementById('resultadosFontes');
    
    // Atualizar parâmetro de página
    ultimosParametros.set('pagina', paginaAtual);
    
    // Exibir indicador de carregamento
    resultsContainer.innerHTML = '<div class="loading">Carregando resultados...</div>';
    
    // Fazer requisição AJAX para o servidor
    fetch(`/juridico/jurisprudencia/filtro?${ultimosParametros.toString()}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.results.length > 0) {
                displayResults(data.results);
                
                // Exibir informações sobre as fontes utilizadas
                if (resultadosFontes) {
                    let fontesTexto = [];
                    if (data.fontes) {
                        if (data.fontes.local > 0) {
                            fontesTexto.push(`Base Local (${data.fontes.local} resultados)`);
                        }
                        if (data.fontes.datajud > 0) {
                            fontesTexto.push(`DataJud (${data.fontes.datajud} resultados)`);
                        }
                    }
                    
                    if (fontesTexto.length > 0) {
                        document.getElementById('fontesUtilizadas').textContent = fontesTexto.join(' e ');
                        resultadosFontes.style.display = 'block';
                    } else {
                        resultadosFontes.style.display = 'none';
                    }
                }
                
                // Atualizar informações de paginação
                document.getElementById('infoPagina').textContent = `Página ${paginaAtual} de ${totalPaginas}`;
                document.getElementById('paginaAnterior').disabled = paginaAtual <= 1;
                document.getElementById('proximaPagina').disabled = paginaAtual >= totalPaginas;
            } else {
                resultsContainer.innerHTML = '<p class="empty-results">Nenhum resultado encontrado para os filtros selecionados.</p>';
                resultadosFontes.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar jurisprudência:', error);
            resultsContainer.innerHTML = '<p class="error-message">Ocorreu um erro ao buscar os resultados. Por favor, tente novamente.</p>';
            resultadosFontes.style.display = 'none';
        });
}

function displayResults(results) {
    const resultsContainer = document.getElementById('jurisprudenciaResults');
    
    if (resultsContainer) {
        let html = '<div class="jurisprudencia-list">';
        
        results.forEach(item => {
            // Formatar resultado para exibição
            let resultadoTexto = 'Não informado';
            let resultadoClasse = '';
            
            if (item.resultado === 'deferido') {
                resultadoTexto = 'DEFERIDO';
                resultadoClasse = 'deferido';
            } else if (item.resultado === 'indeferido') {
                resultadoTexto = 'INDEFERIDO';
                resultadoClasse = 'indeferido';
            } else if (item.resultado === 'parcial') {
                resultadoTexto = 'PARCIALMENTE DEFERIDO';
                resultadoClasse = 'parcial';
            }
            
            // Adicionar badge de fonte
            const fonteBadge = item.fonte ? 
                `<span class="fonte-badge ${item.fonte.toLowerCase()}">${item.fonte}</span>` : '';
            
            // Construir URL para detalhes
            let detalhesUrl = `/juridico/jurisprudencia/${item.id}`;
            if (item.fonte === 'DataJud' && item.numeroProcesso) {
                detalhesUrl += `?processo=${item.numeroProcesso}`;
            }
            
            html += `
                <div class="jurisprudencia-item">
                    <h3>${item.numeroProcesso} ${fonteBadge}</h3>
                    <div class="jurisprudencia-meta">
                        <span class="tribunal">${item.tribunal} - ${item.estado}</span>
                        <span class="data">${formatDate(item.dataDecisao)}</span>
                        <span class="resultado ${resultadoClasse}">${resultadoTexto}</span>
                    </div>
                    <div class="jurisprudencia-content">
                        <p class="ementa"><strong>Ementa:</strong> ${item.ementa}</p>
                        <div class="jurisprudencia-details">
                            <p><strong>Desembargador:</strong> ${item.desembargador || 'Não informado'}</p>
                            <p><strong>Quantidade de Plantas:</strong> ${item.quantidadePlantas || 'Não informado'}</p>
                            <p><strong>Tipo de Uso:</strong> ${item.tipoUso || 'Não informado'}</p>
                        </div>
                    </div>
                    <div class="jurisprudencia-actions">
                        <a href="${detalhesUrl}" class="btn btn-outline">Ver Detalhes</a>
                        ${item.urlInteiroTeor && item.urlInteiroTeor !== '#' ? 
                            `<a href="${item.urlInteiroTeor}" target="_blank" class="btn btn-outline">Inteiro Teor</a>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        resultsContainer.innerHTML = html;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Data não informada';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return dateString; // Retorna a string original se não conseguir formatar
    }
}
