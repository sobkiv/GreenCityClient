import { DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { HabitMark } from '@global-user/components/habit/models/HabitMark.enum';
import { take } from 'rxjs/operators';
import { HabitAssignInterface } from '../../models/interfaces/habit-assign.interface';

@Component({
  selector: 'app-habit-progress',
  templateUrl: './habit-progress.component.html',
  styleUrls: ['./habit-progress.component.scss']
})
export class HabitProgressComponent implements OnChanges {
  @Input() habit: HabitAssignInterface;
  public indicator: number;
  isRequest = false;
  currentDate: string;
  showPhoto: boolean;
  daysCounter: number;
  habitMark: string;
  heightThumbLabel = 4;
  public isHidden = false;
  private descriptionType = {
    acquired: () => {
      this.habitMark = HabitMark.ACQUIRED;
    },
    done: () => {
      this.habitMark = HabitMark.DONE;
    },
    undone: () => {
      this.habitMark = HabitMark.UNDONE;
    }
  };

  @Output() nowAcquiredHabit = new EventEmitter();
  @Output() progressValue = new EventEmitter<number>();

  constructor(private habitAssignService: HabitAssignService, public datePipe: DatePipe) {}

  ngOnChanges() {
    this.currentDate = this.datePipe.transform(new Date(), 'yyy-MM-dd');
    if (this.habit) {
      this.buildHabitDescription();
      this.countProgressBar();
    }
  }

  public countProgressBar(): void {
    this.indicator = Math.round((this.habit.workingDays / this.habit.duration) * 100);
    this.progressValue.emit(this.indicator);
  }

  public buildHabitDescription(): void {
    const isDone = this.habit.habitStatusCalendarDtoList.some((item) => item.enrollDate === this.currentDate);
    if (this.habit.status === HabitStatus.ACQUIRED) {
      this.descriptionType.acquired();
    } else if (this.habit.status === HabitStatus.INPROGRESS) {
      if (isDone) {
        this.descriptionType.done();
      } else {
        this.descriptionType.undone();
      }
    }
  }

  public enroll() {
    this.isRequest = true;
    this.habitAssignService
      .enrollByHabit(this.habit.id, this.currentDate)
      .pipe(take(1))
      .subscribe((response: HabitAssignInterface) => {
        if (response.status === HabitStatus.ACQUIRED) {
          this.descriptionType.acquired();
          this.nowAcquiredHabit.emit(response);
        } else {
          this.updateHabit(response);
        }
      });
  }

  public unenroll() {
    this.isRequest = true;
    this.habitAssignService
      .unenrollByHabit(this.habit.id, this.currentDate)
      .pipe(take(1))
      .subscribe((response: HabitAssignInterface) => {
        this.updateHabit(response);
      });
  }

  private updateHabit(response: HabitAssignInterface): void {
    this.habit.habitStatusCalendarDtoList = response.habitStatusCalendarDtoList;
    this.habit.workingDays = response.workingDays;
    this.habit.habitStreak = response.habitStreak;
    this.buildHabitDescription();
    this.countProgressBar();
    this.isRequest = false;
  }

  public getDayName(): string {
    return this.habit.habitStreak === 1 ? 'user.habit.one-habit.good-day' : 'user.habit.one-habit.good-days';
  }
}
