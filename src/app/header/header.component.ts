import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import{ MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { UtilsService } from '../services/utils.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {


// To store the width and height of the toolbar
toolbarWidth: number = 0;
toolbarHeight: number = 0;

// Reference to the toolbar element
@ViewChild('toolbar', { static: false }) toolbarElement!: ElementRef;

constructor(@Inject(PLATFORM_ID) private platformId: Object, private utilService: UtilsService) {}

ngAfterViewInit(): void {
  // After the view is initialized, update the size
  if (isPlatformBrowser(this.platformId)) 
    this.updatetoolbarSize();
    this.utilService.updatetoolbarSize(this.toolbarWidth, this.toolbarHeight);
}

// Listen to the screen resize
@HostListener('window:resize', ['$event'])
onResize(event: UIEvent) {
  this.updatetoolbarSize();
  this.utilService.updatetoolbarSize(this.toolbarWidth, this.toolbarHeight);
}


// Method to update the size of the toolbar
updatetoolbarSize(): void {
  if (this.toolbarElement) {
    this.toolbarWidth = this.toolbarElement.nativeElement.offsetWidth;
    this.toolbarHeight = this.toolbarElement.nativeElement.offsetHeight;
  }
}

}
