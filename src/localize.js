const fs = require('fs');
const path = require('path');
const axios = require('axios');

const directoryPath = path.join(__dirname, './u21666905_wrlknz/data/json'); // 替换为您的目录路径
const imgDirectory = path.join(__dirname, './u21666905_wrlknz/data/json/img');
const oldBaseUrlRegex = /https:\/\/cdn\.nlark\.com\/yuque\/\d+\/\d+\/(gif|png|jpeg)\/\d+\/([-\w]+)\.(gif|png|jpeg)/g;
const newBaseUrl = './u21666905_wrlknz/data/json/img/';

// 确保图片存储目录存在
if (!fs.existsSync(imgDirectory)) {
    fs.mkdirSync(imgDirectory, { recursive: true });
}

// 处理当前目录下的所有 JSON 文件
const processFiles = async (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (path.extname(file) === '.json') {
            await processJson(path.join(dir, file));
        }
    }
};

// 处理 JSON 文件
const processJson = async (filePath) => {
    const data = JSON.parse(fs.readFileSync(filePath));

    if (data.body_html) {
        let modifiedHtml = data.body_html;
        const matches = data.body_html.match(oldBaseUrlRegex);

        console.log(matches)
        console.log(filePath)
        if (matches) {
            for (const url of matches) {
                const newUrl = url.replace(oldBaseUrlRegex, '/data/json/img/$2.$3');
                modifiedHtml = modifiedHtml.replace(url, newUrl);
                const imageName = url.match(oldBaseUrlRegex)[0].split('/').pop();
                const newImagePath = path.join(imgDirectory, imageName);
                await downloadImage(url, newImagePath);
            }
        }

        data.body_html = modifiedHtml;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    }
};


// 下载图片并保存到本地
const downloadImage = async (url, imagePath) => {
    console.log(url)
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

// 启动处理过程
processFiles(directoryPath).then(() => console.log('处理完成')).catch(err => console.error(err));

