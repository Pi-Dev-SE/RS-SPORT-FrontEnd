import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ThemeService {

  // 'blue', 'green', 'purple', 'cyan', 'indigo', 'amber', 'teal', 'pink', 'noir', 'lime'
  private themes = [
    {
      name: 'blue',
      color: '#3B82F6'
    },
    {
      name: 'green',
      color: '#10b981'
    },
    {
      name: 'purple',
      color: '#8B5CF6'
    },
    {
      name: 'cyan',
      color: '#06b6d4'
    },
    {
      name: 'indigo',
      color: '#6366F1'
    },
    {
      name: 'amber',
      color: '#f59e0b'
    },
    {
      name: 'teal',
      color: '#14b8a6'
    },
    {
      name: 'pink',
      color: '#ec4899'
    },
    {
      name: 'noir',
      color: '#020617'
    },
    {
      name: 'lime',
      color: '#84cc16'
    }
  ];
  private themeMode = 'light';
  private themeColor = 'blue';
  get currentTheme (): string {
    return `aura-${this.themeMode}-${this.themeColor}`;;
  }
  
  constructor() { 
    const mode = localStorage.getItem('theme.mode');
    const color = localStorage.getItem('theme.color');
    if (mode && color) {
      this.themeMode = mode;
      this.themeColor = color;
    }
  }


  switchTheme(mode: 'light' | 'dark', color: string) {
    this.themeMode = mode;
    this.themeColor = color;
    localStorage.setItem('theme.mode', mode);
    localStorage.setItem('theme.color', color);
    this.applyTheme(this.currentTheme);
  }


  switchMode(mode: 'light' | 'dark') {
    this.themeMode = mode;
    localStorage.setItem('theme.mode', mode);
    this.applyTheme(this.currentTheme);
  }


  switchColor(color: string) {
    this.themeColor = color;
    localStorage.setItem('theme.color', color);
    console.log(this.currentTheme);
    
    this.applyTheme(this.currentTheme);
  }


  getCurrentTheme() {
    return this.currentTheme;
  }


  applyTheme(theme: string): void {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `${theme}.css`;
    } 
  }


  getThemes() {
    return this.themes;
  }


  getThemeMode() {
    return this.themeMode;
  }


  getThemeColor() {
    return this.themeColor;
  }


  getThemeColorByName(name: string) {
    return this.themes.find(theme => theme.name === name)?.color;
  }


  getThemeColorObjectByName(name: string) {
    return this.themes.find(theme => theme.name === name);
  }

}
