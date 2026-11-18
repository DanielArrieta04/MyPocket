import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { DatabaseService } from './core/database/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

private readonly databaseService = inject(DatabaseService);

constructor() {
  this.databaseService.initialize().catch(error => {
    console.error('MyPocket: Error de base de datos', error);
  });
}

  
}
