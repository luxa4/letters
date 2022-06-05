<template>
<div class="navigate">
  <div class="order-panel">
    <div class="logo">
      <div style="width: 400px; height: 400px; position: relative">
        <img width="400" height="400" src="../assets/img/10.png" alt=""/>
        <div @click="showControls = !showControls" class="btnSec"/>
      </div>
    </div>
    <div class="panel active" v-if="showControls">
      <div style="margin-bottom: 15px; margin-top: 15px">
        <date-picker
          placeholder="Укажите период заказов"
          valueType="X"
          rangeSeparator=" по "
          v-model="date"
          type="date"
          format="DD-MM-YYYY"
          range/>
      </div>
      <b-button
        @click="startPdfZip"
        :disabled="disabled"
        variant="success">
        Начать волшебство
      </b-button>
      <!--<div style="text-align: center; margin-top: 15px">
        <router-link class="btn btn-danger" to="/map">
          Карта заказов
        </router-link>
      </div>-->
    </div>
  </div>
  <div class="order-result">
    <div class="hide">
      <div v-if="lettersCount">
        {{ status ? status : ''}}
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
               :aria-valuenow="progressBar" aria-valuemin="0" aria-valuemax="100"
               :style="`width: ${ isNaN(progressBar) ? 0 : progressBar }%`">
            {{ isNaN(progressBar) ? 0 : progressBar }} %
          </div>
        </div>
      </div>
      <div v-if="lettersCount" class="mt-2">
        <!--        <ChartPie-->
        <!--          :chartData="chartData"/>-->
        <h3>{{ findLetters }}</h3>
      </div>
      <div v-if="lettersCount === 0">
        <h3>Писем не найдено</h3>
      </div>
    </div>
  </div>
  <canvas hidden id="qr-code"/>
  <canvas hidden data-convert-img />
  <img data-img="A4-1" hidden src="/img/A4-1.png" alt=""/>
  <img data-img="A4-2" hidden src="/img/A4-2.png" alt=""/>
  <img data-img="A4-3" hidden src="/img/A4-3.png" alt=""/>
  <img data-img="A4-5" hidden src="/img/A4-5.png" alt=""/>
  <img data-img="A4-6" hidden src="/img/A4-6.png" alt=""/>
  <img data-img="A4-7" hidden src="/img/A4-7.png" alt=""/>
  <img data-img="A4-8" hidden src="/img/A4-8.png" alt=""/>
  <img data-img="A4-9" hidden src="/img/A4-9.png" alt=""/>
  <img data-img="A5-1" hidden src="/img/A5-1.png" alt=""/>
  <img data-img="A5-2" hidden src="/img/A5-2.png" alt=""/>
  <img data-img="A5-3" hidden src="/img/A5-3.png" alt=""/>
  <img data-img="A5-5" hidden src="/img/A5-5.png" alt=""/>
  <img data-img="A5-6" hidden src="/img/A5-6.png" alt=""/>
  <img data-img="A5-7" hidden src="/img/A5-7.png" alt=""/>
  <img data-img="A5-8" hidden src="/img/A5-8.png" alt=""/>
  <img data-img="A5-9" hidden src="/img/A5-9.png" alt=""/>
  <img data-img="C5-1" hidden src="/img/C5-1.png" alt=""/>
  <img data-img="C5-2" hidden src="/img/C5-2.png" alt=""/>
  <img data-img="C5-3" hidden src="/img/C5-3.png" alt=""/>
  <img data-img="C5-5" hidden src="/img/C5-5.png" alt=""/>
  <img data-img="C5-6" hidden src="/img/C5-6.png" alt=""/>
  <img data-img="C5-7" hidden src="/img/C5-7.png" alt=""/>
  <img data-img="C5-8" hidden src="/img/C5-8.png" alt=""/>
  <img data-img="C5-9" hidden src="/img/C5-9.png" alt=""/>
</div>
</template>

<script>
import Letter from '@/model/Letter';

import { getOrders } from '@/services';


import { saveAs } from 'file-saver';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

import 'vue2-datepicker/locale/ru';
import regionJson from '@/region.json';
import bwipjs from 'bwip-js';
import { plural } from '@/helper';
// import ChartPie from '@/components/ChartPie';

export default {
  name: 'CreateLetter',
  data() {
    return {
      chartData: {
        labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        datasets: [
          {
            backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
            data: [40, 20, 80, 10]
          }
        ]
      },
      img: null,
      showControls: false,
      status: '',
      letters: [],
      orders: null,
      disabled: false,
      date: null,
      lettersCount: null,
      regionList: null,
      countryList: null,
      progress: 0,
      count: 0,
      isCreating: false,
      myZip: null,
      myAztec: null,
      parametersA4: {
        marginPicture: [0, 150, 0, 0],
        pictureSize: {
          width: 436,
          height: 388
        },
        marginAztec: [245,-37,0,0],
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
        pictureSize: {
          width: 352,
          height: 374
        },
        marginAztec: [220,-37,0,0],
        marginTextFromWho: [28, -365, 0, 0],
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
        pictureSize: {
          width: 365,
          height: 387
        },
        marginAztec: [220,-37,0,0],
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
    };
  },
  computed: {
    progressBar() {
      return Math.round(this.count * 100 / this.lettersCount);
    },
    findLetters() {
      return `Найдено ${this.orders.length} ${plural(this.orders.length, 'заказ', 'заказа', 'заказов')}
       и ${this.lettersCount} ${plural(this.lettersCount, 'письмо', 'письма', 'писем')}!`;
    }
  },
  mounted() {
    this.regionList = regionJson;
  },
  components: {
    DatePicker,
    // ChartPie
  },
  methods: {
    async startPdfZip() {
      if (document.querySelector('.hide.active')) {
        document.querySelector('.hide.active').classList.remove('active');
      }


      document.querySelector('.order-result').classList.add('animation-result');


      this.letters = [];
      this.orders = [];
      this.disabled = true;
      this.isCreating = true;
      this.count = 0;

      let zip = require('jszip-sync/dist/jszip.min.js');
      this.myZip = new zip();

      this.status = 'Поиск писем...';

      const [ startDay, endDay ] = this.date;

      const { data } = await getOrders(startDay, endDay);

      this.orders = data.items;

      this.orders.forEach(i => {
        if (i.shippingPerson.countryCode === 'RU') {
          i.items.forEach( order => {
            if (order?.name?.includes('исьмо') && !order?.name?.includes('ЦК')) {
              this.letters.push(Object.assign(order, i.shippingPerson, { order_id : i.id }, { orderType: order.name }));
            }
          });
        }
      });

      this.letters = this.letters.map(i => new Letter(i));

      this.lettersCount = this.letters.length;

      this.$nextTick(() => {
        document.querySelector('.hide').classList.add('active');
      });

      this.status = `Обработано ${this.lettersCount} `;

      if (this.lettersCount) {
        await this.createPDF();
      }
      this.disabled = false;
    },

    async createPDF() {
      await this.createFiles();
      this.createZIP();
    },

    createZIP() {
      this.myZip.generateAsync( { type: 'blob' } )
          .then((blob) => {
            this.status = '';
            saveAs(blob, `orders${1}.zip`);
          });
    },
    getAztecCode(order) {
        let aztecCanvas = bwipjs.toCanvas('qr-code', {
          bcid:        'azteccode',
          text:        `ORDER-${order}`,
          scale:       1,
          width:       14,
          height:      14,
          includetext: false,
          textxalign:  'center',
        });
        return aztecCanvas.toDataURL('image/png');
    },

    getImage(letterFormat, picture) {
      const canvas = document.querySelector('canvas[data-convert-img]');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const image = this.getImgForCanvas(letterFormat, picture);

      canvas.width = this.getCanvasSize(letterFormat).width;
      canvas.height = this.getCanvasSize(letterFormat).height;

      ctx.drawImage(image, 0, 0);

      return canvas.toDataURL('image/png', 1.0);
    },

    getCanvasSize(letterFormat) {
      let size = {};

      if (letterFormat === 'A4') {
          size = {
            width: 582,
            height: 517
          };
      } else if (letterFormat === 'A5') {
        size = {
          width: 469,
          height: 499
        };
      } else {
        size = {
          width: 487,
          height: 516
        };
      }

      return size;
    },

    getImgForCanvas(letterFormat, picture) {
      const number = this.getNumberPicture(picture);

      return document.querySelector(`img[data-img=${letterFormat}-${number}]`);
    },

    async createFiles() {
      let pdfArray = [];
      let pdfBlobs = [];

      // Создаем ПДФ конверты и помещаем в массив pdfArray
      this.letters.forEach( (letter, id) => {
        this.status = `Создание PDF - ${id + 1} из ${this.lettersCount}`;
        const aztecCode = this.getAztecCode(letter.order_id);
        pdfArray[id] = this.createTo(letter, aztecCode);
      });

      // ПДФ файлы преобразуем в blob и добавляем в архив
      for (let i = 0; i < pdfArray.length; i++) {
        this.status = `Упаковка PDF в архив - ${i + 1} из ${pdfArray.length}`;

        pdfBlobs[i] = await new Promise(resolve => {
          setTimeout(() => {
            pdfArray[i].getBlob((blob) => {
              resolve(blob);
            });
          },0);
        });
        this.count++;

        // Добавляем в архив
        this.myZip.file(`${i + 1}_${this.letters[i].letterFormat}_${this.letters[i].order_id}.pdf`, pdfBlobs[i]);
      }

    },

    getLetterParameters(letterFormat) {
      if (letterFormat === 'A4') return this.parametersA4;
      if (letterFormat === 'A5') return this.parametersA5;
      return this.parametersC5;
    },

    createTo(letter, aztecCode) {
      const parameters = this.getLetterParameters(letter.letterFormat);
      const pdfMake = require('pdfmake/build/pdfmake.js');

      if (pdfMake.vfs == undefined) {
        let pdfFonts = require('pdfmake/build/vfs_fonts.js');
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      pdfMake.fonts = {
        Andantino: {
          normal: 'Andantino script.ttf',
        },
        Pechkin: {
          normal: 'Pechkin_35011.ttf',
        },
        Arial: {
          italics: 'arial_italic.ttf',
        }
      };

      const docDefinition = {
        content: [
          // Picture
          {
            image: this.getImage(letter.letterFormat, letter.picture),
            width: parameters.pictureSize.width,
            height: parameters.pictureSize.height,
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
            text: letter.order_id.slice(-4),
            fontSize: 10,
            color: '#323d85',
            margin: parameters.marginOrderId
          },

          // PostalCode
          {
            svg: '<svg width="173mm" height="74mm" version="1.1" viewBox="0 0 61.76 26.462" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
                ' <g transform="translate(-72.686 -83.531)" clip-rule="evenodd" shape-rendering="geometricPrecision">' +
                '  <rect class="fil0 str0" x="73.038" y="83.884" width="61.054" height="18.647" fill="none" image-rendering="optimizeQuality" stroke="#5b5b5b" stroke-dasharray="1.4112, 2.1168" stroke-miterlimit="22.926" stroke-width=".7056"/>' +
                '  <polygon class="fil3" transform="matrix(.01 0 0 .01 61.533 -79.28)" points="1132.6 18527 1132.6 18727 1832.6 18727 1832.6 18527" fill="#2b2a29" image-rendering="optimizeQuality"/>' +
                '  <polygon class="fil3" transform="matrix(.01 0 0 .01 61.533 -79.28)" points="1132.6 18827 1132.6 18927 1832.6 18927 1832.6 18827" fill="#2b2a29" image-rendering="optimizeQuality"/>' +
                ' </g>' +
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
            image: aztecCode,
            margin: parameters.marginAztec,
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
      };
      return  pdfMake.createPdf(docDefinition);
      // pdfMake.createPdf(docDefinition).open();
    },

    getRegion( { region_code, city } ) {
      const region = this.regionList.find(region => region.code === region_code);
      // Если город - столица региона - область не указываем
      if (city.includes(region.capital) &&  city.trim().length < region.capital.length + 3) return '';
      return region.region;
    },

    getCountry(countryCode) {
      const country = this.countryList.find(country => country.code === countryCode);
      return country.country;
    },

    getNumberPicture(picture) {
      if (picture.includes('1')) return 1;
      if (picture.includes('2')) return 2;
      if (picture.includes('3')) return 3;
      if (picture.includes('4')) return 4;
      if (picture.includes('5')) return 5;
      if (picture.includes('6')) return 6;
      if (picture.includes('7')) return 7;
      if (picture.includes('8')) return 8;
      if (picture.includes('9')) return 9;

      return 1;
    },
  }
};
</script>

<style lang="sass" scoped>
.btn
  width: 320px

.hide
  opacity: 0
  transition: opacity 0.8s ease 2s

.logo
  display: flex
  justify-content: center
  align-content: center
  padding-bottom: 18px

.btnSec
  position: absolute
  height: 10px
  width: 10px
  top: 257px
  right: 142px
  border-radius: 10px

.navigate
  display: flex

.order-panel
  height: 520px
  margin-right: 30px

.order-result
  display: flex
  justify-content: center
  align-items: center
  width: 0
  background: #dee2e6
  border-radius: 20px
  padding: 0
  box-shadow: 0 0 7px -3px rgba(0, 0, 0, .5)

.animation-result
  animation: result 2s ease  forwards

@keyframes result
  0%
    width: 0
    padding: 0

  100%
    width: 400px
    padding: 13px

.panel
  width: 100%
  margin: 0 auto
  bottom: 0
  opacity: 0
  transition: opacity .3s linear

.active
  opacity: 1
</style>
