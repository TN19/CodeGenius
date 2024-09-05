const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
