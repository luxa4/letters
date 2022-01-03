import axios from "axios";

export function getOrders(createdFrom, createdTo, offset = 0) {
    const token = process.env.VUE_APP_TOKEN;
    const url = 'https://app.ecwid.com/api/v3/1569218/orders';
    return axios.get(url, { params: {
        token: token,
        createdFrom: createdFrom,
        createdTo: +createdTo + 86399,
        offset: offset
    }
    });
}
