import { Curso } from './../../../../models/curso';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CursoService } from 'src/app/services/curso.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-listar-cursos',
  templateUrl: './listar-cursos.component.html',
  styleUrls: ['./listar-cursos.component.css']
})
export class ListarCursosComponent implements OnInit {

  modalRef: BsModalRef;
  cursos: Curso[] = [];
  cursosFiltrados: Curso[] = [];
  cursoId = 0; 
  filtroLista = ''; 

  constructor(
    private cursoService: CursoService,    
    private toastr: ToastrService,
    
  ) { }

  ngOnInit(): void {    
    this.carregarCursos();
  }

  get filtro(): string {
    return this.filtroLista;
  }
  
  set filtro(value: string) {
    this.filtroLista = value;
    this.cursosFiltrados = this.filtroLista ? this.filtrarCursos(this.filtroLista) : this.cursos;
  }

  filtrarCursos(filtrarPor: string): Curso[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.cursos.filter(
      professor => professor.nome.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }
  
  carregarCursos(): void {
    this.cursoService.obter().subscribe({
      next: (cursos: Curso[]) => {
        this.cursos = cursos;
         if(this.cursos && this.cursos.length) {
           this.cursos.forEach(curso => {
            console.log('curso: '+curso.id, curso.avaliacao)
            if(!curso.avaliacao){
                curso.avaliacao = 0;
             }
         });
         this.cursosFiltrados = this.cursos;
        }
      },
      error: (error: any) => {       
        this.toastr.error(`Erro ao Carregar os Cursos',  ${error}`);
      }
    });
  }

  avaliar(curso, nota) {
    console.log(nota, curso);
    curso.avaliacao = nota;
    this.cursoService.alterar(curso).subscribe({
      next: () => {
        this.carregarCursos();
        this.toastr.success('Obrigado por avaliar o curso!');
      },
      error: (error: any) => {
        this.toastr.error(`Erro ao avaliar os Cursos',  ${error}`);
      }
    });
  }
}
