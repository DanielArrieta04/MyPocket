import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { defineCustomElements } from 'jeep-sqlite/loader';



import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';



if (Capacitor.getPlatform() === 'web') {
  defineCustomElements(window);

  const jeepSqlite = document.createElement('jeep-sqlite');
  document.body.appendChild(jeepSqlite);
}


bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
