// app/backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3, dynamoDB, PutItemCommand, ScanCommand } = require('./dbClient');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  }),
});

// Upload Image and Metadata to S3 and DynamoDB
app.post('/upload', upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const imageId = uuidv4();
  const s3Key = req.file.key;

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        imageId: { S: imageId },
        title: { S: title },
        description: { S: description },
        s3Key: { S: s3Key },
      },
    };
    await dynamoDB.send(new PutItemCommand(params));

    res.status(200).send({ message: 'File uploaded successfully', imageId, s3Key });
  } catch (error) {
    console.error('Error storing metadata:', error);
    res.status(500).send({ error: 'Error storing metadata' });
  }
});

// Retrieve Images and Metadata
app.get('/images', async (req, res) => {
  try {
    const data = await dynamoDB.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));
    const items = data.Items.map((item) => ({
      imageId: item.imageId.S,
      title: item.title.S,
      description: item.description.S,
      url: `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.s3Key.S}`,
    }));
    res.send(items);
  } catch (error) {
    console.error('Error retrieving images:', error);
    res.status(500).send({ error: 'Error retrieving images' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
