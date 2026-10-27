import { Component, OnInit } from '@angular/core';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/about', title: 'Documentation', icon: 'nc-world-2', class: '' },
    { path: '/upload', title: 'Upload Source Code', icon: 'nc-cloud-upload-94', class: '' },
    { path: '/clones', title: 'Clones Detected', icon: 'nc-single-copy-04', class: '' },
    { path: '/analytics', title: 'Clone Analytics', icon: 'nc-chart-pie-36', class: '' },
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public menuItems: any[] = [];
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
