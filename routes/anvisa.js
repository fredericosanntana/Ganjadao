const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const nodemailer = require('nodemailer');
const { validateForm, sanitizeInput } = require('../utils/validation/validation');
const AnvisaService = require('../services/anvisa/anvisaService');

// Rota principal para a página de manifestação da ANVISA
router.get('/', (req, res) => {
    res.render('anvisa/index', { 
        title: 'Manifestação sobre Proposta da ANVISA',
        description: 'Ferramenta para criar manifestações sobre a proposta normativa da ANVISA para produtos de Cannabis',
        currentPage: 'anvisa'
    });
});

// Rota para visualizar prévia da manifestação
router.post('/preview', (req, res) => {
    try {
        // Validar dados do formulário
        const validationErrors = validateForm(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        // Sanitizar entradas
        const sanitizedData = {};
        Object.keys(req.body).forEach(key => {
            sanitizedData[key] = sanitizeInput(req.body[key]);
        });

        // Gerar texto da manifestação usando o serviço
        const manifestationText = AnvisaService.generateManifestation(sanitizedData);
        
        res.json({ success: true, text: manifestationText });
    } catch (error) {
        console.error('Erro ao gerar prévia da manifestação:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar prévia da manifestação' });
    }
});

// Rota para gerar e baixar o PDF da manifestação
router.post('/download', async (req, res) => {
    try {
        // Validar dados do formulário
        const validationErrors = validateForm(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        // Sanitizar entradas
        const sanitizedData = {};
        Object.keys(req.body).forEach(key => {
            sanitizedData[key] = sanitizeInput(req.body[key]);
        });

        // Gerar texto da manifestação usando o serviço
        const manifestationText = AnvisaService.generateManifestation(sanitizedData);
        
        // Criar o PDF
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesBold);
        
        // Adicionar página
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const fontSize = 12;
        const titleFontSize = 14;
        const margin = 50;
        const lineHeight = fontSize * 1.2;

        // Adicionar cabeçalho
        page.drawText('MANIFESTAÇÃO SOBRE PROPOSTA DA ANVISA', {
            x: margin,
            y: height - margin,
            size: titleFontSize,
            font: timesBoldFont,
            color: rgb(0, 0, 0),
        });
        
        page.drawText('Consulta Pública nº 1.316/2025', {
            x: margin,
            y: height - margin - lineHeight,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        // Adicionar linha horizontal
        page.drawLine({
            start: { x: margin, y: height - margin - lineHeight * 2 },
            end: { x: width - margin, y: height - margin - lineHeight * 2 },
            thickness: 1,
            color: rgb(0, 0, 0),
        });

        // Quebrar o texto em linhas para caber na página
        const words = manifestationText.split(' ');
        let lines = [];
        let currentLine = '';
        let startY = height - margin - lineHeight * 3;

        for (const word of words) {
            const testLine = currentLine + word + ' ';
            const testWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
            
            if (testWidth > width - 2 * margin) {
                lines.push(currentLine);
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine.trim()) {
            lines.push(currentLine);
        }

        // Substituir quebras de linha explícitas
        const finalLines = [];
        for (const line of lines) {
            const subLines = line.split('\n');
            for (const subLine of subLines) {
                if (subLine.trim()) {
                    finalLines.push(subLine);
                } else {
                    finalLines.push(' ');
                }
            }
        }

        // Escrever o texto no PDF
        let y = startY;
        let currentPage = page;
        
        for (const line of finalLines) {
            if (y < margin) {
                // Adicionar nova página se necessário
                currentPage = pdfDoc.addPage();
                y = height - margin;
                
                // Adicionar número de página no rodapé
                const pageCount = pdfDoc.getPageCount();
                currentPage.drawText(`Página ${pageCount}`, {
                    x: width / 2,
                    y: 30,
                    size: 10,
                    font: timesRomanFont,
                    color: rgb(0.5, 0.5, 0.5),
                });
            }
            
            currentPage.drawText(line, {
                x: margin,
                y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            
            y -= lineHeight;
        }
        
        // Adicionar número de página na primeira página
        page.drawText(`Página 1`, {
            x: width / 2,
            y: 30,
            size: 10,
            font: timesRomanFont,
            color: rgb(0.5, 0.5, 0.5),
        });

        // Salvar o PDF
        const pdfBytes = await pdfDoc.save();
        
        // Criar um nome de arquivo baseado no nome do usuário
        const fileName = `manifestacao_anvisa_${sanitizedData.name.replace(/\s+/g, '_').toLowerCase()}.pdf`;
        const filePath = path.join(__dirname, '..', 'public', 'docs', fileName);
        
        // Garantir que o diretório existe
        const dirPath = path.join(__dirname, '..', 'public', 'docs');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        // Salvar o arquivo
        fs.writeFileSync(filePath, pdfBytes);
        
        // Registrar o download no log
        console.log(`PDF gerado: ${fileName} para ${sanitizedData.name}`);
        
        // Enviar o arquivo para download
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Erro ao enviar o arquivo:', err);
                res.status(500).send('Erro ao gerar o PDF');
            }
            
            // Remover o arquivo após o download
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
        res.status(500).json({ success: false, message: 'Erro ao gerar o PDF' });
    }
});

// Rota para enviar a manifestação por e-mail
router.post('/enviar', async (req, res) => {
    try {
        // Validar dados do formulário
        const validationErrors = validateForm(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        // Sanitizar entradas
        const sanitizedData = {};
        Object.keys(req.body).forEach(key => {
            sanitizedData[key] = sanitizeInput(req.body[key]);
        });

        // Gerar texto da manifestação
        const manifestationText = AnvisaService.generateManifestation(sanitizedData);
        
        // Configurar o transporte de e-mail
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.example.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER || 'user@example.com',
                pass: process.env.EMAIL_PASS || 'password'
            }
        });
        
        // Configurar o e-mail
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@cannabisapp.com',
            to: process.env.ANVISA_EMAIL || 'consulta.publica@anvisa.gov.br',
            subject: 'Manifestação sobre Consulta Pública nº 1.316/2025',
            text: manifestationText,
            cc: req.body.email // Enviar cópia para o usuário se fornecido
        };
        
        // Enviar o e-mail
        await transporter.sendMail(mailOptions);
        
        // Registrar o envio no log
        console.log(`E-mail enviado para ANVISA de ${sanitizedData.name}`);
        
        res.json({ success: true, message: 'Manifestação enviada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ success: false, message: 'Erro ao enviar a manifestação por e-mail' });
    }
});

// Rota para salvar a manifestação no banco de dados
router.post('/salvar', async (req, res) => {
    try {
        // Validar dados do formulário
        const validationErrors = validateForm(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, errors: validationErrors });
        }

        // Sanitizar entradas
        const sanitizedData = {};
        Object.keys(req.body).forEach(key => {
            sanitizedData[key] = sanitizeInput(req.body[key]);
        });

        // Salvar no banco de dados usando o serviço
        await AnvisaService.saveManifestation(sanitizedData);
        
        res.json({ success: true, message: 'Manifestação salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar manifestação:', error);
        res.status(500).json({ success: false, message: 'Erro ao salvar a manifestação' });
    }
});

// Rota para obter manifestações salvas
router.get('/manifestacoes', async (req, res) => {
    try {
        // Obter manifestações do banco de dados
        const manifestations = await AnvisaService.getManifestations();
        
        res.json({ success: true, manifestations });
    } catch (error) {
        console.error('Erro ao obter manifestações:', error);
        res.status(500).json({ success: false, message: 'Erro ao obter manifestações' });
    }
});

module.exports = router;
