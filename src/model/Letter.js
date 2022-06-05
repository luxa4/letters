export default class Letter {
  constructor(item) {
    this.name = item.selectedOptions.filter(i => i.name.includes('мя и фамилия'))[0].value;
    this.postal_code = item.postalCode;
    this.country_code = +item.countryCode;
    this.region_code = +item.stateOrProvinceCode;
    this.city = item.city;
    this.street = item.street;
    this.order_id = item.order_id;
    this.type = this.selectType(item);
    this.picture = item.selectedOptions.filter(i => i.name.includes('исунок'))[0].value;
  }

  selectType(item) {
    if (item.selectedOptions.filter(i => i.name
      .toLowerCase()
      .includes('дизайн конверта'))?.[0]?.value
      .toLowerCase()
      .includes('крафтовый')) {
      return 'C5';
    } else if (item.selectedOptions.filter(i => i.name
      .toLowerCase()
      .includes('дизайн конверта'))?.[0]?.value
      .toLowerCase()
      .includes('белым')) {
      return 'A5';
    } else if (item.selectedOptions.filter(i => i.name
      .toLowerCase()
      .includes('дизайн конверта'))?.[0]?.value
      .toLowerCase()
      .includes('большой')) {
      return 'A4';
    }

    return 'A4';
  }
}
