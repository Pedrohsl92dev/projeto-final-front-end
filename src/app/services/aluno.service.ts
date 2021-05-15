import { Aluno } from './../models/aluno';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const URL = 'http://localhost:3000/stefanini/aluno';

@Injectable({
  providedIn: 'root'
})
export class AlunoService {

  constructor(private httpClient: HttpClient) {}
  
  listar(): Observable<Aluno> {
    return this.httpClient.get<Aluno>(`${URL}`);
  }

  obter(): Observable<Aluno[]> {
    return this.httpClient.get<Aluno[]>(URL);
  }
  
  obterById(id: number): Observable<Aluno> {
    return this.httpClient.get<Aluno>(`${URL}/${id}`);
  }

  incluir(aluno: Aluno): Observable<Aluno> {
    return this.httpClient.post<Aluno>(URL, aluno);
  }

  alterar(aluno: Aluno): Observable<Aluno> {
    return this.httpClient.put<Aluno>(`${URL}/${aluno.id}`, aluno);
  }

  excluir(id: number): Observable<any> {
    return this.httpClient.delete(`${URL}/${id}`);
  }

}


