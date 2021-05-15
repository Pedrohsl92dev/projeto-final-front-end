import { Aluno } from 'src/app/models/aluno';
import { Curso } from 'src/app/models/curso';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { AlunoService } from 'src/app/services/aluno.service';
import { CursoService } from 'src/app/services/curso.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-cadastro-aluno',
  templateUrl: './cadastro-aluno.component.html',
  styleUrls: ['./cadastro-aluno.component.css']
})
export class CadastroAlunoComponent implements OnInit {

  modalRef: BsModalRef;
  alunosFiltrados: Aluno[];
  alunoId: number;
  alunos: Aluno[];
  aluno: Aluno;
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
    private alunoService: AlunoService,    
    private fb: FormBuilder,    
    private toastr: ToastrService,
    private cursoService: CursoService ,
    private router: Router,
    private authService: AuthService   
  ) { }

  ngOnInit() {    
    this.user = JSON.parse(localStorage.getItem('user'));
    this.getAlunos();
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

  carregarCursos(): void {
    this.cursoService.obter().subscribe({
      next: (cursos: Curso[]) => {
        this.listaCursos = cursos;
        this.listaCursos.forEach(element => {
          const result = this.aluno.cursos.map(el=>el.id == element.id);
            element.checked = result[0] ;
        });       
      },
      error: (error: any) => {
        console.error(error);
        this.toastr.error(`Erro ao carregar curso.: ${error.error.message}`);
      }
    });
  }

  set filtro(value: string) {
    this.filtroLista = value;
    this.alunosFiltrados = this.filtroLista ? this.filtrarAlunos(this.filtroLista) : this.alunos;
  }

  editarAluno(aluno: Aluno, template: any) {
    this.modal = 1;
    this.modoSalvar = 'alterar';
    this.openModal(template);
    this.aluno = {...aluno};    
    this.form.patchValue(this.aluno);
    this.carregarCursos();
    this.form.controls['email'].disable();
    this.form.controls['email'].updateValueAndValidity();
    this.form.controls['senha'].clearValidators();
    this.form.controls['senha'].updateValueAndValidity();
    // console.log(`editar aluno`,this.form);      
  }

  novoAluno(template: any) {
    this.modal = 1;
    this.modoSalvar = 'incluir';
    this.openModal(template);
    this.form.controls['senha'].setValidators([Validators.required]);
    this.form.controls['senha'].updateValueAndValidity();
    this.form.controls['email'].enable();
    this.form.controls['email'].updateValueAndValidity();
    // console.log(`novo aluno`,this.form);       
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
            this.toastr.error(`Erro ao tentar salvar curso.: ${error.error.message}`);           
          }
        );
    }
  }
  
  criarCurso(curso: Curso): FormGroup {
    return this.fb.group({
      id: [curso.id],
      nome: [curso.nome, Validators.required],
      descricao: [curso.descricao, Validators.required],      
    });
  }

  retornaTituloCurso(nome: string): string {
    return nome === null || nome === '' ? 'Nome do curso' : nome;
  }

  declineDeleteCurso(): void {
    this.modalRef.hide();
  }

  validation() {    
    this.form = this.fb.group({
      nome: ['', [Validators.required]], 
      // nome: [''], teste para validação do back end.    
      email: ['', [Validators.required, Validators.email]],
      formacao: ['', Validators.required],
      idade: ['', Validators.required],
      tipo: ['', Validators.required],
      senha: [''],
    });
  } 
      
  excluirAluno(aluno: Aluno, template: any) {
    this.modal = 2;   
    this.aluno = aluno;
    this.bodyDeletarCurso = `Tem certeza que deseja excluir o Aluno: ${aluno.nome}, Código: ${aluno.id}`;
    this.openModal(template);   
  }


  confirmeDelete(template: any) {
    this.alunoService.excluir(this.aluno.id).subscribe(
      () => {
        template.hide();
        this.getAlunos();
        this.toastr.success('Deletado com Sucesso.');
        // this.authService.logout();
        // this.router.navigate(['login']);
      }, error => {
        console.error(error);        
        this.toastr.error(`Erro ao tentar deletar: ${error.error.message}`); 
      }
    );
  }
  
  salvar(template: any) {    
    if (this.form.valid) {
      this.aluno = (this.modoSalvar === 'incluir') ? {...this.form.value} : {id: this.aluno.id, ...this.form.value};
      this.aluno.cursos = [];
      this.listaCursos.forEach(el => {
        if(el.checked)
        this.aluno.cursos.push(el);
      })
      this.alunoService[this.modoSalvar](this.aluno).subscribe(
        () => {
          template.hide();
          this.getAlunos();
          this.toastr.success('Inserido com Sucesso!');
        },
        (error) => {
          console.error(error);
          this.toastr.error(`Erro ao tentar salvar.: ${error.error.message}`);
        }
      );
    }
  } 
  
  getAlunos() { 
    this.alunoService.obter().subscribe(
      (alunos: Aluno[]) => {
        this.alunos = alunos;
        this.alunosFiltrados = this.alunos;
      }, error => {
        console.error(error);
        this.toastr.error(`Erro ao tentar carregar alunos: ${error.error.message}`);
      }
    );
  }

  filtrarAlunos(filtrarPor: string): Aluno[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.alunos.filter(
      aluno => aluno.nome.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  resetForm(): void {
    this.form.reset();
  }
  
  openModal(template: any) {
     this.form.reset();
    template.show();
  } 

  cssValidator(campoForm: FormControl | AbstractControl): any {
    return {'is-invalid': campoForm.errors && campoForm.touched };
  }
}