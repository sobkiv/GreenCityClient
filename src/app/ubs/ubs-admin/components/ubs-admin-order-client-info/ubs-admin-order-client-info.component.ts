import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { AddViolationsComponent } from '../add-violations/add-violations.component';
import { IUserInfo, IGeneralOrderInfo } from '../../models/ubs-admin.interface';
import { Masks } from 'src/assets/patterns/patterns';
import { OrderStatus } from 'src/app/ubs/ubs/order-status.enum';

@Component({
  selector: 'app-ubs-admin-order-client-info',
  templateUrl: './ubs-admin-order-client-info.component.html',
  styleUrls: ['./ubs-admin-order-client-info.component.scss']
})
export class UbsAdminOrderClientInfoComponent implements OnInit, OnDestroy {
  @Input() userInfo: IUserInfo;
  @Input() userInfoDto: FormGroup;

  @Input() orderId: number;

  @Input() generalInfo: IGeneralOrderInfo;

  phoneMask = Masks.phoneMask;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  pageOpen: boolean;
  public userViolationForCurrentOrder: number;
  public totalUserViolations: number;
  isStatus = false;

  constructor(private dialog: MatDialog) {}

  get recipientEmail() {
    return this.userInfoDto.get('recipientEmail');
  }

  ngOnInit(): void {
    this.pageOpen = true;
    this.setViolationData();
    this.isStatus = this.generalInfo.orderStatus === OrderStatus.CANCELED;
  }

  openDetails(): void {
    this.pageOpen = !this.pageOpen;
  }

  public setViolationData(): void {
    this.totalUserViolations = this.userInfo.totalUserViolations;
    this.userViolationForCurrentOrder = this.userInfo.userViolationForCurrentOrder;
  }

  openModal(viewMode: boolean): void {
    const matDialogRef = this.dialog.open(AddViolationsComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'admin-cabinet-dialog-container',
      data: {
        id: this.orderId,
        viewMode
      }
    });

    matDialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        if (typeof res === 'number') {
          this.userViolationForCurrentOrder += res;
          this.totalUserViolations += res;
        }
      });
  }

  getErrorMessage(abstractControl: AbstractControl, name?: string): string {
    if (abstractControl.errors.required) {
      return 'input-error.required';
    }

    if (abstractControl.errors.maxlength) {
      return 'input-error.max-length';
    }

    if (abstractControl.errors.pattern && !name) {
      return 'input-error.pattern';
    }

    if (abstractControl.errors.pattern && name === 'recipientPhoneNumber') {
      return 'input-error.number-format';
    }

    if (abstractControl.errors.wrongNumber) {
      return 'input-error.number-wrong';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
