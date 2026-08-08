import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling, Router, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { filter } from 'rxjs';
import { routes } from './app.routes';
import { LanguageService } from './services/language-service';
import { authInterceptor } from './interceptors/auth-interceptor';
import { SeoService } from './services/seo-service';

/** route tree-ს ყველაზე ღრმა შვილობილი მარშრუტის data-ს იღებს (ე.წ. leaf route) */
function getLeafRouteData(snapshot: ActivatedRouteSnapshot): Record<string, any> {
  let route = snapshot;
  while (route.firstChild) {
    route = route.firstChild;
  }
  return route.data;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const langService = inject(LanguageService);
      return langService.init();
    }),
    provideAppInitializer(() => {
      // route-ის შეცვლისას ავტომატურად ვანახლებთ title/meta ტეგებს route.data-დან.
      // დინამური გვერდები (მაგ. car/:id) საკუთარ SeoService.update()-ს იძახებენ ngOnInit-ში
      // და გადააფარებენ ამ default მნიშვნელობებს.
      const router = inject(Router);
      const seo = inject(SeoService);
      router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => {
          const data = getLeafRouteData(router.routerState.snapshot.root);
          if (data['title'] && data['description']) {
            seo.update({
              title: data['title'],
              description: data['description'],
              noindex: !!data['noindex']
            });
          }
        });
    })
  ]
};