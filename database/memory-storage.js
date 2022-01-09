const fs = require('fs');
const path = require('path');

const filePathBase = path.resolve(__dirname, '../datastore');

async function getData (subject, key) {

    const filePath = path.resolve(filePathBase, subject);

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

async function getArrData (subject, index) {

    const filePath = path.resolve(filePathBase, subject);

    let fileData;

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            fileData = [];
        } else {
            fileData = JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }

    return fileData[index] || null;
};

async function getAllData(subject) {

    const filePath = path.resolve(filePathBase, subject);

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            return {};
        } else {
            return JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }
}

async function getAllArrData(subject) {

    const filePath = path.resolve(filePathBase, subject);

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

    const filePath = path.resolve(filePathBase, subject);

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

async function setArrData (subject, data, front) {

    const filePath = path.resolve(filePathBase, subject);

    let fileData;

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            fileData = [];
        } else {
            fileData = JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }

    if(front) {
        fileData.unshift(data);
    } else {
        fileData.unshift(push);
    }

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

async function updateArrData (subject, data, index) {

    const filePath = path.resolve(filePathBase, subject);

    let fileData;

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            fileData = [];
        } else {
            fileData = JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }

    fileData[index] = data;

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

    const filePath = path.resolve(filePathBase, subject);

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


async function removeArrData(subject, index) {

    const filePath = path.resolve(filePathBase, subject);

    let fileData;

    try {

        const data = await fs.promises.readFile(filePath, {
            flag: 'a+'
        });

        if(data.length == 0) {
            fileData = [];
        } else {
            fileData = JSON.parse(data.toString());
        }

    } catch(err) {

        console.log(err);

        return null;
    }

    fileData.splice(index, 1);

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

    const filePath = path.resolve(filePathBase, subject);

    try {
        await fs.promises.rm(filePath);
        return true;
    } catch(err) {
        console.log(err);
    }
    return null;
}

module.exports.getData = getData;
module.exports.getArrData = getArrData;
module.exports.getAllData = getAllData;
module.exports.getAllArrData = getAllArrData;
module.exports.setData = setData;
module.exports.setArrData = setArrData;
module.exports.updateArrData = updateArrData;
module.exports.removeData = removeData;
module.exports.removeArrData = removeArrData;
module.exports.clearSubject = clearSubject;
