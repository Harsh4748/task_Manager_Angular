import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-task-chart',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border dark:border-gray-800 p-6 mb-6 transition-colors duration-300">
      <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">📊 Task Analytics</h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Total -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ totalTasks }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
        </div>
        <!-- Completed -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ completedTasks }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Completed</p>
        </div>
        <!-- Pending -->
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
          <p class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ pendingTasks }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">Pending</p>
        </div>
      </div>

      <div class="flex justify-center" style="max-height: 250px;">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `
})
export class TaskChart implements OnChanges, AfterViewInit {
  @Input() tasks: any[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private viewReady = false;

  get totalTasks() { return this.tasks.length; }
  get completedTasks() { return this.tasks.filter(t => t.completed).length; }
  get pendingTasks() { return this.tasks.filter(t => !t.completed).length; }

  ngAfterViewInit() {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && this.viewReady) {
      this.renderChart();
    }
  }

  private renderChart() {
    if (!this.chartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{
          data: [this.completedTasks, this.pendingTasks],
          backgroundColor: ['#22c55e', '#f97316'],
          borderColor: isDark ? '#1f2937' : '#ffffff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: isDark ? '#d1d5db' : '#374151',
              padding: 20,
              font: { size: 13 }
            }
          }
        }
      }
    });
  }
}
