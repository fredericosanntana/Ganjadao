const AnvisaService = {
    /**
     * Gera o texto da manifestação com base nos dados fornecidos
     * @param {Object} data - Dados do formulário
     * @returns {string} - Texto da manifestação formatado
     */
    generateManifestation: function(data) {
        const { 
            manifestationType, 
            name, 
            profession, 
            personalExperience, 
            additionalPoints, 
            references,
            includeAutocultivo,
            includeJurisprudencia,
            includeInNatura,
            includeAcesso,
            includeAssociacoes
        } = data;

        // Criar o texto da manifestação
        let manifestationText = `À Agência Nacional de Vigilância Sanitária - ANVISA\nConsulta Pública nº 1.316/2025\n\n`;
        
        // Introdução baseada no tipo de manifestação
        if (manifestationType === 'individual') {
            manifestationText += `Como cidadão(ã) brasileiro(a) que acompanha de perto a construção de políticas públicas sobre a Cannabis no país, manifesto aqui minha opinião sobre a proposta em consulta pública.\n\n`;
        } else if (manifestationType === 'patient') {
            manifestationText += `Como paciente que utiliza Cannabis para fins medicinais, manifesto aqui minha opinião sobre a proposta em consulta pública.\n\n`;
        } else if (manifestationType === 'professional') {
            manifestationText += `Como profissional de saúde que acompanha pacientes que utilizam Cannabis para fins medicinais, manifesto aqui minha opinião sobre a proposta em consulta pública.\n\n`;
        } else if (manifestationType === 'researcher') {
            manifestationText += `Como pesquisador(a) na área de Cannabis medicinal, manifesto aqui minha opinião sobre a proposta em consulta pública.\n\n`;
        } else if (manifestationType === 'organization') {
            manifestationText += `Como representante de organização que atua na área de Cannabis medicinal, manifesto aqui minha opinião sobre a proposta em consulta pública.\n\n`;
        }
        
        // Adicionar pontos selecionados
        manifestationText += `Reconheço os avanços propostos na atualização da RDC 327/2019, como a ampliação das vias de administração, a possibilidade de manipulação em farmácias e a simplificação do receituário para produtos com baixo teor de THC. No entanto, considero que a proposta ainda apresenta lacunas importantes que precisam ser abordadas.\n\n`;
        
        if (includeAutocultivo === 'true') {
            manifestationText += `A proposta ignora completamente o direito ao autocultivo, mesmo quando exercido de forma responsável, controlada e para fins exclusivos de uso pessoal, seja medicinal ou adulto, e mesmo diante de precedentes firmes do Poder Judiciário que reconhecem a legitimidade dessa prática. Hoje, centenas de brasileiros já cultivam legalmente por força de Habeas Corpus preventivos concedidos pelo Judiciário, como no caso emblemático do REsp 2.121.548/SP, em que o Superior Tribunal de Justiça reconheceu que o cultivo doméstico para uso próprio, em determinadas condições, não configura crime e é expressão legítima do direito à saúde e à vida privada.\n\n`;
        }
        
        if (includeJurisprudencia === 'true') {
            manifestationText += `O STF no RE 635659 fixou a tese de que o porte de Cannabis para uso pessoal não configura infração penal, e que até mesmo quantidades superiores aos limites fixados podem ser consideradas condutas atípicas, quando presentes indícios claros de uso próprio e ausência de finalidade comercial. A proposta normativa da Anvisa, no entanto, ignora completamente essa construção jurisprudencial, aumentando a distância entre o direito vivo e a norma técnica.\n\n`;
        }
        
        if (includeInNatura === 'true') {
            manifestationText += `O artigo 9º da minuta, ao proibir integralmente a comercialização da planta in natura, desconsidera métodos tradicionais e comprovadamente seguros de uso, como vaporização de flores secas, infusão em óleo ou preparo artesanal. Além disso, a ausência de qualquer dispositivo que reconheça o autocultivo ou preveja critérios para regulação desta prática deixa os usuários expostos à criminalização indevida, mesmo quando já protegidos por decisões judiciais.\n\n`;
        }
        
        if (includeAcesso === 'true') {
            manifestationText += `A proposta reforça um modelo de acesso elitizado, que exige estrutura industrial, farmacêutica e capital elevado, inacessível para a ampla maioria da população brasileira. Isso nega, na prática, o direito ao cuidado autônomo, ao acesso seguro à planta e à liberdade de escolha sobre seu próprio corpo, especialmente para quem busca se proteger da violência do mercado ilegal e do preconceito estrutural que atinge principalmente os mais vulneráveis.\n\n`;
        }
        
        if (includeAssociacoes === 'true') {
            manifestationText += `A proposta também não reconhece o papel das associações de cultivo coletivo, que já operam em diversos estados brasileiros com autorização judicial e que representam uma alternativa viável e segura para o acesso à Cannabis medicinal. Estas associações seguem protocolos rigorosos de cultivo, processamento e distribuição, garantindo a qualidade e a rastreabilidade dos produtos, além de oferecerem suporte e orientação aos pacientes.\n\n`;
        }
        
        // Adicionar experiência pessoal se fornecida
        if (personalExperience && personalExperience.trim()) {
            manifestationText += `Experiência pessoal: ${personalExperience.trim()}\n\n`;
        }
        
        // Adicionar pontos adicionais se fornecidos
        if (additionalPoints && additionalPoints.trim()) {
            manifestationText += `${additionalPoints.trim()}\n\n`;
        }
        
        // Conclusão
        manifestationText += `Neste contexto, acredito que a Anvisa, como agência que tem o dever institucional de proteger o interesse público na promoção da saúde (Lei nº 9.782/1999), deve incluir na regulamentação o reconhecimento e a possibilidade de regulação do autocultivo individual e associativo, com critérios sanitários mínimos, compromisso com rastreabilidade, e vedação ao desvio de finalidade — como já ocorre em outros países e como o Judiciário já vem reconhecendo no Brasil.\n\n`;
        
        manifestationText += `Negar o autocultivo em 2025 não é apenas uma omissão técnica, é uma forma de reforçar desigualdades sociais, criminalizar práticas legítimas e silenciar a realidade de milhares de brasileiros que cultivam como ato de cuidado, sobrevivência e dignidade.\n\n`;
        
        // Adicionar referências se fornecidas
        if (references && references.trim()) {
            manifestationText += `Referências adicionais:\n${references}\n\n`;
        }
        
        // Assinatura
        manifestationText += `Atenciosamente,\n${name}\n`;
        if (profession && profession.trim()) {
            manifestationText += `${profession}\n`;
        }
        
        return manifestationText;
    },
    
    /**
     * Salva a manifestação no banco de dados
     * @param {Object} data - Dados do formulário
     * @returns {Promise} - Promessa que resolve quando a manifestação é salva
     */
    saveManifestation: async function(data) {
        // Esta é uma implementação simulada
        // Em um ambiente real, isso se conectaria a um banco de dados
        
        console.log('Salvando manifestação no banco de dados:', data.name);
        
        // Simular uma operação assíncrona
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Manifestação salva com sucesso');
                resolve({ success: true });
            }, 1000);
        });
    },
    
    /**
     * Obtém manifestações salvas do banco de dados
     * @returns {Promise<Array>} - Promessa que resolve com a lista de manifestações
     */
    getManifestations: async function() {
        // Esta é uma implementação simulada
        // Em um ambiente real, isso se conectaria a um banco de dados
        
        console.log('Obtendo manifestações do banco de dados');
        
        // Simular uma operação assíncrona
        return new Promise((resolve) => {
            setTimeout(() => {
                // Dados de exemplo
                const manifestations = [
                    {
                        id: 1,
                        name: 'João Silva',
                        manifestationType: 'patient',
                        createdAt: new Date(2025, 3, 15).toISOString()
                    },
                    {
                        id: 2,
                        name: 'Maria Oliveira',
                        manifestationType: 'professional',
                        createdAt: new Date(2025, 3, 18).toISOString()
                    }
                ];
                
                resolve(manifestations);
            }, 1000);
        });
    }
};

module.exports = AnvisaService;
