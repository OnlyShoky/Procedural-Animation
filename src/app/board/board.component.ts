import { Component, ElementRef, HostListener, Inject, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { SnakeComponent } from "../animals/snake/snake.component";
import { isPlatformBrowser } from '@angular/common';
import { SnakePComponent } from "../animals/snake-p/snake-p.component";
import { RouterOutlet } from '@angular/router';
import { UtilsService } from '../services/utils.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [ RouterOutlet],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent {

// To store the width and height of the board
boardWidth: number = 800;
boardHeight: number = 500;

// Reference to the board element
@ViewChild('board', { static: false }) boardElement!: ElementRef;

constructor(@Inject(PLATFORM_ID) private platformId: Object, private utilService: UtilsService) {}

ngAfterViewInit(): void {
  // After the view is initialized, update the size
  if (isPlatformBrowser(this.platformId)) 
    this.updateBoardSize();
    this.utilService.updateBoardSize(this.boardWidth, this.boardHeight);
}

// Listen to the screen resize
@HostListener('window:resize', ['$event'])
onResize(event: UIEvent) {
  this.updateBoardSize();
  this.utilService.updateBoardSize(this.boardWidth, this.boardHeight);
}


// Method to update the size of the board
updateBoardSize(): void {
  if (this.boardElement) {
    this.boardWidth = this.boardElement.nativeElement.offsetWidth;
    this.boardHeight = this.boardElement.nativeElement.offsetHeight;
  }
}
}
