import axios from "axios";

export function getOrders(createdFrom, createdTo) {
    const url = `https://app.ecwid.com/api/v3/1569218/orders?token=secret_Wk9esm1V9SNWQLdXnyhjaVwxQgX68b4L&createdFrom=${createdFrom}&createdTo=${+createdTo+86399}`
    return axios.get(url);
}