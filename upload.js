const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer com renomeação de arquivo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userEmail = req.session.user_email; // Assumindo que o e-mail do usuário está na sessão
        if (!userEmail) {
            return cb(new Error('E-mail do usuário não encontrado na sessão.'));
        }
        const uploadPath = path.join(__dirname, 'public', 'click_genius', 'images', 'users', userEmail);

        // Cria a pasta se ela não existir
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Renomear o arquivo, por exemplo, usando a data atual para garantir um nome único
        const timestamp = Date.now(); // Pega o timestamp atual
        const fileExtension = path.extname(file.originalname); // Pega a extensão original do arquivo
        const newFilename = `${req.session.user_email}-${timestamp}${fileExtension}`; // Exemplo: "file-1630537608000.png"

        cb(null, newFilename); // Define o novo nome do arquivo
    }
});

const upload = multer({ storage: storage });

module.exports = upload;

