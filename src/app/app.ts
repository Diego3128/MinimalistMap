import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./shared/components/navbar/navbar";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, NgClass],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('OpenMaP');

  showNavBar = signal(true);

  toggleNavBar = () => this.showNavBar.update(prev => !prev);

}
