import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';
import { HabitAssignService } from '@global-service/habit-assign/habit-assign.service';
import { take, takeUntil } from 'rxjs/operators';
import { HabitService } from '@global-service/habit/habit.service';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { ShoppingListService } from './habit-edit-shopping-list/shopping-list.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WarningPopUpComponent } from '@shared/components';
import { Location } from '@angular/common';
import { HabitStatus } from '@global-models/habit/HabitStatus.enum';
import { habitImages } from 'src/app/main/image-pathes/habits-images';
import { EcoNewsDto } from '@eco-news-models/eco-news-dto';
import { EcoNewsService } from '@eco-news-service/eco-news.service';
import { EcoNewsModel } from '@eco-news-models/eco-news-model';
import { HabitAcquireConfirm, HabitCongratulation, HabitGiveUp, HabitLeavePage } from '@global-user/components/habit/models/habit-warnings';
import { WarningDialog } from '@global-user/models/warning-dialog.inteface';
import { HabitAssignInterface } from '../models/interfaces/habit-assign.interface';
import { HabitInterface, HabitListInterface } from '../models/interfaces/habit.interface';
import { AllShoppingLists, CustomShoppingItem, HabitUpdateShopList, ShoppingList } from '../../../models/shoppinglist.interface';

@Component({
  selector: 'app-add-new-habit',
  templateUrl: './add-new-habit.component.html',
  styleUrls: ['./add-new-habit.component.scss']
})
export class AddNewHabitComponent implements OnInit {
  assignedHabit: HabitAssignInterface;
  habitResponse: HabitInterface;

  recommendedHabits: HabitInterface[];
  recommendedNews: EcoNewsModel[];

  newDuration: number;
  initialDuration: number;
  initialShoppingList: ShoppingList[];
  standartShopList: ShoppingList[] = [];
  customShopList: ShoppingList[];

  isAcquired = false;
  isEditing = false;
  isCustom = false;
  canAcquire = false;
  setStatus = 'ACQUIRED';

  whiteStar = 'assets/img/icon/star-2.png';
  greenStar = 'assets/img/icon/star-1.png';
  stars = [this.whiteStar, this.whiteStar, this.whiteStar];

  habitImage: string;
  defaultImage = habitImages.defaultImage;
  star: number;

  private habitId: number;
  private habitAssignId: number;
  private userId: number;
  private currentLang: string;
  private enoughToAcquire = 80;
  private page = 0;
  private size = 3;

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private habitService: HabitService,
    private snackBar: MatSnackBarComponent,
    private habitAssignService: HabitAssignService,
    private newsSevice: EcoNewsService,
    private shopListService: ShoppingListService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    private location: Location
  ) {}

  ngOnInit() {
    this.getUserId();
    this.subscribeToLangChange();
    this.bindLang(this.localStorageService.getCurrentLanguage());
    this.route.params.subscribe((params) => {
      if (this.router.url.includes('add')) {
        this.habitId = Number(params.habitId);
      } else {
        this.isEditing = true;
        this.habitAssignId = Number(params.habitAssignId);
      }
    });
    this.checkIfAssigned();
    this.getRecommendedNews(this.page, this.size);
  }

  private bindLang(lang: string): void {
    this.translate.setDefaultLang(lang);
    this.currentLang = lang;
  }

  private subscribeToLangChange(): void {
    this.localStorageService.languageSubject.pipe(takeUntil(this.destroyed$)).subscribe((lang: string) => {
      this.bindLang(lang);
      this.checkIfAssigned();
    });
  }

  private checkIfAssigned(): void {
    if (this.isEditing) {
      this.habitAssignService
        .getHabitByAssignId(this.habitAssignId, this.currentLang)
        .pipe(take(1))
        .subscribe((res: HabitAssignInterface) => {
          this.assignedHabit = res;
          this.habitId = this.assignedHabit.habit.id;
          this.isAcquired = this.assignedHabit.status === HabitStatus.ACQUIRED;
          this.initialDuration = res.duration;
          this.initHabitData(res.habit);
          this.getCustomShopList();
        });
    } else {
      this.getDefaultHabit();
    }
  }

  private getRecommendedHabits(page: number, size: number, tags: string[]): void {
    this.habitService
      .getHabitsByTagAndLang(page, size, tags, this.currentLang)
      .pipe(take(1))
      .subscribe((data: HabitListInterface) => {
        this.recommendedHabits = data.page;
      });
  }

  private getRecommendedNews(page: number, size: number): void {
    this.newsSevice
      .getEcoNewsListByPage(page, size)
      .pipe(take(1))
      .subscribe((res: EcoNewsDto) => {
        this.recommendedNews = res.page;
      });
  }

  private getDefaultHabit(): void {
    this.habitService
      .getHabitById(this.habitId)
      .pipe(take(1))
      .subscribe((data: HabitInterface) => {
        this.initHabitData(data);
        this.initialDuration = data.defaultDuration;
        if (data.isCustomHabit) {
          data.customShoppingListItems.forEach((item) => (item.custom = true));
          this.initialShoppingList = data.customShoppingListItems;
        } else {
          this.getStandartShopList();
        }
      });
  }

  private initHabitData(habit: HabitInterface): void {
    this.habitResponse = habit;
    this.habitImage = this.habitResponse.image ? this.habitResponse.image : this.defaultImage;
    this.isCustom = habit.isCustomHabit;
    this.getStars(habit.complexity);
    if (this.habitResponse.tags && this.habitResponse.tags.length) {
      this.getRecommendedHabits(this.page, this.size, [this.habitResponse.tags[0]]);
    }
  }

  private getStars(complexity: number): void {
    for (this.star = 0; this.star < complexity; this.star++) {
      this.stars[this.star] = this.greenStar;
    }
  }

  onGoBack(): void {
    const isHabitWasEdited = this.initialDuration !== this.newDuration || this.standartShopList || this.customShopList;
    if (isHabitWasEdited) {
      const dialogRef = this.getOpenDialog(HabitLeavePage, false);
      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((confirm) => {
          if (confirm) {
            this.location.back();
          }
        });
    } else {
      this.location.back();
    }
  }

  private getUserId() {
    this.userId = this.localStorageService.getUserId();
  }

  getDuration(newDuration: number): void {
    this.newDuration = newDuration;
  }

  getProgressValue(progress: number): void {
    this.canAcquire = progress >= this.enoughToAcquire;
    if (this.canAcquire && !this.assignedHabit.progressNotificationHasDisplayed && !this.isAcquired) {
      const dialogRef = this.getOpenDialog(HabitCongratulation, true);
      this.afterDialogClosed(dialogRef);
      this.habitAssignService.progressNotificationHasDisplayed(this.habitAssignId).pipe(take(1)).subscribe();
    }
  }

  getList(list: ShoppingList[]): void {
    this.standartShopList = list.filter((item) => !item.custom);
    this.customShopList = list.filter((item) => item.custom);
  }

  private getStandartShopList(): void {
    this.shopListService
      .getHabitShopList(this.habitId)
      .pipe(take(1))
      .subscribe((res) => {
        this.initialShoppingList = res;
      });
  }

  private getCustomShopList(): void {
    this.shopListService
      .getHabitAllShopLists(this.habitAssignId, this.currentLang)
      .pipe(take(1))
      .subscribe((res: AllShoppingLists) => {
        res.customShoppingListItemDto.forEach((item) => (item.custom = true));
        this.initialShoppingList = [...res.customShoppingListItemDto, ...res.userShoppingListItemDto];
      });
  }

  giveUpHabit(): void {
    const dialogRef = this.getOpenDialog(HabitGiveUp, true);
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirm) => {
        if (confirm) {
          this.habitAssignService
            .deleteHabitById(this.habitAssignId)
            .pipe(take(1))
            .subscribe(() => {
              this.goToProfile();
              this.snackBar.openSnackBar('habitDeleted');
            });
        } else {
          this.snackBar.openSnackBar('habitDidNotGiveUp');
        }
      });
  }

  goToProfile(): void {
    this.router.navigate(['profile', this.userId]);
  }

  addHabit(): void {
    const defailtItemsIds = this.standartShopList.filter((item) => item.selected === true).map((item) => item.id);
    this.habitAssignService
      .assignCustomHabit(this.habitId, this.newDuration, defailtItemsIds)
      .pipe(take(1))
      .subscribe(() => {
        if (this.customShopList && this.customShopList.length) {
          this.addCustomHabitItems();
        }
        if (!this.customShopList) {
          this.goToProfile();
          this.snackBar.openSnackBar('habitAdded');
        }
      });
  }

  private addCustomHabitItems(): void {
    const customItemsList: CustomShoppingItem[] = this.customShopList.map((item) => ({
      text: item.text
    }));
    this.shopListService
      .addHabitCustomShopList(this.userId, this.habitId, customItemsList)
      .pipe(take(1))
      .subscribe(() => {
        this.goToProfile();
        this.snackBar.openSnackBar('habitAdded');
      });
  }

  updateHabit(): void {
    this.habitAssignService
      .updateHabit(this.habitAssignId, this.newDuration)
      .pipe(take(1))
      .subscribe(() => {
        if (this.customShopList || this.standartShopList) {
          this.convertShopLists();
          const habitShopListUpdate = this.setHabitListForUpdate();
          this.shopListService
            .updateHabitShopList(habitShopListUpdate)
            .pipe(take(1))
            .subscribe(() => {
              this.afterHabitWasUpdated();
            });
        }
        this.afterHabitWasUpdated();
      });
  }

  private convertShopLists(): void {
    this.customShopList.forEach((el) => {
      delete el.custom;
      delete el.selected;
    });
    this.standartShopList.forEach((el) => {
      delete el.custom;
      delete el.selected;
    });
  }

  private afterHabitWasUpdated(): void {
    this.goToProfile();
    this.snackBar.openSnackBar('habitUpdated');
  }

  private setHabitListForUpdate(): HabitUpdateShopList {
    const shopListUpdate: HabitUpdateShopList = {
      habitAssignId: this.habitAssignId,
      customShopList: this.customShopList,
      standartShopList: this.standartShopList,
      lang: this.currentLang
    };
    return shopListUpdate;
  }

  openAcquireConfirm(): void {
    const dialogRef = this.getOpenDialog(HabitAcquireConfirm, true);
    this.afterDialogClosed(dialogRef);
  }

  getOpenDialog(dialogConfig: WarningDialog, isHabitNameNeeded: boolean): MatDialogRef<WarningPopUpComponent> {
    return this.dialog.open(WarningPopUpComponent, {
      hasBackdrop: true,
      closeOnNavigation: true,
      disableClose: true,
      panelClass: 'popup-dialog-container',
      data: {
        popupTitle: dialogConfig.title,
        popupSubtitle: dialogConfig.subtitle,
        popupConfirm: dialogConfig.confirm,
        popupCancel: dialogConfig.cancel,
        isHabit: isHabitNameNeeded,
        habitName: this.habitResponse.habitTranslation.name
      }
    });
  }

  afterDialogClosed(dialogRef: MatDialogRef<WarningPopUpComponent>) {
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirm) => {
        if (confirm) {
          this.acquireHabit();
        } else {
          this.snackBar.openSnackBar('habitDidNotGiveUp');
        }
      });
  }

  acquireHabit(): void {
    this.habitAssignService
      .setHabitStatus(this.habitAssignId, this.setStatus)
      .pipe(take(1))
      .subscribe(() => {
        this.goToProfile();
        this.snackBar.openSnackBar('habitAcquired');
      });
  }
}
