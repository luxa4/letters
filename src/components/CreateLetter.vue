<template>
  <div class="hello">
    <div class="container">
      <Troyka/>
      {{ status ? status : ''}}
      <div v-if="isCreating" class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :aria-valuenow="progressBar" aria-valuemin="0" aria-valuemax="100"
             :style="`width: ${progressBar}%`">
          {{ progressBar }}
        </div>
      </div>
      <div v-if="result" class="mt-2"><h3>Найдено {{ result }} писем!</h3></div>
      <div style="margin-bottom: 15px; margin-top: 15px">
        <date-picker
            placeholder="Укажите период заказов"
            value-type="X"
            range-separator=" по "
            :time-picker-options="{start: '00:00', step:'00:01' , end: '23:59', format: 'HH:mm'}"
            v-model="date"
            type="datetime"
            format="DD-MM-YYYY"
            range></date-picker>
      </div>
      <b-button  @click="startPdfZip" variant="success">Создать ПДФ</b-button>
      <!--      <div>{{ date }}</div>-->
    </div>
  </div>
</template>

<script>
import Troyka from "@/components/Troyka";
import axios from "axios";
import { saveAs } from 'file-saver';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';
import 'vue2-datepicker/locale/ru';
import regionJson from '../region.json';
import countryJson from '../country.json';

import {one} from "@/components/SvgImg/img1A4";
// import {two} from "@/components/SvgImg/img2A4";
// import {three} from "@/components/SvgImg/img3A4";
// import {five} from "@/components/SvgImg/img5A4";
// import {six} from "@/components/SvgImg/img6A4";
// import {seven} from "@/components/SvgImg/img7A4";
// import {eight} from "@/components/SvgImg/img8A4";
// import {nine} from "@/components/SvgImg/img9A4";
import {oneA5} from "@/components/SvgImg/img1A5";

export default {
  name: 'CreateLetter',
  data() {
    return {
      status: '',
      state: null,
      date: null,
      result: 0,
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
      return Math.round(this.count * 100 / this.result);
    }
  },
  mounted() {
    this.regionList = regionJson;
    this.countryList = countryJson;
  },
  components: {
    Troyka,
    DatePicker
  },
  methods: {

    getEnvelopType(type) {
      if (type.includes('конверте С4')) return 'A4';
      if (type.includes('лассическое')) return 'A5';
      if (type) return 'C5';
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

    // getPicture(picture) {
    //   if (picture.includes('1')) return one;
    //   if (picture.includes('2')) return two;
    //   if (picture.includes('3')) return three;
    //   if (picture.includes('4')) return three;
    //   if (picture.includes('5')) return five;
    //   if (picture.includes('6')) return six;
    //   if (picture.includes('7')) return seven;
    //   if (picture.includes('8')) return eight;
    //   if (picture.includes('9')) return nine;
    //   return two;
    // },

    createFiles() {
      let pdfDocGenerator = [];
      let prom = [];

      this.state.forEach((order, id) => {
        // console.log('Зашли в цикл созд конвертов')
        // console.log(`Reuslt function - ${this.getEnvelopType(order.envelop)}`);
        switch (this.getEnvelopType(order.envelop)) {
          case 'A4':
            pdfDocGenerator[id] = this.createPdfA4(order);
            break;
          case 'A5':
            pdfDocGenerator[id] = this.createPdfA5(order);
            break;
          case 'C5':
            pdfDocGenerator[id] =  this.createPdfC5(order);
            break;
        }
      })

      for (let i = 0; i < pdfDocGenerator.length; i++) {
        this.status = 'Создание конвертов...'
        prom[i] = new Promise((resolve) => {
          pdfDocGenerator[i].getBlob((blob) => {
            this.myZip.file(`${this.getEnvelopType(this.state[i].envelop)}_${this.state[i].order}.pdf`, blob);
            this.count++;
            resolve('Сохраняем');
          })
        })
      }

      return prom;
    },

    makePdf() {
      const prom = this.createFiles();
      this.status = 'Создание архива...'
      Promise.all([...prom]).then(()=>{
        this.myZip.generateAsync({type:"blob"})
            .then((blob) => {
              this.status = '';
              saveAs(blob, `orders${1}.zip`)})
      })

    },

    async startPdfZip() {
      this.count = 0;
      this.isCreating = true;
      let zip = require("jszip-sync/dist/jszip.min.js");
      this.myZip = new zip();
      this.status = 'Поиск писем...'
      const { data } = await this.getOrderUsePeriod(this.date[0], this.date[1]);
      console.log('Данные с ECWID',data);
      this.state = data.items
          .filter(i => i.items[0]?.name?.includes('письмо') && i.shippingPerson.countryCode === 'RU' && !i.items[0]?.name?.includes('ЦК'))
          .map(i => {
            let obj = {
              order: i.id,
              envelop: i.items[0].name,
              picture: i.items[0].selectedOptions[8].value,
              person: i.items[0].selectedOptions[0].value,
              postalCode: i.shippingPerson.postalCode,
              country: i.shippingPerson.countryCode,
              region: i.shippingPerson.stateOrProvinceCode,
              city: i.shippingPerson.city,
              street: i.shippingPerson.street
            };
            return obj;
          });
      this.status = `Найдено ${this.state.length} писем...`;
      console.table(this.state);
      this.result = this.state.length
      this.result ? await this.makePdf() : this.result='Нет писем';
    },

    createPdfA4(order) {
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
            normal: 'arial.ttf',
            bold: 'arial.ttf',
            italics: 'arial.ttf',
            bolditalics: 'arial.ttf'
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

             // Picture
            {
              svg: one,
              margin: [35, -10, 0, 0]
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
              text: order.postalCode,
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
                  x2: 730, y2: -32,
                  lineWidth: 1,
                  color: '#2b2a29',
                },
                {
                  type: 'line',
                  x1: 489, y1: 0,
                  x2: 730, y2: 0,
                  lineWidth: 1,
                  color: '#2b2a29',
                },
                {
                  type: 'line',
                  x1: 489, y1: 32,
                  x2: 730, y2: 32,
                  lineWidth: 1,
                  color: '#2b2a29',
                },
                {
                  type: 'line',
                  x1: 489, y1: 64,
                  x2: 730, y2: 64,
                  lineWidth: 1,
                  color: '#2b2a29',
                },
                {
                  type: 'line',
                  x1: 489, y1: 96,
                  x2: 730, y2: 96,
                  lineWidth: 1,
                  color: '#2b2a29',
                }
              ]
            },
            {
              text: order.person,
              fontSize: 26,
              color: '#323d85',
              margin: [496, -154, 0, 0]
            },
            {
              text: order.street,
              fontSize: 26,
              color: '#323d85',
              margin: [496, 2, 0, 0]
            },
            {
              text: order.city,
              fontSize: 26,
              color: '#323d85',
              margin: [496, 2, 0, 0]
            },
            {
              text: this.getRegion(order.region, order.city),
              fontSize: 26,
              color: '#323d85',
              margin: [496, 1, 0, 0]
            },
            {
              text: this.getCountry(order.country),
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

        // this.myZip.file(`${order.order}.pdf`, pdfDocGenerator.getBlob((blob) => blob));



    },
    createPdfA5(order) {
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
          normal: 'arial.ttf',
          bold: 'arial.ttf',
          italics: 'arial.ttf',
          bolditalics: 'arial.ttf'
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
            margin: [28, 20, 0, 0]
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

          // Picture
          {
            svg: oneA5,
            margin: [29, 10, 0, 0]
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
            margin: [28, -15, 0, 0]
          },
          {
            text: order.postalCode,
            font: 'Pechkin',
            fontSize: 34,
            color: '#2b2a29',
            margin: [49, -12, 0, 0]
          },

          {
            text: 'Кому',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [261, -150, 0, 0]
          },
          {
            text: 'Куда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [261, 15, 0, 0]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 303, y1: -32,
                x2: 544, y2: -32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 303, y1: 0,
                x2: 544, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 303, y1: 32,
                x2: 544, y2: 32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 303, y1: 64,
                x2: 544, y2: 64,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 303, y1: 96,
                x2: 544, y2: 96,
                lineWidth: 1,
                color: '#2b2a29',
              }
            ]
          },
          {
            text: order.person,
            fontSize: 26,
            color: '#323d85',
            margin: [304, -154, 0, 0]
          },
          {
            text: order.street,
            fontSize: 26,
            color: '#323d85',
            margin: [304, 2, 0, 0]
          },
          {
            text: order.city,
            fontSize: 26,
            color: '#323d85',
            margin: [304, 2, 0, 0]
          },
          {
            text: this.getRegion(order.region, order.city),
            fontSize: 26,
            color: '#323d85',
            margin: [304, 1, 0, 0]
          },
          {
            text: this.getCountry(order.country),
            fontSize: 26,
            color: '#323d85',
            margin: [304, 1, 0, 0]
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

      // this.myZip.file(`${order.order}.pdf`, pdfDocGenerator.getBlob((blob) => blob));



    },
    createPdfC5(order) {
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
          normal: 'arial.ttf',
          bold: 'arial.ttf',
          italics: 'arial.ttf',
          bolditalics: 'arial.ttf'
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
            margin: [28, 20, 0, 0]
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

          // Picture
          {
            svg: oneA5,
            margin: [29, 10, 0, 0]
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
            margin: [28, -15, 0, 0]
          },
          {
            text: order.postalCode,
            font: 'Pechkin',
            fontSize: 34,
            color: '#2b2a29',
            margin: [49, -12, 0, 0]
          },

          {
            text: 'Кому',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [325, -150, 0, 0]
          },
          {
            text: 'Куда',
            italics: true,
            fontSize: 14,
            font: 'Arial',
            color: '#2b2a29',
            margin: [325, 15, 0, 0]
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 365, y1: -32,
                x2: 606, y2: -32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 365, y1: 0,
                x2: 606, y2: 0,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 365, y1: 32,
                x2: 606, y2: 32,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 365, y1: 64,
                x2: 606, y2: 64,
                lineWidth: 1,
                color: '#2b2a29',
              },
              {
                type: 'line',
                x1: 365, y1: 96,
                x2: 606, y2: 96,
                lineWidth: 1,
                color: '#2b2a29',
              }
            ]
          },
          {
            text: order.person,
            fontSize: 26,
            color: '#323d85',
            margin: [365, -154, 0, 0]
          },
          {
            text: order.street,
            fontSize: 26,
            color: '#323d85',
            margin: [365, 2, 0, 0]
          },
          {
            text: order.city,
            fontSize: 26,
            color: '#323d85',
            margin: [365, 2, 0, 0]
          },
          {
            text: this.getRegion(order.region, order.city),
            fontSize: 26,
            color: '#323d85',
            margin: [365, 1, 0, 0]
          },
          {
            text: this.getCountry(order.country),
            fontSize: 26,
            color: '#323d85',
            margin: [365, 1, 0, 0]
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

      // this.myZip.file(`${order.order}.pdf`, pdfDocGenerator.getBlob((blob) => blob));



    },


    getOrderUsePeriod(createdFrom, createdTo) {
      const url = `https://app.ecwid.com/api/v3/1569218/orders?token=secret_Wk9esm1V9SNWQLdXnyhjaVwxQgX68b4L&createdFrom=${createdFrom}&createdTo=${createdTo}`
      return axios.get(url);
    }
  }
}
</script>

<style scoped>
</style>
