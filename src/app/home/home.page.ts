import { Component, OnInit } from '@angular/core';

import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  constructor() {}

  Highcharts: typeof Highcharts = Highcharts;

  // Gráfico 24 horas
  chart24!: Highcharts.Chart;
  currentIndex24: number = 0;
  categories24: string[] = [];
  prices24: number[] = [];

  // Gráfico 12 horas
  chart12!: Highcharts.Chart;
  currentIndex12: number = 0;
  categories12: string[] = [];
  prices12: number[] = [];

  // Gráfico Columnas 24 horas
  chartColumn24!: Highcharts.Chart;
  categoriesColumn24: string[] = [];
  pricesColumn24: number[] = [];

  // Gráfico Columnas 12 horas
  chartColumn12!: Highcharts.Chart;
  categoriesColumn12: string[] = [];
  pricesColumn12: number[] = [];

  ngOnInit() {
    this.categories24 = this.generateQuarterHours(24);
    this.prices24 = this.generateRandomPrices(96);
    this.categories12 = this.generateQuarterHours(12);
    this.prices12 = this.generateRandomPrices(48);

    this.twentyFourHours();
    this.twelveHours();

    this.column24HourChart();
    this.column12HourChart();
  }
  
  twentyFourHours() {
    this.chart24 = this.createChart('chart-container-24', this.categories24, this.prices24, '24 horas', (index) => {
      this.currentIndex24 = index;
      this.updateTooltip(this.chart24, this.currentIndex24);
    });
  }
  
  twelveHours() {
    this.chart12 = this.createChart('chart-container-12', this.categories12, this.prices12, '12 horas', (index) => {
      this.currentIndex12 = index;
      this.updateTooltip(this.chart12, this.currentIndex12);
    });
  }

  column24HourChart() {
    this.chartColumn24 = this.createChartColumn('chart-column-container-24', this.categories24, this.prices24, '24 horas');
  }

  column12HourChart() {
    this.chartColumn12 = this.createChartColumn('chart-column-container-12', this.categories12, this.prices12, '12 horas');
  }

  //Graficos
  createChart(
    containerId: string,
    categories: string[],
    prices: number[],
    title: string,
    onPointClick: (index: number) => void
  ): Highcharts.Chart {
      return Highcharts.chart(containerId, {
        chart: { type: 'areaspline' },
        title: { text: title },
        xAxis: { categories, title: { text: 'Hora del Día' } },
        yAxis: { title: { text: 'Precios' }, min: 0 },
        series: [
          {
            type: 'areaspline',
            name: 'Precio',
            data: prices,
            fillOpacity: 0,
            marker: { 
              enabled: false,
              states: {
                hover: {
                  enabled: true,
                  radius: 6, // Ajusta el tamaño
                },
              },
            },
          },
        ],
        tooltip: {
          shared: true,
          formatter: function () {
            return `<b>${this.x}</b>: ${this.y} €`;
          },
        },
        plotOptions: {
          series: {
            point: {
              events: {
                click: (event) => {
                  onPointClick(event.point.index);
                },
              },
            },
          },
        },
      });
  }

  createChartColumn(
    containerId: string,
    categories: string[],
    prices: number[],
    title: string
  ): Highcharts.Chart {
    const colors = this.getColorsForValues(prices);
    const heights = this.getHeightsForValues(prices);

    const scaledHeights = heights.map((height) => height * 0.25);

    return Highcharts.chart(containerId, {
      chart: { 
        type: 'column',
        height: 300
      },
      title: { text: title },
      xAxis: { categories, title: { text: 'Hora del Día' } },
      yAxis: {
        visible: false,
        max: 3
      },
      series: [
        {
          type: 'column',
          data: prices.map((price, index) => ({
            y: scaledHeights[index],
            color: colors[index],  // Asignamos el color correspondiente
          })),
          showInLegend: false,
          pointWidth: 4 // ancho de las columnas
        },
      ],
      tooltip: {
        shared: true,
        formatter: function () {
          return `<b>${this.x}</b>: ${this.y} €`;
        },
      },
      plotOptions: {
        column: {
          borderRadius: 2,
          grouping: false,
          dataGrouping: {
            enabled: false
          }
        }
      }
    });
  }

  // Generadores de datos
  generateQuarterHours(hours: number): string[] {
    const times: string[] = [];
    for (let hour = 0; hour < hours; hour++) {
      for (let quarter = 0; quarter < 60; quarter += 15) {
        times.push(`${hour.toString().padStart(2, '0')}:${quarter.toString().padStart(2, '0')}`);
      }
    }
    console.log('[generateQuarterHours]', times);
    return times;
  }

  generateRandomPrices(points: number): number[] {
    const values: number[] = Array.from({ length: points }, () => Math.floor(Math.random() * 100));
    console.log('[generateRandomPrices]', values);
    return values;
  }

  // Asignar colores y alturas
  // Función para obtener los colores basados en los valores de los precios
  getColorsForValues(prices: number[]): string[] {
    // Ordenar los precios para determinar los rangos
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const lowThreshold = sortedPrices[Math.floor(prices.length / 3)]; // Umbral para el rango bajo
    const highThreshold = sortedPrices[Math.floor(2 * prices.length / 3)]; // Umbral para el rango alto

    return prices.map((price) => {
      if (price <= lowThreshold) {
        return '#25DF6F';  // valores más bajos
      } else if (price <= highThreshold) {
        return '#FFBB6A';  // valores intermedios
      } else {
        return '#FF4F4F';  // valores más altos
      }
    });
  }  

  // Función para calcular las alturas entre 1 y 3 para cada precio
  getHeightsForValues(prices: number[]): number[] {
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const lowThreshold = sortedPrices[Math.floor(prices.length / 3)];
    const highThreshold = sortedPrices[Math.floor(2 * prices.length / 3)];

    return prices.map((price) => {
      if (price <= lowThreshold) {
        return 1;  // Baja altura para valores más bajos
      } else if (price <= highThreshold) {
        return 2;  // Altura intermedia
      } else {
        return 3;  // Alta altura para valores más altos
      }
    });
  }

  // Control Botones
  previousPoint(chart: Highcharts.Chart, currentIndex: number): number {
    if (currentIndex > 0) {
      currentIndex--;
      this.updateTooltip(chart, currentIndex);
    }
    return currentIndex;
  }

  nextPoint(chart: Highcharts.Chart, prices: number[], currentIndex: number): number {
    if (currentIndex < prices.length - 1) {
      currentIndex++;
      this.updateTooltip(chart, currentIndex);
    }
    return currentIndex;
  }

  updateTooltip(chart: Highcharts.Chart, currentIndex: number) {
    // Limpia el estado hover de todos los puntos
    //chart.series[0].data.forEach((p) => p.setState('')); 
    // Obtén el punto actual
    const point = chart.series[0].data[currentIndex];
    if (point) {
      // Establece el estado hover en el punto actual
      point.setState('hover');
      // Actualiza el tooltip para mostrar el punto actual
      chart.tooltip.refresh(point);
       // Dibuja la crosshair en el punto actual
      chart.xAxis[0].drawCrosshair(undefined, point);
    }
  }
}
