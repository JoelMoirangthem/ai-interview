const axios = require('axios');
const FormData = require('form-data');

const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const API_BASE = 'https://api.imagekit.io/v1';

const authHeader = () => {
  const encoded = Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');
  return { Authorization: `Basic ${encoded}` };
};

const uploadPDF = async (buffer, fileName) => {
  const fd = new FormData();
  fd.append('file', buffer, { filename: fileName || `resume-${Date.now()}.pdf`, contentType: 'application/pdf' });
  fd.append('fileName', fileName || `resume-${Date.now()}.pdf`);
  fd.append('folder', '/resumes');
  fd.append('useUniqueFileName', 'true');

  const { data } = await axios.post(UPLOAD_URL, fd, {
    headers: { ...authHeader(), ...fd.getHeaders() }
  });

  return { fileId: data.fileId, url: data.url, name: data.name, thumbnailUrl: data.thumbnailUrl, size: data.size };
};

const deleteFile = async (fileId) => {
  await axios.delete(`${API_BASE}/files/${fileId}`, { headers: authHeader() });
};

const getFileDetails = async (fileId) => {
  const { data } = await axios.get(`${API_BASE}/files/${fileId}/details`, { headers: authHeader() });
  return data;
};

const downloadFile = async (fileUrl) => {
  const { data } = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  return Buffer.from(data);
};

module.exports = { uploadPDF, deleteFile, getFileDetails, downloadFile };
