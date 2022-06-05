export default class Letter {
  constructor(item) {
    const selectedOptions = item.selectedOptions;

    this.name = selectedOptions.filter(i => i.name.includes('мя и фамилия'))[0].value;
    this.postal_code = item.postalCode;
    this.country_code = +item.countryCode;
    this.region_code = +item.stateOrProvinceCode;
    this.city = item.city;
    this.street = item.street;
    this.order_id = item.order_id;
    this.letterFormat = this.getLetterFormat(selectedOptions);
    this.picture = selectedOptions.filter(({ name }) => name.includes('исунок'))[0].value;
  }

  getLetterFormat(options) {
    const data = options.filter(({ name }) => name
      .toLowerCase()
      .includes('дизайн конверта'))?.[0]?.value
      .toLowerCase();

    if (data.includes('крафтовый')) {
      return 'C5';
    } else if (data.includes('белым')) {
      return 'A5';
    } else if (data.includes('большой')) {
      return 'A4';
    }

    return 'A4';
  }
}
