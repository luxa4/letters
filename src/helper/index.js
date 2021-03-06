export function getRegion(region_code) {
    const regionList = require('../region.json');
    const region = regionList.find(region => region.code === region_code);
    return region.region;
}

export function plural (number, one, two, five) {
    let n = Math.floor(Math.abs(number));
    n %= 100;

    if (n >= 5 && n <= 20) {
        return five;
    }

    n %= 10;

    if (n === 1) {
        return one;
    }

    if (n >= 2 && n <= 4) {
        return two;
    }

    return five;
}