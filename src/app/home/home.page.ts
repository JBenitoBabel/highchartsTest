import { Component, inject, OnInit } from '@angular/core';
import { RefresherCustomEvent } from '@ionic/angular';
import { MessageComponent } from '../message/message.component';

import { DataService, Message } from '../services/data.service';

import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private data = inject(DataService);
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

  ngOnInit() {
    this.twentyFourHours();
    this.twelveHours();
  }
  
  twentyFourHours() {
    this.categories24 = this.generateQuarterHours(24);
    this.prices24 = this.generateRandomPrices(96);

    this.chart24 = this.createChart('chart-container-24', this.categories24, this.prices24, '24 horas', (index) => {
      this.currentIndex24 = index;
      this.updateTooltip(this.chart24, this.prices24, this.currentIndex24);
    });
  }
  
  twelveHours() {
    this.categories12 = this.generateQuarterHours(12);
    this.prices12 = this.generateRandomPrices(48);

    this.chart12 = this.createChart('chart-container-12', this.categories12, this.prices12, '12 horas', (index) => {
      this.currentIndex12 = index;
      this.updateTooltip(this.chart12, this.prices12, this.currentIndex12);
    });
  }

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
            marker: { enabled: false },
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

  // Control Botones
  previousPoint(chart: Highcharts.Chart, prices: number[], currentIndex: number): number {
    if (currentIndex > 0) {
      currentIndex--;
      this.updateTooltip(chart, prices, currentIndex);
    }
    return currentIndex;
  }

  nextPoint(chart: Highcharts.Chart, prices: number[], currentIndex: number): number {
    if (currentIndex < prices.length - 1) {
      currentIndex++;
      this.updateTooltip(chart, prices, currentIndex);
    }
    return currentIndex;
  }

  updateTooltip(chart: Highcharts.Chart, prices: number[], currentIndex: number) {
    const point = chart.series[0].data[currentIndex];
    if (point) {
      point.setState('hover');
      chart.tooltip.refresh(point);
      chart.xAxis[0].drawCrosshair(undefined, point);
    }
  }

  /*
  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  getMessages(): Message[] {
    return this.data.getMessages();
  }
    */
}
