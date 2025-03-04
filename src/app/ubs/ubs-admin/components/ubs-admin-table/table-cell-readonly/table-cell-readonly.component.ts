import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IColumnBelonging } from '../../../models/ubs-admin.interface';
import { MouseEvents } from 'src/app/shared/mouse-events';
import { Language } from 'src/app/main/i18n/Language';
import { TableKeys } from '../../../services/table-keys.enum';

@Component({
  selector: 'app-table-cell-readonly',
  templateUrl: './table-cell-readonly.component.html',
  styleUrls: ['./table-cell-readonly.component.scss']
})
export class TableCellReadonlyComponent implements OnInit, OnChanges {
  @Input() title: string | number | { ua: string; en: string } | null;
  @Input() optional: IColumnBelonging[];
  @Input() lang: string;
  @Input() date: string;
  @Input() key: string;
  public dataObj: IColumnBelonging = null;
  public data: string | number | { ua: string; en: string } | null;
  private font = '12px Lato, sans-serif';

  ngOnInit(): void {
    if (this.optional?.length) {
      this.dataObj = this.optional.filter((item) => item.key === this.title)[0];
    }
  }

  ngOnChanges(): void {
    if (this.key === TableKeys.generalDiscount) {
      this.title = !/^0\.00 (UAH|грн)$/.test(String(this.title)) ? `-${this.title}` : this.title;
    }

    const replaceRules = {
      [Language.EN]: { regex: /л|шт/gi, match: { л: 'L', шт: 'p' } },
      [Language.UA]: { regex: /[lp]/gi, match: { l: 'л', p: 'шт' } }
    };

    if (this.key === TableKeys.bagsAmount && replaceRules[this.lang]) {
      const { regex, match } = replaceRules[this.lang];
      this.title = (this.title as string).toLowerCase().replace(regex, (el) => match[el]);
    }

    this.data = this.title;
  }

  showTooltip(event: any, tooltip: any, maxLength: number = 50): void {
    event.stopImmediatePropagation();
    const lengthStr = event.target?.innerText.split('').length;
    if (lengthStr > maxLength) {
      tooltip.toggle();
    }

    event.type === MouseEvents.MouseEnter ? this.calculateTextWidth(event, tooltip) : tooltip.hide();
  }

  calculateTextWidth(event: any, tooltip: any, maxLength: number = 40): void {
    const textContainerWidth = event.target.offsetWidth;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = this.font;
    const textWidth = Math.round(context.measureText(event.target.innerText).width);

    if (textContainerWidth < textWidth || Math.abs(textContainerWidth - textWidth) < maxLength) {
      tooltip.show();
    }
  }
}
