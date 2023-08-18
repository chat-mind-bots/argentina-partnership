import { extname } from 'path';

export const imageFileFilter = (req, file, callback) => {
  if (!extname(file.originalname).match(/\.(jpg|jpeg|png|gif)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    callback(null, false);
  }
  callback(null, true);
};
