export class Order {
    constructor(data) {
        this.region_code = +data.shippingPerson.stateOrProvinceCode;
        this.order_id = data.id;
        this.type = data.items[0].name;
    }
}