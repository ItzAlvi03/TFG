import { Component, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-pagina-inicio',
  templateUrl: './pagina-inicio.component.html',
  styleUrls: ['./pagina-inicio.component.css']
})
export class PaginaInicioComponent implements OnInit{
  /**
   * username - string - Contains the user name's
   */
  username: string = "";
  /**
   * rol - string - Contains the user's rol
   */
  rol: string = "";
  /**
   * dentroSeccion - boolean - To check if the user is in other section
   */
  dentroSeccion: boolean = false;
  /**
   * opcion - number - The specific section where the user is located
   */
  opcion!: number;
  /**
   * isMobile - boolean - Check if the web is in a mobile phone or not
   */
  isMobile = false;
  /**
   * 
   * @param service - ApiService - Angular Service to use the API.
   * @param router - Router - Angular Class that allows the user to move through the different components.
   */
  constructor(private service: ApiService, private router: Router, private el: ElementRef, private renderer: Renderer2) {}

  /**
   * Method that executes before the view is loaded.
   * Set the info of the user
   */
  ngOnInit(): void {
    this.username = this.service.username.value;
    this.rol = this.service.rol.value.toLowerCase();
    this.checkWindowSize();
    this.service.option.subscribe(value => {
      if(this.service.option.value !== 0){
        this.opcion = this.service.option.value;
        this.dentroSeccion = true;
      }
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkWindowSize();
  }
  
  checkWindowSize() {
    this.isMobile = window.innerWidth <= 750;
  }

  /**
   * Changes the differents sections
   * 
   * @param num - number - Number of the section to move
   */
  cambiarOpcion(num: number) {
    const seccion = document.getElementById('opcion' + num) as any;
    if(seccion){
      this.dentroSeccion = true;
      this.opcion = num;
    }
  }
  
  /**
   * Method to leave the home page and return to login
   */
  clearToken() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

}
