import axios from "axios";

export function getOrders(createdFrom, createdTo) {
    const url = `https://app.ecwid.com/api/v3/1569218/orders?token=${process.env.token}&createdFrom=${createdFrom}&createdTo=${+createdTo+86399}`
    return axios.get(url);
}