# Tutorial para subir archivos a una cubeta de AWS con Node.js

### Instalamos multer
Multer es un middleware para el manejo de archivos en el servidor.
`npm i multer`


#### api.js: dependencies 
```javascript
const multer  = require('multer') // Multer package
const upload = multer({ dest: 'uploads/' }) // Uploading folder
```

#### api.js: upload route with multer middleware
```javascript
// POST a 'multipart/form-data' file named file
router.post('/upload/', upload.single('file'), u_controller.UPLOAD);
```
### Creamos la cubeta en AWS
Mi cubeta privada se llama `all3gu3-aws-testing`

### Crear una politica para la cubeta de AWS
#### Vamos a donde se crean las politicas: `AWS Console >> Services >> IAM >> Policies >> Create policy`

Seleccionamos servicio (S3),
Seleccionamos Acciones (Lectura: GetObject, Escritura: DeleteObject, PutObject)

![imagen](https://user-images.githubusercontent.com/52062448/224529047-b8b0d4bd-f951-49ff-a44d-cbded2979be1.png)

#### Anadir ARN
Especificamos las politicas para que apliquen solo a la cubeta que acabamos de crear.
![Anadir ARN](https://user-images.githubusercontent.com/52062448/224528990-db5451ce-d859-4a0f-87bc-4667c139ff77.png)

#### Avanzamos para crear la cubeta `Etiquetas >> Revisar Politica`
Especificamos Nombre*: 'all3gu3-aws-testing' y CREAMOS LA CUBETA (Listo! c:)

### Crear un usuario para la aplicacion de Node.js
#### Vamos a donde se crean los usuarios: `AWS Console >> Services >> IAM >> Users >> Add user`
![imagen](https://user-images.githubusercontent.com/52062448/224529565-e4a63a56-d468-4800-9830-647ff421d161.png)

#### Le pegamos la politica recien creada al usuario
![imagen](https://user-images.githubusercontent.com/52062448/224529657-3c2cfb30-b558-490d-8abd-1fd352e25475.png)

#### Creamos una clave de acceso para el nuevo usuario
![imagen](https://user-images.githubusercontent.com/52062448/224529914-1c4c9cf9-4d1b-485f-a06d-689a574615a9.png)

### Configuramos el entorno si no lo hemos hecho
Vamos a la raiz (en este caso de mi mac)
```bash
> cd ~/
```
Creamos la carpeta `.aws` para que el cliente de AWS nos encuentre 
```bash
> mkdir .aws
```
Creamos archivo `config`
```bash
> vi config
```
```bash
[default]
AWS_SDK_LOAD_CONFIG=0
```

Creamos archivo `credentials`
```bash
> vi credentials
```
```bash
[default]
aws_access_key_id = AKIAAAV2VAAAXCQHAAAA
aws_secret_access_key = lallavesecretajamassecomparteconnadie
```

### Guardamos las credenciales de la cubeta en un archivo `.env` dentro de la aplicacion:
```javascript
AWS_BUCKET_NAME="all3gu3-aws-testing"
AWS_BUCKET_REGION="us-east-2"

AWS_ACCESS_KEY="AKIAYYV2VS6K257BT5ED"
AWS_SECRET_KEY="unchorizoquenodebesercompartidonunca"
```
#### Instalamos la libreria para traer cosas del .env
`npm i dotenv`

#### Instalamos el sdk de AWS
`npm install aws-sdk`

## Creamos el controlador de S3 `s3.js`
```javascript
require('dotenv').config()
const fs = require('fs')
// var AWS = require('aws-sdk'); 
const S3 = require('aws-sdk/clients/s3')

// Traemos las variables del .env 
const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_BUCKET_ACCESS_KEY
const secretAccessKey = process.env.AWS_BUCKET_SECRET_KEY

// Instancia desde mi cosa
const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

// Uploads a file to s3
function uploadFile(file) {
    // Readstream
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }

    return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile
```

#### user.controller.js: UPLOAD function
```javascript
const {
    uploadFile
} = require('../s3'); // Importamos la funcion que se conecta con el cliente en s3.js
```
```javascript
/**
 * [Function that uploads a file to an AWS S3 bucket]
 * @param request
 * @param response/error 
 */
module.exports.UPLOAD = async (req, response) => {
    const file = req.file
    console.log(req.file, req.body)

    const result = await uploadFile(file)

    response.json({
        mensaje: "AWS upload",
        token: token,
        results: result
    })
}
```

### Response exitoso con la direccion de un archivo
![imagen](https://user-images.githubusercontent.com/52062448/224537092-9509d979-16c4-4392-8969-9d903117cf36.png)

```JSON
{
    "mensaje": "AWS upload",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VydGFnIjoiRFJBRzAxMDgwM01ERlJWTkE3IiwiYmlydGgiOiIwMy0wOC0yMDAxOjQ1MDAiLCJwYXJlbnRfdXNlcnRhZyI6IiIsImlhdCI6MTY3ODYwOTg0MywiZXhwIjoxNjc4NjI0MjQzfQ.KPwX4f8QiC1xYPuAPQQu1LT_9IWeHu83mt5QJAizwE0",
    "results": {
        "ETag": "\"a9aad440d77f29ec910bf0d6e163c1db\"",
        "ServerSideEncryption": "AES256",
        "Location": "https://all3gu3-aws-testing.s3.us-east-2.amazonaws.com/db78447d591f10010b8a59a0927559de",
        "key": "db78447d591f10010b8a59a0927559de",
        "Key": "db78447d591f10010b8a59a0927559de",
        "Bucket": "all3gu3-aws-testing"
    }
}
```

