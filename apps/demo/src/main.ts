import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideConstellation } from '@swapnil-srivastava/constellation-angular';
import { AppComponent } from './app/app.component';
import { localComponentMap } from './app/local-component-map';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([]),
    provideHttpClient(),
    provideAnimations(),
    { provide: APP_BASE_HREF, useValue: '/' },
    // Reads ./sdk-config.json at runtime. Pass { sdkConfig } instead to supply it in code.
    provideConstellation({ localComponentMap })
  ]
}).catch(err => console.error(err));
