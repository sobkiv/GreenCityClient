import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderService } from 'src/app/main/component/ubs/services/order.service';
import { ResponceOrderFondyModel } from '../models/ResponceOrderFondyModel';
import { OrderFondyClientDto } from '../models/OrderFondyClientDto';

@Component({
  selector: 'app-ubs-user-order-payment-pop-up',
  templateUrl: './ubs-user-order-payment-pop-up.component.html',
  styleUrls: ['./ubs-user-order-payment-pop-up.component.scss']
})
export class UbsUserOrderPaymentPopUpComponent implements OnInit {
  public totalSum = 0;
  public bonusValue = 0;
  public selectedRadio: string;
  public certificatePattern = /(?!0000)\d{4}-(?!0000)\d{4}/;
  public certificateMask = '0000-0000';
  public orderDetailsForm: FormGroup;
  public certificates: string[] = [];
  public certificateStatus: boolean[] = [];
  public certificateError = false;
  public orderId = 0;
  public certificateStatusActive = false;
  public certificateSum = 0;
  public certificateSums: Map<number, number> = new Map();
  public certificateDate: string;
  public orderFondyClientDto: OrderFondyClientDto;

  constructor(private fb: FormBuilder, private orderService: OrderService, @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.initForm();
    this.totalSum = this.data.price;
    this.orderId = this.data.orderId;
    this.certificateStatus.push(true);
    this.orderFondyClientDto = new OrderFondyClientDto();
  }

  public initForm(): void {
    this.orderDetailsForm = this.fb.group({
      bonus: new FormControl('no', [Validators.required]),
      paymentSystem: new FormControl('Fondy', [Validators.required]),
      formArrayCertificates: this.fb.array([new FormControl('', [Validators.minLength(8), Validators.pattern(this.certificatePattern)])])
    });
  }

  get formArrayCertificates(): FormArray {
    return this.orderDetailsForm.get('formArrayCertificates') as FormArray;
  }

  get formPaymentSystem(): FormControl {
    return this.orderDetailsForm.get('paymentSystem') as FormControl;
  }

  public certificateSubmit(index: number, certificate: FormControl): void {
    if (!this.certificates.includes(this.formArrayCertificates.value[index])) {
      this.certificates.push(this.formArrayCertificates.value[index]);
      this.calculateCertificate(index, certificate);
      this.certificateStatus[index] = false;
    }
  }

  public calculateCertificate(index: number, certificate: FormControl) {
    this.certificateSum = 0;
    this.certificateStatusActive = false;
    this.orderService.processCertificate(certificate.value).subscribe(
      (responce) => {
        if (responce.certificateStatus === 'ACTIVE') {
          this.certificateDate = responce.certificateDate;
          this.certificateSum = responce.certificatePoints;
          this.certificateSums.set(index, this.certificateSum);
          this.totalSum -= responce.certificatePoints;
          if (this.totalSum < 0) {
            this.totalSum = 0;
          }
          this.certificateStatusActive = true;
        } else {
          this.certificateError = true;
          this.certificateSums.set(index, this.certificateSum);
        }
      },
      (error) => {
        if (error.status === 404) {
          this.certificateError = true;
        }
      }
    );
  }

  public deleteCertificate(index: number): void {
    debugger;
    this.totalSum += this.certificateSums.get(index);
    this.certificateStatusActive = false;
    this.certificateSums.delete(index);
    this.certificateError = false;

    if (this.formArrayCertificates.controls.length > 1) {
      this.certificateStatus.splice(index, 1);
      this.formArrayCertificates.removeAt(index);
    } else {
      this.certificateStatus[index] = true;
      this.formArrayCertificates.controls[index].reset();
    }

    this.certificates.splice(index, 1);
  }

  addNewCertificate(): void {
    this.formArrayCertificates.push(this.fb.control('', [Validators.minLength(8), Validators.pattern(this.certificatePattern)]));
    this.certificateStatusActive = false;
    this.certificateStatus.push(true);
  }

  public processOrder(): void {
    this.orderFondyClientDto.orderId = this.orderId;
    this.orderFondyClientDto.sum = this.totalSum;

    if (this.formPaymentSystem.value === 'Fondy') {
      this.orderService.processOrderFondyFromUserOrderList(this.orderFondyClientDto).subscribe((responce: ResponceOrderFondyModel) => {
        document.location.href = responce.link;
      });
    }
  }
}
