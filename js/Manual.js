import { observe } from './resizer.js'

export class Manual {
  constructor(id) {
    this.parent = document.getElementById(id);
    this.pages = this.parent.querySelectorAll('.page');
    this.top = this.calculateTop();
    this.pages.forEach((page) => {
      page.addEventListener('click', (event) => {
        this.handleClick(event);
      });
      page.addEventListener('animationend', () => {
        this.endSwitch();
      });
    });
    observe(document.body, () => {
      this.handleResize();
    });
    this.isOpen = false;
  }

  handleResize() {
    this.top = this.calculateTop();
    if (this.isOpen) {
      this.moveUp();
    }
  }

  moveUp(page) {
    page.style.setProperty('--ty', `calc(var(--manual-top) - ${this.top}px)`);
  }

  calculateTop() {
    const rect = this.parent.getBoundingClientRect();
    return rect.top;
  }

  handleClick(event) {
    if (!event.currentTarget.classList.contains('open')) {
      this.open();
    } else {
      if (event.currentTarget.classList.contains('top')) {
        this.close();
      } else {
        this.switch();
      }
    }
  }

  switch() {
    this.pages.forEach((page) => {
      page.classList.toggle('top');
      page.classList.add('swapping');
      page.style.setProperty('animation-play-state', 'running');
    });
  }

  endSwitch() {
    this.pages.forEach((page) => {
      page.classList.remove('swapping');
      page.style.setProperty('animation-play-state', 'paused');
    });
  }

  open() {
    this.pages.forEach((page) => {
      page.classList.add('open');
      this.moveUp(page);
    });
    this.isOpen = true;
  }

  close() {
    this.pages.forEach((page) => {
      page.classList.remove('open');
      page.classList.remove('swapping');
      page.style.setProperty('animation-play-state', 'paused');
      page.style.setProperty('--ty', 'var(--default-ty)');
    });
    this.isOpen = false;
  }
}