import { Professor } from 'src/app/models/professor';
import { ProfessorService } from 'src/app/services/professor.service';
import { CursoService } from './../../../../services/curso.service';
import { Component, OnInit } from '@angular/core';
import {  FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Curso } from 'src/app/models/curso';
import { AulaService } from 'src/app/services/aula.service';
import { Aula } from 'src/app/models/aula';

@Component({
  selector: 'app-cadastro-curso',
  templateUrl: './cadastro-curso.component.html',
  styleUrls: ['./cadastro-curso.component.css']
})
export class CadastroCursoComponent implements OnInit {

  modalRef: BsModalRef;
  cursosFiltrados: Curso[];
  cursoId: number;
  cursos: Curso[];
  curso: Curso;
  modoSalvar = 'incluir';  
  form: FormGroup; 
  bodyDeletarCurso = '';  
  filtroLista = '';  
  aulaAtual = {id: 0, nome: '', duracao: '', idCurso: 0, indice: 0};
  listaProfessores = [];
  professor: Professor[];

  constructor(
    private cursoService: CursoService,    
    private fb: FormBuilder,    
    private toastr: ToastrService,    
    private aulaService: AulaService,
    private professorService: ProfessorService,    
  ) { }

  ngOnInit() {    
    this.carregarProfessores();
    this.getCursos();
    this.validation();
  }

  get formAulas(): FormArray {
    return this.form.get('aulas') as FormArray;
  }

  get f(): any {
    return this.form.controls;
  }
  
  get filtro(): string {
    return this.filtroLista;
  }

  get modoEditar(): boolean {
    return this.modoSalvar === 'alterar';
  }

  set filtro(value: string) {
    this.filtroLista = value;
    this.cursosFiltrados = this.filtroLista ? this.filtrarCurso(this.filtroLista) : this.cursos;
  }

  editarCurso(curso: Curso, template: any) {    
    this.modoSalvar = 'alterar';
    this.openModal(template);    
    this.curso = {...curso};    
    this.form.patchValue(this.curso);
    this.formAulas.clear();
    if(curso.aulas && curso.aulas.length) {
      curso.aulas.forEach(el => {
        this.formAulas.push(this.criarAula(el as Aula));
      })
    }
  }
 
  novoCurso(template: any) {
    this.modoSalvar = 'incluir';
    this.openModal(template);
  }

  deletarAula(i) {
    let index = 0;
    this.formAulas.clear();
    this.cursos.forEach(el => {
      if(el.aulas.length) {
        el.aulas.forEach(aula => {
          if(i != index) {            
            this.formAulas.push(this.criarAula(aula as Aula));
          }
          index++;
        })
      }
    });
  }

  salvarAulas(): void {    
    if (this.form.controls.aulas.valid) {
      this.aulaService.incluir(this.form.value)
        .subscribe(
          () => {
            this.toastr.success('Aulas salva com Sucesso!', 'Sucesso!');
          },
          (error: any) => {
            console.error(error);
            this.toastr.error(`Erro ao tentar salvar aulas: ${error.error.message}`);
          }
        );
    }
  }

  adicionarAula(): void {
    this.formAulas.push(this.criarAula({id: 0} as Aula));
  }
  
  criarAula(aula: Aula): FormGroup {
    return this.fb.group({
      id: [aula.id],
      nome: [aula.nome, Validators.required],
      duracao: [aula.duracao, Validators.required],
      idCurso: [aula.idCurso, Validators.required],
    });
  }

  retornaTituloAula(nome: string): string {
    return nome === null || nome === '' ? 'Nome da aula' : nome;
  }
  
  validation() {
    this.form = this.fb.group({
      nome: [null, [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      descricao: [null, Validators.required],      
      idProfessor: [null, Validators.required],  
      aulas: this.fb.array([])      
    });
  }
      
  excluirCurso(curso: Curso, template: any) {
    this.openModal(template);    
    this.curso = curso;
    this.bodyDeletarCurso = `Tem certeza que deseja excluir o Curso: ${curso.nome}, Código: ${curso.id}`;
    
  }

  confirmeDelete(template: any) {
    this.cursoService.excluir(this.curso.id).subscribe(
      () => {
        template.hide();
        this.getCursos();
        this.toastr.success('Deletado com Sucesso.');
      }, error => {
        console.error(error);
        this.toastr.error('Error ao tentar deletar.');
      }
    );
  }
    
  salvar(template: any) {    
    if (this.form.valid) {
      this.curso = (this.modoSalvar === 'incluir') ? {...this.form.value} : {id: this.curso.id, ...this.form.value};
      this.cursoService[this.modoSalvar](this.curso).subscribe(
        () => {
          template.hide();
          this.getCursos();
          this.toastr.success('Inserido com Sucesso!');
        },
        (error) => {
          this.toastr.error(`Erro ao tentar salvar usuário: ${error.error.message}`);
        }
      );
    }
  }

 carregarProfessores(): void {
    this.professorService.obter().subscribe({
      next: (professor: Professor[]) => {
        this.listaProfessores = professor;
      },
      error: (error: any) => {
        console.error(error);
        this.toastr.error(`Erro ao carregar professores.: ${error.error.message}`);
      }
    });
  }
  
  getCursos() { 
    this.cursoService.obter().subscribe(
      (cursos: Curso[]) => {
        this.cursos = cursos;
        this.cursosFiltrados = this.cursos;
        if(this.cursos.length && this.listaProfessores.length) {
          this.cursos.forEach(curso => {
            this.listaProfessores.forEach(professor => {              
              if(Number(curso.idProfessor) === Number(professor.id)) { 
                curso.nomeProfessor = professor.nome
              }
            });
          });          
        }       
      }, error => {
        this.toastr.error(`Erro ao tentar carregar cursos: ${error}`);
      }
    );
  }

  filtrarCurso(filtrarPor: string): Curso[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.cursos.filter(
      curso => curso.nome.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  public resetForm(): void {
    this.form.reset();
  }
  
  openModal(template: any) {
    this.form.reset();
    template.show();
  }  
  
}