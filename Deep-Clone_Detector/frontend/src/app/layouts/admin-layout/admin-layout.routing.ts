import { Routes } from '@angular/router';
import { AboutComponent } from 'src/app/pages/about/about.component';
import { AnalyticsComponent } from 'src/app/pages/analytics/analytics.component';
import { ClonesComponent } from 'src/app/pages/clones/clones.component';
import { UploadComponent } from 'src/app/pages/upload/upload.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'about',      component: AboutComponent },
    { path: 'upload',      component: UploadComponent },
    { path: 'clones',      component: ClonesComponent },
    { path: 'analytics',      component: AnalyticsComponent }
];
