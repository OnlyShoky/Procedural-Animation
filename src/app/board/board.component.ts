import { Component, ElementRef, HostListener, Inject, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { SnakeComponent } from "../animals/snake/snake.component";
import { isPlatformBrowser } from '@angular/common';
import { SnakePComponent } from "../animals/snake-p/snake-p.component";

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [SnakeComponent, SnakePComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {

// To store the width and height of the board
boardWidth: number = 0;
boardHeight: number = 0;

// Reference to the board element
@ViewChild('board', { static: false }) boardElement!: ElementRef;

constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

ngAfterViewInit(): void {
  // After the view is initialized, update the size
  if (isPlatformBrowser(this.platformId)) 
    this.updateBoardSize();
}

// Listen to the screen resize
@HostListener('window:resize', ['$event'])
onResize(event: UIEvent) {
  this.updateBoardSize();
}


// Method to update the size of the board
updateBoardSize(): void {
  if (this.boardElement) {
    this.boardWidth = this.boardElement.nativeElement.offsetWidth;
    this.boardHeight = this.boardElement.nativeElement.offsetHeight;
  }
}
}
