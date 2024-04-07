import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/Services/api.service';

@Component({
  selector: 'app-pagina-inicio',
  templateUrl: './pagina-inicio.component.html',
  styleUrls: ['./pagina-inicio.component.css']
})
export class PaginaInicioComponent implements OnInit{
  username: string = "";
  rol: string = "";
  errorMensaje: string = ""; 
  correcto!: boolean;
  dentroSeccion: boolean = false;
  opcion!: number;
  
  constructor(private service: ApiService) {}

  async ngOnInit(): Promise<void> {
    // Este if y else es para que no se vea un pantallazo feo de la cara triste y luego se carga todo.
    // De esta manera comprobamos que digamos empieza bien con el token o si no tiene el token vamos cargando
    // la vista de error mientras llega el mensaje de error
    this.service.token.next('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWQiOjEsInJvbCI6ImVuY2FyZ2FkbyIsImV4cGlyYXRpb24iOiIyMDI0LTA0LTA3IDIxOjQ3OjQyLjg3OTc5MSJ9.cn0c82eLSR_SfAAYsoop84THYbWtkeJ1pmws0vInLII');
    if(this.service.token.value === "")this.correcto = false;
    else this.correcto = true;

    try{
      const response = await this.service.auth().toPromise();
      if(response && response.username && response.rol) {
        this.username = response.username;
        this.rol = response.rol;
      }
      this.correcto = true;
    } catch(error: any){
      this.correcto = false;
      if (error && error.error && error.error.mensaje) {
        this.errorMensaje = error.error.mensaje;
      } else {
        if (error.status === 500) {
        this.errorMensaje = 'Ha ocurrido un error en el servidor, inténtelo de nuevo.';
        } else {
          this.errorMensaje = 'Ha ocurrido un error en el servidor, inténtelo de nuevo.';
        }
      }
    }
  }

  cambiarOpcion(num: number) {
    const seccion = document.getElementById('opcion' + num) as any;
    if(seccion){
      this.dentroSeccion = true;
      this.opcion = num;
    }
  }

}
