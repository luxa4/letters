<script>
import { Doughnut } from 'vue-chartjs';

export default {
  extends: Doughnut,
  props: {
    chartdata: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      options: {
        responsive: true,
        cutoutPercentage: 65,
        legend: {
          display: false
        },
        tooltips: {
          enabled: true,
          callbacks: {
            label (tooltipItem, data) {
              return `${data.labels[tooltipItem.index]} ${data.datasets[0].data[tooltipItem.index]}%`;
            }
          }
        },
        onClick: this.handle
      }
    };
  },
  mounted () {
    this.renderChart(this.chartdata, this.options);
  },
  methods: {
    handle (event, item) {
      if (this.chartdata) {
        const index = item[0]._index;
        this.$emit('onClick', index);
      }
      return item;
    }
  }
};
</script>
