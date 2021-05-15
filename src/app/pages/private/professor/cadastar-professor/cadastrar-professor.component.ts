import { Curso } from 'src/app/models/curso';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { CursoService } from 'src/app/services/curso.service';
import { Professor } from 'src/app/models/professor';
import { ProfessorService } from 'src/app/services/professor.service';


@Component({
  selector: 'app-cadastrar-professor',
  templateUrl: './cadastrar-professor.component.html',
  styleUrls: ['./cadastrar-professor.component.css']
})
export class CadastroProfessorComponent implements OnInit {

  modalRef: BsModalRef;
  professoresFiltrados: Professor[];
  professorId: number;
  professores: Professor[];
  professor: Professor;
  modoSalvar = 'incluir';  
  form: FormGroup; 
  bodyDeletarCurso = '';  
  filtroLista = ''; 
  mostrarOpcaoes = false;
  user: any; 
  listaCursos = [];
  curso: any;
  cursos = [];
  modal = 0;

  constructor(
    private professorService: ProfessorService,    
    private fb: FormBuilder,    
    private toastr: ToastrService,
    private cursoService: CursoService,
  ) { }

  ngOnInit() {    
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getProfessores();
    this.validation();
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

  public carregarCursos(): void {
    this.cursoService.obter().subscribe({
      next: (cursos: Curso[]) => {
        this.listaCursos = cursos;
        this.listaCursos.forEach(element => {
          const result = this.professor.cursos.map(el=>el.id == element.id);
            element.checked = result[0] ;
        });       
      },
      error: (error: any) => {  
        this.toastr.error(`Erro ao Carregar os Cursos: ${error.error.message}`);
      }
    });
  }

  set filtro(value: string) {
    this.filtroLista = value;
    this.professoresFiltrados = this.filtroLista ? this.filtrarProfessores(this.filtroLista) : this.professores;
  }

  filtrarProfessores(filtrarPor: string): Professor[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.professores.filter(
      professor => professor.nome.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  editarProfessor(professor: Professor, template: any) {
    this.modal = 1;
    this.modoSalvar = 'alterar';
     this.openModal(template);
    this.professor = {...professor};    
    this.form.patchValue(this.professor);
    this.carregarCursos();
    this.form.controls['email'].disable();
    this.form.controls['email'].updateValueAndValidity();
    this.form.controls['senha'].clearValidators();
    this.form.controls['senha'].setAsyncValidators(null);
    this.form.controls['senha'].updateValueAndValidity();
    // console.log(this.form);
  }

  novoProfessor(template: any) {
    this.modal = 1;
    this.modoSalvar = 'incluir';
    this.openModal(template);
    this.form.controls['senha'].setValidators([Validators.required]);
    this.form.controls['senha'].updateValueAndValidity();
    this.form.controls['email'].enable();
    this.form.controls['email'].updateValueAndValidity();
    // console.log(this.form);
  }

  salvarCursos(): void {    
    if (this.form.controls.cursos.valid) {
      this.cursoService.incluir(this.form.value)
        .subscribe(
          () => {
            this.toastr.success('Curso salvo com Sucesso!', 'Sucesso!');
          },
          (error: any) => {
            console.error(error);
            this.toastr.error(`Erro ao tentar salvar cursos: ${error.error.message}`);           
          }
        );
    }
  }

  adicionarCurso(curso): void {
      this.cursos.forEach( el=> {
         if(el.id == curso.id) {
          el.checked = el.checked ? false : true;
        }
      });  
  }
  
  criarCurso(curso: Curso): FormGroup {
    return this.fb.group({
      id: [curso.id],
      nome: [curso.nome, Validators.required],
      descricao: [curso.descricao, Validators.required],      
    });
  }

  public retornaTituloCurso(nome: string): string {
    return nome === null || nome === '' ? 'Nome do curso' : nome;
  }

  declineDeleteCurso(): void {
    this.modalRef.hide();
  }

  validation() {    
    this.form = this.fb.group({
      // nome: [''], teste para validação do back end.    
      nome: ['', [Validators.required]], 
      email: ['', [Validators.required, Validators.email]],            
      tipo: ['', Validators.required],
      senha: [''],
    });
  } 
      
  excluirProfessor(professor: Professor, template: any) {
    this.modal = 2; 
    this.professor = professor;
    this.bodyDeletarCurso = `Tem certeza que deseja excluir o professor: ${professor.nome}, Código: ${professor.id}`;
    this.openModal(template);
  }

  confirmeDelete(template: any) {
    this.professorService.excluir(this.professor.id).subscribe(
      () => {
        template.hide();
        this.getProfessores();
        this.toastr.success('Deletado com Sucesso.');       
      }, error => {
        this.toastr.error(`Erro ao tentar deletar: ${error.error.message}`);
        this.modalRef.hide();
      }
    );
  }

  
  salvarAlteracao(template: any) {    
    if (this.form.valid) {
      this.professor = (this.modoSalvar === 'incluir') ? {...this.form.value} : {id: this.professor.id, ...this.form.value};
      this.professor.cursos = [];
      this.listaCursos.forEach(el => {
        if(el.checked)
        this.professor.cursos.push(el);
      })
      this.professorService[this.modoSalvar](this.professor).subscribe(
        () => {
          template.hide();
          this.getProfessores();
          this.toastr.success('Inserido com Sucesso!');
        },
        (error) => {
          this.toastr.error(`Erro ao tentar salvar usuário: ${error.error.message}`);
        }
      );
    }
  } 
  
  getProfessores() { 
    this.professorService.obter().subscribe(
      (professores: Professor[]) => {
        this.professores = professores;
        this.professoresFiltrados = this.professores;
      }, error => {
        this.toastr.error(`Erro ao tentar carregar professores: ${error.error.message}`);
      }
    );
  }

  public resetForm(): void {
    this.form.reset();
  }
  
  openModal(template: any) {
     this.form.reset();
    template.show();
  }  

  public cssValidator(campoForm: FormControl | AbstractControl): any {
    return {'is-invalid': campoForm.errors && campoForm.touched };
  }
  
}