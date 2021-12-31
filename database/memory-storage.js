const fs = require('fs');
const path = require('path');

async function getData (subject, key) {

    const filePath = path.resolve(__dirname, subject);

    let fileData;

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            fileData = {};
        } else {
            fileData = JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }

    return fileData[key] || null;
};

async function getAllData(subject) {

    const filePath = path.resolve(__dirname, subject);

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            return [];
        } else {
            return JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }
}

async function setData (subject, key, data) {

    const filePath = path.resolve(__dirname, subject);

    let fileData;

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            fileData = {};
        } else {
            fileData = JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }

    fileData[key] = data;

    try {

        await fs.promises.writeFile(filePath, JSON.stringify(fileData), {
            flag: 'w'
        });

        return true;

    } catch(err) {

        console.log(err);
    }

    return null;
};

async function removeData(subject, key) {

    const filePath = path.resolve(__dirname, subject);

    let fileData;

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            fileData = {};
        } else {
            fileData = JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }

    delete fileData[key];

    try {

        await fs.promises.writeFile(filePath, JSON.stringify(fileData), {
            flag: 'w'
        });

        return true;

    } catch(err) {

        console.log(err);
    }

    return null;
}

async function clearSubject(subject) {

    const filePath = path.resolve(__dirname, subject);

    try {
        await fs.promises.rm(filePath);
        return true;
    } catch(err) {
        console.log(err);
    }
    return null;
}

module.exports.getData = getData;
module.exports.getAllData = getAllData;
module.exports.setData = setData;
module.exports.removeData = removeData;
module.exports.clearSubject = clearSubject;
