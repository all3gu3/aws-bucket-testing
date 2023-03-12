const { request, response, Router } = require('express');
var express = require('express');
var router = express.Router();

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

var u_controller = require('../controllers/user.controller'); 

// USERS
// Metodo de LOGIN en [login.js] (routes/login.js)
router.get('/user/', u_controller.GET);
router.post('/upload/', upload.single('file'), u_controller.UPLOAD);

module.exports = router;
