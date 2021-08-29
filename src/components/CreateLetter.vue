<template>
  <div class="hello">
    <div class="container">
      <Troyka/>
      {{ status ? status : ''}}
      <div v-if="isCreating" class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :aria-valuenow="progressBar" aria-valuemin="0" aria-valuemax="100"
             :style="`width: ${isNaN(progressBar) ? 0 : progressBar}%`">
          {{ isNaN(progressBar) ? 0 : progressBar }} %
        </div>
      </div>
      <div v-if="letters_count" class="mt-2"><h3>Найдено {{ letters_count }} писем!</h3></div>
      <div style="margin-bottom: 15px; margin-top: 15px">
        <date-picker
            placeholder="Укажите период заказов"
            value-type="X"
            range-separator=" по "
            v-model="date"
            type="date"
            format="DD-MM-YYYY"
            range></date-picker>
      </div>
      <b-button  @click="startPdfZip" variant="success">Создать ПДФ</b-button>
      <!--      <div>{{ date }}</div>-->
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
import {twoA4} from "@/components/SvgImg/img2A4";
import {twoA5} from "@/components/SvgImg/img2A5";
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
import {Letter} from "../model/Person";

export default {
  name: 'CreateLetter',
  data() {
    return {
      status: '',
      letters: null,
      date: null,
      letters_count: 0,
      regionList: null,
      countryList: null,
      progress: 0,
      count: 0,
      isCreating: false,
      myZip: null
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
      this.letters_count = '0'
      this.count = 0;

      let zip = require("jszip-sync/dist/jszip.min.js");
      this.myZip = new zip();

      this.status = 'Поиск писем...'

      const { data } = await getOrders(this.date[0], this.date[1]);

      this.status = `Найдено ${data.items.length} писем...`;

      this.letters = data.items
          .filter(i => i.items[0]?.name?.includes('письмо')
              && i.shippingPerson.countryCode === 'RU'
              && !i.items[0]?.name?.includes('ЦК'))
          .map(i => new Letter(i));

      this.status = `Обработано ${this.letters.length} писем...`;
      // console.table(this.state);
      this.letters_count = this.letters.length

      if (this.letters_count) {
        await this.createPDF();
      }
      // try {
      //   const { data } = await createStream({
      //     symbology: SymbologyType.AZTEC,
      //   }, this.state.order, OutputTypes.SVG)
      //
      //   console.log('Result: ', data)
      // } catch (err) {
      //   console.error('Error: ', err)
      // }
    },

    createPDF() {
      const letters_in_pdf = this.createFiles();
      this.createZIP(letters_in_pdf);
    },

    createZIP(files) {
      Promise.all([...files]).then(() => {
        this.status = 'Создание архива...'
        this.myZip.generateAsync( {type: 'blob' } )
            .then((blob) => {
              this.status = '';
              saveAs(blob, `orders${1}.zip`)})
      })
    },

    createFiles() {
      let pdfDocGenerator = [];
      let prom = [];

      this.letters.forEach( (letter, id) => {
        switch (this.getEnvelopType(letter.envelope_type, letter.envelope_type_extra)) {
          case 'A4':
            pdfDocGenerator[id] = this.createPdfA4(letter);
            break;
          case 'A5':
            pdfDocGenerator[id] = this.createPdfA5(letter);
            break;
          case 'C5':
            pdfDocGenerator[id] = this.createPdfC5(letter);
            break;
        }
      })

      for (let i = 0; i < pdfDocGenerator.length; i++) {
        this.status = 'Создание конвертов...'
        prom[i] = new Promise((resolve) => {
          pdfDocGenerator[i].getBlob((blob) => {
            const letterType = this.getEnvelopType(this.letters[i].envelope_type, this.letters[i].envelope_type_extra);
            this.myZip.file(`${letterType}_${this.letters[i].order}.pdf`, blob);
            this.count++;
            resolve('Сохраняем');
          })
        })
      }

      return prom;
    },

    createPdfA4(letter) {
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
          normal: 'Arial.ttf',
          bold: 'Arial.ttf',
          italics: 'Arial.ttf',
          bolditalics: 'Arial.ttf'
        }
      }

      const docDefinition = {
        content: [
          {
            text: 'От кого',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [50, 40, 0, 0]
          },
          {
            text: 'Откуда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [50, 15, 0, 0]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 115, y1: -32,
                x2: 300, y2: -32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 115, y1: 0,
                x2: 300, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 50, y1: 32,
                x2: 300, y2: 32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 50, y1: 64,
                x2: 300, y2: 64,
                lineWidth: 1,
                color: '#2b2a29',
              },
            ]
          },
          {
            text: 'Дедушки Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: [120, -122, 0, 0]
          },
          {
            text: 'Дворец Деда Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: [120, 2, 0, 0]
          },
          {
            text: 'г.Великий Устюг',
            fontSize: 26,
            color: '#323d85',
            margin: [79, 2, 0, 0]
          },
          {
            text: 'Вологодская область, Россия',
            fontSize: 26,
            color: '#323d85',
            margin: [50, 1, 0, 0]
          },

          {
            text: letter.order_id,
            fontSize: 7,
            color: '#323d85',
            margin: [760, -100, 0, 0]
          },

          // Picture
          {
            svg: this.getPicture(letter.picture, 'A4', letter.envelope_type_extra),
            margin: [0, 90, 0, 0]
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
            margin: [50, -90, 0, 0]
          },
          {
            text: letter.postalCode,
            font: 'Pechkin',
            fontSize: 34,
            color: '#2b2a29',
            margin: [73, -11.5, 0, 0]
          },

          {
            text: 'Кому',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [450, -150, 0, 0]
          },
          {
            text: 'Куда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [450, 15, 0, 0]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 489, y1: -32,
                x2: 779, y2: -32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 489, y1: 0,
                x2: 779, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 489, y1: 32,
                x2: 779, y2: 32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 489, y1: 64,
                x2: 779, y2: 64,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 489, y1: 96,
                x2: 779, y2: 96,
                lineWidth: 1,
                color: '#2b2a29',
              }
            ]
          },
          {
            text: letter.name,
            fontSize: 26,
            color: '#323d85',
            margin: [496, -154, 0, 0]
          },
          {
            text: letter.street,
            fontSize: 26,
            color: '#323d85',
            margin: [496, 2, 0, 0]
          },
          {
            text: letter.city,
            fontSize: 26,
            color: '#323d85',
            margin: [496, 2, 0, 0]
          },
          {
            text: this.getRegion(letter.region, letter.city),
            fontSize: 26,
            color: '#323d85',
            margin: [496, 1, 0, 0]
          },
          {
            text: 'Россия',
            fontSize: 26,
            color: '#323d85',
            margin: [496, 1, 0, 0]
          }
        ],

        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [0, 0, 0, 0],
        defaultStyle: {
          font: 'Andantino'
        }
      }
      return  pdfMake.createPdf(docDefinition);
      // pdfMake.createPdf(docDefinition).open();
    },
    createPdfA5(letter) {
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
          normal: 'Arial.ttf',
          bold: 'Arial.ttf',
          italics: 'Arial.ttf',
          bolditalics: 'Arial.ttf'
        }
      }

      const docDefinition = {
        content: [

          // Picture
          {
            svg: this.getPicture(letter.picture, 'A5', letter.envelope_type_extra),
            margin: [0, 12, 0, 0]
          },
          {
            text: 'От кого',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [28, -368, 0, 0]
          },
          {
            text: 'Откуда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [28, 12, 0, 0]
          },
          {
            canvas: [
              {
                // Лини кому - оступ от линии Откуда
                type: 'line',
                x1: 92, y1: -28,
                x2: 300, y2: -28,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                // Линия Откуда - отступа не надо идет сразу от слова
                type: 'line',
                x1: 92, y1: 0,
                x2: 300, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                // Линия Великий Устюг
                type: 'line',
                x1: 28, y1: 28,
                x2: 300, y2: 28,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                // Линия Вологодская облать Россия
                type: 'line',
                x1: 28, y1: 56,
                x2: 300, y2: 56,
                lineWidth: 1,
                color: '#2b2a29',
              },
            ]
          },
          {
            text: 'Дедушки Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: [100, -110, 0, 0]
          },
          {
            text: 'Дворец Деда Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: [100, -2, 0, 0]
          },
          {
            text: 'г.Великий Устюг',
            fontSize: 26,
            color: '#323d85',
            margin: [59, -2, 0, 0]
          },
          {
            text: 'Вологодская область, Россия',
            fontSize: 26,
            color: '#323d85',
            margin: [29, -3, 0, 0]
          },
          {
            text: letter.order,
            fontSize: 7,
            color: '#323d85',
            margin: [530, -100, 0, 0]
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
            margin: [28, 263, 0, 0]
          },
          {
            text: letter.postalCode,
            font: 'Pechkin',
            fontSize: 34,
            color: '#2b2a29',
            margin: [49, -11.5, 0, 0]
          },

          {
            text: 'Кому',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [265, -150, 0, 0]
          },
          {
            text: 'Куда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [265, 15, 0, 0]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 307, y1: -32,
                x2: 544, y2: -32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 307, y1: 0,
                x2: 544, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 307, y1: 32,
                x2: 544, y2: 32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 307, y1: 64,
                x2: 544, y2: 64,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 307, y1: 96,
                x2: 544, y2: 96,
                lineWidth: 1,
                color: '#2b2a29',
              }
            ]
          },
          {
            text: letter.name,
            fontSize: 26,
            color: '#323d85',
            margin: [307, -154, 0, 0]
          },
          {
            text: letter.street,
            fontSize: 26,
            color: '#323d85',
            margin: [307, 2, 0, 0]
          },
          {
            text: letter.city,
            fontSize: 26,
            color: '#323d85',
            margin: [307, 2, 0, 0]
          },
          {
            text: this.getRegion(letter.region, letter.city),
            fontSize: 26,
            color: '#323d85',
            margin: [307, 1, 0, 0]
          },
          {
            text: 'Россия',
            fontSize: 26,
            color: '#323d85',
            margin: [307, 1, 0, 0]
          }
        ],

        pageSize: 'A5',
        pageOrientation: 'landscape',
        pageMargins: [0, 0, 0, 0],
        defaultStyle: {
          font: 'Andantino'
        }
      }

      return  pdfMake.createPdf(docDefinition);
      // pdfMake.createPdf(docDefinition).open();
    },
    createPdfC5(letter) {
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
          normal: 'Arial.ttf',
          bold: 'Arial.ttf',
          italics: 'Arial.ttf',
          bolditalics: 'Arial.ttf'
        }
      }

      const docDefinition = {
        content: [
          // Picture
          {
            svg: this.getPicture(letter.picture, 'C5', letter.envelope_type_extra),
            margin: [0, 31, 0, 0]
          },

          {
            text: 'От кого',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [28, -385, 0, 0]
          },
          {
            text: 'Откуда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [28, 12, 0, 0]
          },
          {
            canvas: [
              {
                // Лини кому - оступ от линии Откуда
                type: 'line',
                x1: 92, y1: -28,
                x2: 300, y2: -28,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                // Линия Откуда - отступа не надо идет сразу от слова
                type: 'line',
                x1: 92, y1: 0,
                x2: 300, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                // Линия Великий Устюг
                type: 'line',
                x1: 28, y1: 28,
                x2: 300, y2: 28,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                // Линия Вологодская облать Россия
                type: 'line',
                x1: 28, y1: 56,
                x2: 300, y2: 56,
                lineWidth: 1,
                color: '#2b2a29',
              },
            ]
          },
          {
            text: 'Дедушки Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: [100, -110, 0, 0]
          },
          {
            text: 'Дворец Деда Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: [100, -2, 0, 0]
          },
          {
            text: 'г.Великий Устюг',
            fontSize: 26,
            color: '#323d85',
            margin: [59, -2, 0, 0]
          },
          {
            text: 'Вологодская область, Россия',
            fontSize: 26,
            color: '#323d85',
            margin: [29, -3, 0, 0]
          },
          {
            text: letter.order,
            fontSize: 7,
            color: '#323d85',
            margin: [580, -100, 0, 0]
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
            margin: [28, 284, 0, 0]
          },
          {
            text: letter.postal_code,
            font: 'Pechkin',
            fontSize: 34,
            color: '#2b2a29',
            margin: [49, -11.5, 0, 0]
          },
          {
            text: 'Кому',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [300, -150, 0, 0]
          },
          {
            text: 'Куда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [300, 15, 0, 0]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 340, y1: -32,
                x2: 606, y2: -32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 340, y1: 0,
                x2: 606, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 340, y1: 32,
                x2: 606, y2: 32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 340, y1: 64,
                x2: 606, y2: 64,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 340, y1: 96,
                x2: 606, y2: 96,
                lineWidth: 1,
                color: '#2b2a29',
              }
            ]
          },
          {
            text: letter.name,
            fontSize: 26,
            color: '#323d85',
            margin: [340, -154, 0, 0]
          },
          {
            text: letter.street,
            fontSize: 26,
            color: '#323d85',
            margin: [340, 2, 0, 0]
          },
          {
            text: letter.city,
            fontSize: 26,
            color: '#323d85',
            margin: [340, 2, 0, 0]
          },
          {
            text: this.getRegion(letter.region, letter.city),
            fontSize: 26,
            color: '#323d85',
            margin: [340, 1, 0, 0]
          },
          {
            text: 'Россия',
            fontSize: 26,
            color: '#323d85',
            margin: [340, 1, 0, 0]
          }
        ],

        pageSize: 'C5',
        pageOrientation: 'landscape',
        pageMargins: [0, 0, 0, 0],
        defaultStyle: {
          font: 'Andantino'
        }
      }
      return  pdfMake.createPdf(docDefinition);
      // pdfMake.createPdf(docDefinition).open();
    },

    getEnvelopType(type, extraType) {
      if (type.includes('конверте С4')) return 'A4';
      if (type.toLowerCase().includes('классическое') && extraType.toLowerCase().includes('крафтовый')) return 'C5';
      return 'A5';
    },

    getRegion(regionCode, city) {
      const region = this.regionList.find(region => region.code == regionCode);
      // Если город столица региона - область не указываем
      if (city.includes(region.capital) &&  city.trim().length < region.capital.length + 3) return '';
      return region.region;
    },

    getCountry(countryCode) {
      const country = this.countryList.find(country => country.code == countryCode);
      return country.country;
    },

    getPicture(picture, envelopType, extraType) {
      if (extraType.includes('1') && envelopType === 'A4') return oneA4;
      if (extraType.includes('2') && envelopType === 'A4') return twoA4;
      if (extraType.includes('3') && envelopType === 'A4') return threeA4;
      if (extraType.includes('4') && envelopType === 'A4') return threeA4;
      if (extraType.includes('5') && envelopType === 'A4') return fiveA4;
      if (extraType.includes('6') && envelopType === 'A4') return sixA4;
      if (extraType.includes('7') && envelopType === 'A4') return sevenA4;
      if (extraType.includes('8') && envelopType === 'A4') return eightA4;
      if (extraType.includes('9') && envelopType === 'A4') return nineA4;

      if (picture.includes('1') && envelopType === 'A5') return oneA5;
      if (picture.includes('2') && envelopType === 'A5') return twoA5;
      if (picture.includes('3') && envelopType === 'A5') return threeA5;
      if (picture.includes('4') && envelopType === 'A5') return threeA5;
      if (picture.includes('5') && envelopType === 'A5') return fiveA5;
      if (picture.includes('6') && envelopType === 'A5') return sixA5;
      if (picture.includes('7') && envelopType === 'A5') return sevenA5;
      if (picture.includes('8') && envelopType === 'A5') return eightA5;
      if (picture.includes('9') && envelopType === 'A5') return nineA5;

      if (picture.includes('1') && envelopType === 'C5') return oneC5;
      if (picture.includes('2') && envelopType === 'C5') return twoC5;
      if (picture.includes('3') && envelopType === 'C5') return threeC5;
      if (picture.includes('4') && envelopType === 'C5') return threeC5;
      if (picture.includes('5') && envelopType === 'C5') return fiveC5;
      if (picture.includes('6') && envelopType === 'C5') return sixC5;
      if (picture.includes('7') && envelopType === 'C5') return sevenC5;
      if (picture.includes('8') && envelopType === 'C5') return eightC5;
      if (picture.includes('9') && envelopType === 'C5') return nineC5;
      return twoC5;
    },

    getPDF(letter) {
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
          normal: 'Arial.ttf',
          bold: 'Arial.ttf',
          italics: 'Arial.ttf',
          bolditalics: 'Arial.ttf'
        }
      }

      const docDefinition = {
        content: [
          {
            text: 'От кого',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [50, 40, 0, 0]
          },
          {
            text: 'Откуда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [50, 15, 0, 0]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 115, y1: -32,
                x2: 300, y2: -32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 115, y1: 0,
                x2: 300, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 50, y1: 32,
                x2: 300, y2: 32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 50, y1: 64,
                x2: 300, y2: 64,
                lineWidth: 1,
                color: '#2b2a29',
              },
            ]
          },
          {
            text: 'Дедушки Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: [120, -122, 0, 0]
          },
          {
            text: 'Дворец Деда Мороза',
            fontSize: 26,
            color: '#323d85',
            margin: [120, 2, 0, 0]
          },
          {
            text: 'г.Великий Устюг',
            fontSize: 26,
            color: '#323d85',
            margin: [79, 2, 0, 0]
          },
          {
            text: 'Вологодская область, Россия',
            fontSize: 26,
            color: '#323d85',
            margin: [50, 1, 0, 0]
          },

          {
            text: letter.order_id,
            fontSize: 7,
            color: '#323d85',
            margin: [760, -100, 0, 0]
          },

          // Picture
          {
            svg: this.getPicture(letter.picture, 'A4', letter.envelope_type_extra),
            margin: [0, 90, 0, 0]
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
            margin: [50, -90, 0, 0]
          },
          {
            text: letter.postalCode,
            font: 'Pechkin',
            fontSize: 34,
            color: '#2b2a29',
            margin: [73, -11.5, 0, 0]
          },

          {
            text: 'Кому',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [450, -150, 0, 0]
          },
          {
            text: 'Куда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [450, 15, 0, 0]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 489, y1: -32,
                x2: 779, y2: -32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 489, y1: 0,
                x2: 779, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 489, y1: 32,
                x2: 779, y2: 32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 489, y1: 64,
                x2: 779, y2: 64,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 489, y1: 96,
                x2: 779, y2: 96,
                lineWidth: 1,
                color: '#2b2a29',
              }
            ]
          },
          {
            text: letter.name,
            fontSize: 26,
            color: '#323d85',
            margin: [496, -154, 0, 0]
          },
          {
            text: letter.street,
            fontSize: 26,
            color: '#323d85',
            margin: [496, 2, 0, 0]
          },
          {
            text: letter.city,
            fontSize: 26,
            color: '#323d85',
            margin: [496, 2, 0, 0]
          },
          {
            text: this.getRegion(letter.region, letter.city),
            fontSize: 26,
            color: '#323d85',
            margin: [496, 1, 0, 0]
          },
          {
            text: 'Россия',
            fontSize: 26,
            color: '#323d85',
            margin: [496, 1, 0, 0]
          }
        ],

        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [0, 0, 0, 0],
        defaultStyle: {
          font: 'Andantino'
        }
      }
      return  pdfMake.createPdf(docDefinition);
      // pdfMake.createPdf(docDefinition).open();
    },

  }
}
</script>

<style scoped>
</style>
