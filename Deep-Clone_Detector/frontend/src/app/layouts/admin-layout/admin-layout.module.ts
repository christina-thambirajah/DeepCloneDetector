import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AboutComponent } from 'src/app/pages/about/about.component';
import { ClonesComponent } from 'src/app/pages/clones/clones.component';
import { UploadComponent } from 'src/app/pages/upload/upload.component';
import { AnalyticsComponent } from 'src/app/pages/analytics/analytics.component';
import { CodeCompareComponent } from 'src/app/pages/code_compare/code_compare.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RedirectDialogComponent } from 'src/app/pages/redirect_dialog/redirect_dialog.component';
import { CodeGroupDialog } from 'src/app/pages/code_group_dialog/code_group_dialog.component';
import { SuggestionDialogComponent } from 'src/app/pages/suggestion_dialog/suggestion_dialog.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { DeleteDialogComponent } from 'src/app/pages/delete_dialog/delete_dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsComponent } from 'src/app/pages/notifications/notifications.component';

@NgModule({
  imports: [
  CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  declarations: [
    AboutComponent,
    ClonesComponent,
    UploadComponent,
    AnalyticsComponent,
    CodeCompareComponent,
    RedirectDialogComponent,
    CodeGroupDialog,
    SuggestionDialogComponent,
    DeleteDialogComponent,
  ]
})

export class AdminLayoutModule {}
