export class Letter {
    constructor(data) {
        this.name = data.items[0].selectedOptions[0].value;
        this.postal_code = data.shippingPerson.postalCode;
        this.country_code = data.shippingPerson.countryCode;
        this.region_code = data.shippingPerson.stateOrProvinceCode;
        this.city = data.shippingPerson.city;
        this.street = data.shippingPerson.street;
        this.order_id = data.id;
        this.type = data.items[0].name;
        this.type_extra = data.items[0].selectedOptions[7].value;
        this.picture = data.items[0].selectedOptions[8].value;
    }
}