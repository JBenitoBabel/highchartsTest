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

  ngOnInit() {
    this.createChart(24);
    this.createChart(12);
  }

  createChart(hour: number) {
    Highcharts.chart(`chart-container${hour}`, {
      chart: {
        type: 'areaspline',
      },
      title: {
        text: 'Precios por Cuartos de Hora',
      },
      xAxis: {
        categories: this.generateQuarterHours(hour),
        title: {
          text: 'Hora del Día',
        },
      },
      yAxis: {
        title: {
          text: 'Precios',
        },
        min: 0,
      },
      series: [
        {
          type: 'areaspline',
          name: 'Precio',
          data: this.generateRandomPrices(hour),
          fillOpacity: 0, // Esto hace que las áreas no sean visibles
        },
      ],
      plotOptions: {
        areaspline: {
          marker: {
            enabled: false, // Opcional: oculta los puntos
          },
        },
      },
      tooltip: {
        shared: true,
        valueSuffix: ' €',
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

  generateRandomPrices(hours: number): number[] {
    const points = (hours == 24) ? 96 : 48;
    const values: number[] = Array.from({ length: points }, () => Math.floor(Math.random() * 100));
    console.log('[generateRandomPrices]', values);
    return values;
  }


  refresh(ev: any) {
    setTimeout(() => {
      (ev as RefresherCustomEvent).detail.complete();
    }, 3000);
  }

  getMessages(): Message[] {
    return this.data.getMessages();
  }
}
