export function getRegion(region_code) {
    const regionList = require('../region.json');
    const region = regionList.find(region => region.code === region_code);
    return region.region;
}