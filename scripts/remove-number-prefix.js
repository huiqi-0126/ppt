const fs = require('fs');
const path = require('path');

const directoryPath = 'D:/zhq/果壳/AI生成PPT/PPT';

// 读取目录下的所有文件
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('无法扫描目录: ' + err);
  } 

  // 遍历每个文件
  files.forEach(file => {
    // 使用正则表达式去掉文件名开头的数字和连字符
    const newName = file.replace(/^\d+-/, '');
    
    // 如果文件名有变化才重命名
    if (newName !== file) {
      const oldPath = path.join(directoryPath, file);
      const newPath = path.join(directoryPath, newName);
      
      fs.rename(oldPath, newPath, err => {
        if (err) {
          console.error(`重命名 ${file} 失败:`, err);
        } else {
          console.log(`成功重命名: ${file} -> ${newName}`);
        }
      });
    }
  });
});