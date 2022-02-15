import { Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventModel, EventService } from 'src/app/services/event.service';
import { ViewdomModel, ViewdomService } from 'src/app/services/viewdom.service';

export class MenuModel {
  private menu!: string;
  private windowDOMRectOrigin!: DOMRect;

  constructor(
    _menu: string,
    _windowDOMRectOrigin: DOMRect
  ) {
    this.menu = _menu;
    this.windowDOMRectOrigin = _windowDOMRectOrigin;
  }
  
  get _menu(): string {
    return this.menu;
  }

  set _menu(_value) {
    this.menu = _value;
  }

  get _windowDOMRectOrigin(): DOMRect {
    return this.windowDOMRectOrigin;
  }

  set _windowDOMRectOrigin(_value) {
    this.windowDOMRectOrigin = _value;
  }
}

@Component({
  selector: 'te-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MenuComponent implements OnInit, OnDestroy {
  /**
   * Menu id to match DOM calls
   */
  @Input('menu') menu: string = '';
  
  /**
   * Horizontal menu offset position in viewport
   */
  @Input('xPosition') xPosition: string = '';
  
  /**
   * Vertical menu offset position in viewport
   */
  @Input('yPosition') yPosition: string = '';
  
  /**
   * Visibility class toggler
   */
  @HostBinding('class.show') show: boolean = false;
  
  /**
   * Vertical offset class, to open menu above menu trigger in viewport
   */
  @HostBinding('class.position-above') above: boolean = false;
  
  /**
   * Vertical offset class, to open menu below menu trigger in viewport, default
   */
  @HostBinding('class.position-below') below: boolean = false;
  
  /**
   * Horizontal offset class, to open menu before menu trigger in viewport
   */
  @HostBinding('class.position-before') before: boolean = false;
  
  /**
   * Horizontal offset class, to open menu after menu trigger in viewport, default
   */
  @HostBinding('class.position-after') after: boolean = false;
  
  /**
   * Style property display, to lessen viewdom 
   */
  @HostBinding('style.display') display: string = 'none';
  
  /**
   * Style variable, horizontal menu fixed position in viewport
   */
  @HostBinding('style.--x-position') xDomPosition: string = '';
  
  /**
   * Style variable, vertical menu fixed position in viewport
   */
  @HostBinding('style.--y-position') yDomPosition: string = '';
  
  /**
   * Style variable, horizontal transform-origin position in viewport
   */
  @HostBinding('style.--transform-x-position') transformXDomPosition: string = '';
  
  /**
   * Style variable, vertical transform-origin position in viewport
   */
  @HostBinding('style.--transform-y-position') transformYDomPosition: string = '';
  
  /**
   * DOM Event, onClick
   */
  @HostListener('click', ['$event']) onClick(_event: any) {
    if (!<HTMLElement> _event.explicitOriginalTarget.classList.contains('te-menu-scrim'))
      return;

    /**
     * Disable menu display,
     * toggle children visiblity with same style delay to keep transitions
     */
    this.show = false;
    setTimeout(() => {
      this.display = 'none';
      this.nativeElement.remove();
    }, 150);
  }

  /**
   * DOM native element
   */
  private nativeElement!: HTMLElement;

  /**
   * RXJS subscription to listen menu triggers
   */
  private subscription!: Subscription;

  constructor(
    private elementRef: ElementRef,
    private eventService: EventService,
    private viewdomService: ViewdomService
  ) { }

  ngOnInit(): void {
    this.nativeElement = this.elementRef.nativeElement;

    // lessen DOM since menu has to be called inside an overlay container above all DOM elements
    this.nativeElement.remove();

    this.subscription = this.eventService._eventEmitter.subscribe((_event: EventModel) => {
      if (_event._recipient == EventModel.RECIPIENT.MENU &&
          _event._data._menu == this.menu) {
        /**
         * Check overlay nullity,
         * creating element if null
         */
        if (!this.viewdomService.get(ViewdomModel.DOM_ELEMENT.OVERLAY))
          this.viewdomService.create(ViewdomModel.DOM_ELEMENT.OVERLAY);

        // append the copy of removed native element to overlay
        this.viewdomService.get(ViewdomModel.DOM_ELEMENT.OVERLAY)?.appendChild(this.nativeElement)
      
        // horizontal style featments
        if (this.xPosition == 'before') {
          this.before = true;
          this.xDomPosition = (document.documentElement.clientWidth - _event._data._windowDOMRectOrigin.right) + 'px';
          this.transformXDomPosition = _event._data._windowDOMRectOrigin.right + 'px';
        } else {
          this.after = true;
          this.xDomPosition = _event._data._windowDOMRectOrigin.left + 'px';
          this.transformXDomPosition = _event._data._windowDOMRectOrigin.left + 'px';
        }

        // vertical style featments
        if (this.yPosition == 'above') {
          this.above = true;
          this.yDomPosition = (document.documentElement.clientHeight - _event._data._windowDOMRectOrigin.top) + 'px';
          this.transformYDomPosition = _event._data._windowDOMRectOrigin.top + 'px';
        } else {
          this.below = true;
          this.yDomPosition = _event._data._windowDOMRectOrigin.bottom + 'px';
          this.transformYDomPosition = _event._data._windowDOMRectOrigin.bottom + 'px';
        }

        /**
         * Enable menu display,
         * toggle children visiblity with short delay to force transitions
         */
        this.display = 'block';
        setTimeout(() => {
          this.show = true;
        }, 0);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

}
