<template>
  <div class="bg-white rounded-xl border shadow p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">
      Monthly Collections
    </h3>

    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

export default {
  props: {
    labels: Array,
    values: Array
  },

  mounted() {
    new Chart(this.$refs.chart, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: 'Total Amount (₱)',
            data: this.values,
            backgroundColor: '#2563eb'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })
  }
}
</script>
