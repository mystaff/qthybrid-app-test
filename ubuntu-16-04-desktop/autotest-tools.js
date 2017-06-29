const util = require('util');
const fs = require('fs-extra');
const exec = require('child_process').exec;

const cv = require('opencv');
const jimp = require('jimp');
const robot = require('robotjs');

const sleepTime = 10;
const timeoutTime = 60000;

const tempScreenshotPath = 'screen-tmp.png';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(path) {
    const picture = robot.screen.capture();
    const img = new jimp(picture.width, picture.height);
    img.rgba(false);
    img.bitmap.data = picture.image;

    const scans = [];
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => scans.push({x, y, idx}));

    for (const scan of scans) {
        const red = img.bitmap.data[scan.idx + 0];
        const blue = img.bitmap.data[scan.idx + 2];
        img.bitmap.data[scan.idx + 0] = blue;
        img.bitmap.data[scan.idx + 2] = red;
    }

    await img.rgba(false);
    await util.promisify(img.write).call(img, path);
}

async function find(path1, path2, similarity, resultPath) {
    if (typeof similarity === 'undefined') {
        similarity = 0.99;
    }

    const base = await util.promisify(cv.readImage)(path1);
    const find = await util.promisify(cv.readImage)(path2);

    const out = base.matchTemplate(path2, 5);

    const result = new cv.Matrix(base, out[1], out[2], out[3], out[4]);
    const diff = new cv.Matrix(out[3], out[4]);
    diff.absDiff(result, find);

    const maxDiffValue = 25;
    let sumDiffValue = 0;
    for (var i = 0; i < find.height(); i++) {
        const row = diff.pixelRow(i);
        for (var k = 0; k < row.length; k++) {
            if (row[k] > maxDiffValue) {
                sumDiffValue++;
            }
        }
    }

    let equalPercent = 1.0;
    if (sumDiffValue > 0) {
        equalPercent = 1.0 - (sumDiffValue / (find.width() * find.height() * find.channels()));
    }
    // Maybe need use 'Mean Squared Error' or 'Structural Similarity Measure'
    //////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    diff.absDiff(result, find);

    let normValue = 1.0 - find.norm(result) / (find.width() * find.height());

    diff.cvtColor('CV_BGR2GRAY');
    let absDiff = 1.0 - diff.countNonZero() / (find.width() * find.height());

    result.save('result.png');
    diff.save('diff.png');
    console.log(path2 + ': ' + equalPercent + '(' + absDiff + ', ' + normValue + ')');
    */
    //////////////////////////////////////////////////////////////////////////////////////////////////
    if (typeof resultPath !== 'undefined') {
        result.save(resultPath);
    }

    return {
        found: equalPercent >= similarity,
        similarity: equalPercent,
        x: out[1] + (out[3] / 2),
        y: out[2] + (out[4] / 2),
        width: out[3],
        height: out[4],
        x1y1: [out[1], out[2]],
        x2y2: [out[1] + out[3], out[2] + out[4]]
    }
}

module.exports = {
    rmdir: async function (path) {
        fs.removeSync(path);
    },
    dirNotExists: async function (path) {
        if (fs.existsSync(path)) {
            throw 'Directory exists: ' + path;
        }
    },
    click: async function (image, clickType, mouseShift) {
        const dateStart = new Date();
        let object = null;
        while (true) {
            const dateCurrent = new Date();
            if (dateCurrent - dateStart > timeoutTime) {
                throw 'click timeout: ' + image;
            }
            await sleep(sleepTime);

            const imagePath = 'images/' + image + '.png';
            await screenshot(tempScreenshotPath);
            object = await find(tempScreenshotPath, imagePath);
            if (object.found) {
                robot.moveMouse(object.x, object.y);
                await sleep(sleepTime);

                if (clickType == 0) {
                    robot.mouseClick();
                } else if (clickType == 1) {
                    robot.mouseClick('right');
                } else {
                    throw 'Invalid click param';
                }
                robot.moveMouse(object.x + mouseShift[0], object.y + mouseShift[1]);
                await sleep(sleepTime);
                break;
            }
        }
    },
    waitFor: async function (image) {
        const dateStart = new Date();
        let object = null;
        while (true) {
            const dateCurrent = new Date();
            if (dateCurrent - dateStart > timeoutTime) {
                throw 'waitFor timeout: ' + image;
            }
            await sleep(sleepTime);

            const imagePath = 'images/' + image + '.png';
            await screenshot(tempScreenshotPath);
            object = await find(tempScreenshotPath, imagePath);
            if (object.found) {
                break;
            }
        }
    },
    waitUntil: async function (image) {
        const dateStart = new Date();
        let object = null;
        while (true) {
            const dateCurrent = new Date();
            if (dateCurrent - dateStart > timeoutTime) {
                throw 'waitUntil timeout: ' + image;
            }
            await sleep(sleepTime);

            const imagePath = 'images/' + image + '.png';
            await screenshot(tempScreenshotPath);
            object = await find(tempScreenshotPath, imagePath);
            if (object.found == false) {
                break;
            }
        }
    },
    input: async function (text) {
        await sleep(sleepTime);
        for (let symbol in text) {
            await sleep(50);
            // type symbol that require shift not work in robotjs.
            if (text[symbol] == '+' || text[symbol] == '@') {
                robot.keyToggle('shift', 'down');
            }
            robot.typeString(text[symbol]);
            if (text[symbol] == '+' || text[symbol] == '@') {
                robot.keyToggle('shift', 'up');
            }
        }
        
    },
    pressEnter: async function () {
        await sleep(sleepTime);
        robot.keyTap('enter');
    },
    pressTab: async function () {
        await sleep(sleepTime);
        robot.keyTap('tab');
    },
    execute: async function (command) {
        exec(command, function(error, stdout, stderr) {
        });
    }
};
