import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { PromotionManage } from './promotion-manage/promotion-manage';
import { BlogManagement } from './blog-management/blog-management';
import { UserManagement } from './user-management/user-management';

@NgModule({
  declarations: [
    App,
    PromotionManage,
    BlogManagement,
    UserManagement
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
