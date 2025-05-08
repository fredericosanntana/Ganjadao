// Utilitário para gerenciar uploads de documentos
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuração do armazenamento para uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Diretório para armazenar os uploads
    const uploadDir = path.join(__dirname, '../public/uploads');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome de arquivo único
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const basename = path.basename(originalName, extension);
    
    // Formato: nome-original_timestamp.extensao
    cb(null, `${basename}_${timestamp}${extension}`);
  }
});

// Filtro para tipos de arquivos permitidos
const fileFilter = (req, file, cb) => {
  // Tipos de arquivos permitidos
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    // Aceitar o arquivo
    cb(null, true);
  } else {
    // Rejeitar o arquivo
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF, DOC, DOCX, JPG e PNG são aceitos.'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Função para obter informações de um arquivo enviado
exports.getFileInfo = (file) => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    publicPath: `/uploads/${file.filename}`
  };
};

// Exportar middleware de upload
exports.uploadMiddleware = upload.single('documento');

// Função para listar arquivos enviados
exports.listUploadedFiles = () => {
  const uploadDir = path.join(__dirname, '../public/uploads');
  
  if (!fs.existsSync(uploadDir)) {
    return [];
  }
  
  try {
    const files = fs.readdirSync(uploadDir);
    return files.map(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        filename: file,
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        publicPath: `/uploads/${file}`
      };
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return [];
  }
};
