<template>
  <div class="hello">
    <div class="container">
      <Troyka/>
      <div v-if="letters_count">
      {{ status ? status : ''}}
      <div class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
             :aria-valuenow="progressBar" aria-valuemin="0" aria-valuemax="100"
             :style="`width: ${ isNaN(progressBar) ? 0 : progressBar }%`">
          {{ isNaN(progressBar) ? 0 : progressBar }} %
        </div>
      </div>
      </div>
      <div v-if="letters_count" class="mt-2">
        <h3>{{ findLetters }}</h3>
      </div>
      <div v-if="letters_count === 0">
        <h3>Писем не найдено</h3>
      </div>
      <div style="margin-bottom: 15px; margin-top: 15px">
        <date-picker
            placeholder="Укажите период заказов"
            value-type="X"
            range-separator=" по "
            v-model="date"
            type="date"
            format="DD-MM-YYYY"
            range/>
      </div>
      <b-button
          @click="startPdfZip"
          variant="success">
          Начать волшебство
      </b-button>
    </div>
  </div>
</template>

<script>
import { getOrders } from "../services";
import Troyka from "@/components/Troyka";
import { saveAs } from 'file-saver';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import 'vue2-datepicker/locale/ru';
import regionJson from '../region.json';

import {oneA4} from "@/components/SvgImg/img1A4";
import {oneA5} from "@/components/SvgImg/img1A5";
import {oneC5} from "@/components/SvgImg/img1C5";
import {twoC5} from "@/components/SvgImg/img2C5";
import {threeA4} from "@/components/SvgImg/img3A4";
import {threeA5} from "@/components/SvgImg/img3A5";
import {threeC5} from "@/components/SvgImg/img3C5";
import {fiveA4} from "@/components/SvgImg/img5A4";
import {fiveA5} from "@/components/SvgImg/img5A5";
import {fiveC5} from "@/components/SvgImg/img5C5";
import {sixA4} from "@/components/SvgImg/img6A4";
import {sixA5} from "@/components/SvgImg/img6A5";
import {sixC5} from "@/components/SvgImg/img6C5";
import {sevenA4} from "@/components/SvgImg/img7A4";
import {sevenA5} from "@/components/SvgImg/img7A5";
import {sevenC5} from "@/components/SvgImg/img7C5";
import {eightA4} from "@/components/SvgImg/img8A4";
import {eightA5} from "@/components/SvgImg/img8A5";
import {eightC5} from "@/components/SvgImg/img8C5";
import {nineA4} from "@/components/SvgImg/img9A4";
import {nineA5} from "@/components/SvgImg/img9A5";
import {nineC5} from "@/components/SvgImg/img9C5";
import {tenA4} from "@/components/SvgImg/img10A4";
import {tenA5} from "@/components/SvgImg/img10A5";
import {tenC5} from "@/components/SvgImg/img10C5";
import {elevenA4} from "@/components/SvgImg/img11A4";
import {elevenA5} from "@/components/SvgImg/img11A5";
import {elevenC5} from "@/components/SvgImg/img11C5";
import {Letter} from "../model/Letter";
import bwipjs from 'bwip-js';

export default {
  name: 'CreateLetter',
  data() {
    return {
      status: '',
      letters: null,
      date: null,
      letters_count: null,
      regionList: null,
      countryList: null,
      progress: 0,
      count: 0,
      isCreating: false,
      myZip: null,
      myAztec: null,
      parametersA4: {
        marginPicture: [0, 150, 0, 0],
        marginTextFromWho: [50, -497, 0, 0],
        marginTextFrom: [50, 15, 0, 0],
        lineTop1: [115, -32, 300, -32],
        lineTop2: [115, 0, 300, 0],
        lineTop3: [50, 32, 300, 32],
        lineTop4: [50, 64, 300, 64],
        marginTextDedMoroz: [120, -122, 0, 0],
        marginTextDvorec: [120, 2, 0, 0],
        marginTextCity: [79, 2, 0, 0],
        marginTextRegion: [50, 1, 0, 0],
        marginOrderId: [760, -100, 0, 0],
        marginPostalPic: [50, 390, 0, 0],
        marginPostal: [73, -11.5, 0, 0],
        marginTextWho: [450, -150, 0, 0],
        marginTextWhere: [450, 15, 0, 0],
        lineDown1: [489, -32, 779, -32],
        lineDown2: [489, 0, 779, 0],
        lineDown3: [489, 32, 779, 32],
        lineDown4: [489, 64, 779, 64],
        lineDown5: [489, 96, 779, 96],
        marginPerson: [496, -154, 0, 0],
        marginCity: [496, 2, 0, 0],
        marginStreet: [496, 2, 0, 0],
        marginRegion: [496, 1, 0, 0],
        marginRussia: [496, 1, 0, 0],
        pageSize: 'A4'
      },
      parametersA5: {
        marginPicture: [-1, 13, 0, 0],
        marginTextFromWho: [28, -380, 0, 0],
        marginTextFrom: [28, 12, 0, 0],
        lineTop1: [92, -28, 300, -28],
        lineTop2: [92, 0, 300, 0],
        lineTop3: [28, 28, 300, 28],
        lineTop4: [28, 56, 300, 56],
        marginTextDedMoroz: [100, -110, 0, 0],
        marginTextDvorec: [100, -2, 0, 0],
        marginTextCity: [59, -2, 0, 0],
        marginTextRegion: [29, -3, 0, 0],
        marginOrderId: [530, -100, 0, 0],
        marginPostalPic: [28, 264, 0, 0],
        marginPostal: [49, -11.2, 0, 0],
        marginTextWho: [265, -150, 0, 0],
        marginTextWhere: [265, 15, 0, 0],
        lineDown1: [305, -32, 571, -32],
        lineDown2: [305, 0, 571, 0],
        lineDown3: [305, 32, 571, 32],
        lineDown4: [305, 64, 571, 64],
        lineDown5: [305, 96, 571, 96],
        marginPerson: [305, -154, 0, 0],
        marginCity: [305, 2, 0, 0],
        marginStreet: [305, 2, 0, 0],
        marginRegion: [305, 1, 0, 0],
        marginRussia: [305, 1, 0, 0],
        pageSize: 'A5'
      },
      parametersC5: {
        marginPicture: [-1, 29, 0, 0],
        marginTextFromWho: [28, -380, 0, 0],
        marginTextFrom: [28, 12, 0, 0],
        lineTop1: [92, -28, 300, -28],
        lineTop2: [92, 0, 300, 0],
        lineTop3: [28, 28, 300, 28],
        lineTop4: [28, 56, 300, 56],
        marginTextDedMoroz: [100, -110, 0, 0],
        marginTextDvorec: [100, -2, 0, 0],
        marginTextCity: [59, -2, 0, 0],
        marginTextRegion: [29, -3, 0, 0],
        marginOrderId: [580, -100, 0, 0],
        marginPostalPic: [28, 280, 0, 0],
        marginPostal: [49, -11.2, 0, 0],
        marginTextWho: [300, -150, 0, 0],
        marginTextWhere: [300, 15, 0, 0],
        lineDown1: [340, -32, 606, -32],
        lineDown2: [340, 0, 606, 0],
        lineDown3: [340, 32, 606, 32],
        lineDown4: [340, 64, 606, 64],
        lineDown5: [340, 96, 606, 96],
        marginPerson: [340, -154, 0, 0],
        marginCity: [340, 2, 0, 0],
        marginStreet: [340, 2, 0, 0],
        marginRegion: [340, 1, 0, 0],
        marginRussia: [340, 1, 0, 0],
        pageSize: 'C5'
      }
    }
  },
  watch: {
    // date(v) {
    //   console.log(v)
    // },
    // myZip(value) {
    //   console.log(value);
    // },
    // count(v) {
    //   console.log("Каунт ",v);
    // }
  },
  computed: {
    progressBar() {
      return Math.round(this.count * 100 / this.letters_count);
    },
    findLetters() {
      return `Найдено ${this.letters_count}
       ${this.plural(this.letters_count, 'письмо', 'письма', 'писем')}!`
    }
  },
  mounted() {
    this.regionList = regionJson;
    // this.countryList = countryJson;
  },
  components: {
    Troyka,
    DatePicker
  },
  methods: {
    async startPdfZip() {
      this.isCreating = true;
      this.count = 0;

      let zip = require("jszip-sync/dist/jszip.min.js");
      this.myZip = new zip();

      this.status = 'Поиск писем...'

      const [ startDay, endDay ] = this.date;

      const { data } = await getOrders(startDay, endDay);


      this.letters = data.items
          .filter(i => i.items[0]?.name?.includes('письмо')
              && i.shippingPerson.countryCode === 'RU'
              && !i.items[0]?.name?.includes('ЦК'))
          .map(i => new Letter(i));

      this.status = `Обработано ${this.letters.length} `;
      this.letters_count = this.letters.length;


      bwipjs.toBuffer({
        bcid:        'azteccode',       // Barcode type
        text:        '13213213',    // Text to encode
        scale:       3,               // 3x scaling factor
        height:      10,              // Bar height, in millimeters
        includetext: true,            // Show human-readable text
        textxalign:  'center',        // Always good to set this
      }, function (err, png) {
        if (err) {
          // `err` may be a string or Error object
        } else {

          console.log(png)
        }
      });

      if (this.letters_count) {
        await this.createPDF();
      }



      // try {
      //   const { data } = await createStream({
      //     symbology: SymbologyType.AZTEC,
      //   }, this.state.order, OutputType.SVG)
      //
      //   console.log('Result: ', data)
      // } catch (err) {
      //   console.error('Error: ', err)
      // }
    },

    async createPDF() {
      await this.createFiles();
      // this.createZIP();
    },

    createZIP() {
      this.myZip.generateAsync( {type: 'blob' } )
          .then((blob) => {
            this.status = '';
            saveAs(blob, `orders${1}.zip`)
          })
    },

    async createFiles() {
      let pdfArray = [];
      let pdfBlobs = [];

      // Создаем ПДФ конверты и помещаем в массив
      this.letters.forEach( (letter, id) => {
        this.status = `Создание PDF - ${id + 1} из ${this.letters.length}`
        const letterType = this.getEnvelopType(letter.type, letter.type_extra);
          pdfArray[id] = this.createTo(letterType, letter);

      })

      // ПДФ файлы перобразуем в blob и добавляем в архив
      for (let i = 0; i < pdfArray.length; i++) {
        this.status = `Упаковка PDF в архив - ${i + 1} из ${pdfArray.length}`

        pdfBlobs[i] = await new Promise(resolve => {
          setTimeout(() => {
            pdfArray[i].getBlob((blob) => {
              resolve(blob);
            });
          },0)
        })
        this.count++;

        const letterType = this.getEnvelopType(this.letters[i].type, this.letters[i].type_extra);
        // Добавляем в архив
        this.myZip.file(`${letterType}_${this.letters[i].order_id}.pdf`, pdfBlobs[i]);
      }

    },

    getLetterParameters(envelope_type) {
      if (envelope_type === 'A4') return this.parametersA4;
      if (envelope_type === 'A5') return this.parametersA5;
      return this.parametersC5;
    },

    createTo(envelope_type, letter) {
      console.log(envelope_type)
      const parameters = this.getLetterParameters(envelope_type);
      const pdfMake = require('pdfmake/build/pdfmake.js')

      if (pdfMake.vfs == undefined) {
        let pdfFonts = require('pdfmake/build/vfs_fonts.js')
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      pdfMake.fonts = {
        Andantino: {
          normal: 'Andantino script.ttf',
          bold: 'Andantino script.ttf',
          italics: 'Andantino script.ttf',
          bolditalics: 'Andantino script.ttf'
        },
        Pechkin: {
          normal: 'Pechkin_35011.ttf',
          bold: 'Pechkin_35011.ttf',
          italics: 'Pechkin_35011.ttf',
          bolditalics: 'Pechkin_35011.ttf'
        },
        Arial: {
          normal: 'arial_italic.ttf',
          bold: 'arial_italic.ttf',
          italics: 'arial_italic.ttf',
          bolditalics: 'arial_italic.ttf'
        }
      }

      const docDefinition = {
        content: [
          // Picture
          {
            svg: this.getPicture(letter),
            margin: parameters.marginPicture
          },
          {
            text: 'От кого',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: parameters.marginTextFromWho
          },
          {
            text: 'Откуда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: parameters.marginTextFrom
          },
          {
            canvas: [
              {
                type: 'line',
                x1: parameters.lineTop1[0], y1: parameters.lineTop1[1],
                x2: parameters.lineTop1[2], y2: parameters.lineTop1[3],
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: parameters.lineTop2[0], y1: parameters.lineTop2[1],
                x2: parameters.lineTop2[2], y2: parameters.lineTop2[3],
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: parameters.lineTop3[0], y1: parameters.lineTop3[1],
                x2: parameters.lineTop3[2], y2: parameters.lineTop3[3],
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: parameters.lineTop4[0], y1: parameters.lineTop4[1],
                x2: parameters.lineTop4[2], y2: parameters.lineTop4[3],
                lineWidth: 1,
                color: '#2b2a29',
              },
            ]
          },
          {
            text: 'Дедушки Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginTextDedMoroz
          },
          {
            text: 'Дворец Деда Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginTextDvorec
          },
          {
            text: 'г.Великий Устюг',
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginTextCity
          },
          {
            text: 'Вологодская область, Россия',
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginTextRegion
          },

          {
            text: letter.order_id,
            fontSize: 7,
            color: '#323d85',
            margin: parameters.marginOrderId
          },

          // PostalCode
          {
            svg: '<svg width="173mm" height="74mm" version="1.1" viewBox="0 0 61.76 26.462" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n' +
                ' <g transform="translate(-72.686 -83.531)" clip-rule="evenodd" shape-rendering="geometricPrecision">\n' +
                '  <rect class="fil0 str0" x="73.038" y="83.884" width="61.054" height="18.647" fill="none" image-rendering="optimizeQuality" stroke="#5b5b5b" stroke-dasharray="1.4112, 2.1168" stroke-miterlimit="22.926" stroke-width=".7056"/>\n' +
                '  <polygon class="fil3" transform="matrix(.01 0 0 .01 61.533 -79.28)" points="1132.6 18527 1132.6 18727 1832.6 18727 1832.6 18527" fill="#2b2a29" image-rendering="optimizeQuality"/>\n' +
                '  <polygon class="fil3" transform="matrix(.01 0 0 .01 61.533 -79.28)" points="1132.6 18827 1132.6 18927 1832.6 18927 1832.6 18827" fill="#2b2a29" image-rendering="optimizeQuality"/>\n' +
                ' </g>\n' +
                '</svg>',
            margin: parameters.marginPostalPic
          },
          {
            text: letter.postal_code,
            font: 'Pechkin',
            fontSize: 34,
            color: '#2b2a29',
            margin: parameters.marginPostal
          },

          {
            text: 'Кому',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: parameters.marginTextWho
          },
          {
            text: 'Куда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: parameters.marginTextWhere
          },
          {
            canvas: [
              {
                type: 'line',
                x1: parameters.lineDown1[0], y1: parameters.lineDown1[1],
                x2: parameters.lineDown1[2], y2: parameters.lineDown1[3],
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: parameters.lineDown2[0], y1: parameters.lineDown2[1],
                x2: parameters.lineDown2[2], y2: parameters.lineDown2[3],
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: parameters.lineDown3[0], y1: parameters.lineDown3[1],
                x2: parameters.lineDown3[2], y2: parameters.lineDown3[3],
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: parameters.lineDown4[0], y1: parameters.lineDown4[1],
                x2: parameters.lineDown4[2], y2: parameters.lineDown4[3],
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: parameters.lineDown5[0], y1: parameters.lineDown5[1],
                x2: parameters.lineDown5[2], y2: parameters.lineDown5[3],
                lineWidth: 1,
                color: '#2b2a29',
              }
            ]
          },
          {
            text: letter.name,
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginPerson
          },
          {
            text: letter.street,
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginStreet
          },
          {
            text: letter.city,
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginCity
          },
          {
            text: this.getRegion(letter),
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginRegion
          },
          {
            text: 'Россия',
            fontSize: 26,
            color: '#323d85',
            margin: parameters.marginRussia
          }
        ],

        pageSize: parameters.pageSize,
        pageOrientation: 'landscape',
        pageMargins: [0, 0, 0, 0],
        defaultStyle: {
          font: 'Andantino'
        }
      }
      // return  pdfMake.createPdf(docDefinition);
      pdfMake.createPdf(docDefinition).open();
    },

    getEnvelopType(type, extraType) {
      if (type.includes('конверте С4')) return 'A4';
      if (type.toLowerCase().includes('классическое') && extraType.toLowerCase().includes('крафтовый')) return 'C5';
      return 'A5';
    },

    getRegion( {region_code, city} ) {
      const region = this.regionList.find(region => region.code === region_code);
      // Если город столица региона - область не указываем
      if (city.includes(region.capital) &&  city.trim().length < region.capital.length + 3) return '';
      return region.region;
    },

    getCountry(countryCode) {
      const country = this.countryList.find(country => country.code === countryCode);
      return country.country;
    },

    getPicture( { picture, type, type_extra} ) {
      if (type === 'A4') {
        if (type_extra.includes('1')) return oneA4;
        if (type_extra.includes('2')) return fiveA4;
        if (type_extra.includes('3')) return threeA4;
        if (type_extra.includes('4')) return elevenA4;
        if (type_extra.includes('5')) return tenA4;
        if (type_extra.includes('6')) return sixA4;
        if (type_extra.includes('7')) return sevenA4;
        if (type_extra.includes('8')) return eightA4;
        if (type_extra.includes('9')) return nineA4;
      }

      if (type === 'A5') {
        if (picture.includes('1')) return oneA5;
        if (picture.includes('2')) return fiveA5;
        if (picture.includes('3')) return threeA5;
        if (picture.includes('4')) return elevenA5;
        if (picture.includes('5')) return tenA5;
        if (picture.includes('6')) return sixA5;
        if (picture.includes('7')) return sevenA5;
        if (picture.includes('8')) return eightA5;
        if (picture.includes('9')) return nineA5;
      }

      if (picture.includes('1')) return oneC5;
      if (picture.includes('2')) return fiveC5;
      if (picture.includes('3')) return threeC5;
      if (picture.includes('4')) return elevenC5;
      if (picture.includes('5')) return tenC5;
      if (picture.includes('6')) return sixC5;
      if (picture.includes('7')) return sevenC5;
      if (picture.includes('8')) return eightC5;
      if (picture.includes('9')) return nineC5;

      return twoC5;
    },
    plural (number, one, two, five) {
      console.log('Enter in plural', number)
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
  }
}
</script>