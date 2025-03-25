const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS SDK to use LocalStack
const s3 = new AWS.S3({
  endpoint: 'http://localhost:4566',  // LocalStack endpoint
  region: 'us-east-1',
  s3ForcePathStyle: true,  // Required for LocalStack
});

// Directory to read files from
const directoryPath = 'C:/temp';  // Update this with your directory path
const bucketName = 'my-local-bucket';

// Create the bucket
async function createBucket() {
  const params = {
    Bucket: bucketName,
  };

  try {
    await s3.createBucket(params).promise();
    console.log(`Bucket ${bucketName} created successfully!`);
  } catch (err) {
    console.log(`Bucket already exists or error: ${err}`);
  }
}

// Upload all files from the directory
async function uploadFiles() {
  const files = fs.readdirSync(directoryPath);  // Read all file names in the directory

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(directoryPath, files[i]);
    const fileContent = fs.readFileSync(filePath);  // Read the file content

    const uploadParams = {
      Bucket: bucketName,
      Key: files[i],  // The file name will be the S3 key
      Body: fileContent,
    };

    try {
      await s3.upload(uploadParams).promise();
      console.log(`${files[i]} uploaded successfully!`);
    } catch (err) {
      console.log(`Error uploading ${files[i]}: ${err}`);
    }
  }

  // After uploading, fetch the URLs for the uploaded files
  await fetchFileUrls();
}

// Fetch the URLs of the uploaded files
async function fetchFileUrls() {
  const files = fs.readdirSync(directoryPath);  // Get the list of files again

  for (let i = 0; i < files.length; i++) {
    const getUrlParams = {
      Bucket: bucketName,
      Key: files[i],
    };

    try {
      const url = s3.getSignedUrl('getObject', getUrlParams);
      console.log(`URL for ${files[i]}: ${url}`);
    } catch (err) {
      console.log(`Error fetching URL for ${files[i]}: ${err}`);
    }
  }
}

// Run the functions
createBucket().then(uploadFiles).catch((err) => console.error("Error:", err));
