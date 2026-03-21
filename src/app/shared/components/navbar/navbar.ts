import { Component, effect, inject, input, output, signal } from '@angular/core';
import { routes } from '../../../app.routes';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { filter, map } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {

  toggleNavBar = output();

  routerService = inject(Router);

  routes = routes
    .map(r => ({ path: `${r.path ?? ''}`, title: `${r.title ?? ''}` }))
    .filter(r => r.path !== "**");


  currentUrl$ = this.routerService.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map((value) => value.urlAfterRedirects),
    map(url => url.replace("/", "")),
    map((url) => this.routes.find(route => route.path === url)?.title ?? ''),
    takeUntilDestroyed()
  )

  currentPath = toSignal(this.currentUrl$, { initialValue: '' });

  showNavBar = input.required<boolean>();

  toggleShowNavBar = () => this.toggleNavBar.emit();

}
