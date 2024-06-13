import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  /**
   * divMenu - any - The div of the menu
   */
  @ViewChild('opciones') divMenu!: ElementRef;
  /**
   * rol - string - The user's rol
   */
  rol: string = "";

  constructor(private service: ApiService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.rol = this.service.rol.value.toLowerCase();
    this.cdr.detectChanges();
  }

  abrirMenu() {
    this.divMenu.nativeElement.style.left = '0';
    this.divMenu.nativeElement.style.width = '100%';
  }

  cerrarMenu(num: number) {
    this.divMenu.nativeElement.style.left = '-100%';
    this.divMenu.nativeElement.style.width = '0';
    if (num != 0) this.service.option.next(num);
  }
}
