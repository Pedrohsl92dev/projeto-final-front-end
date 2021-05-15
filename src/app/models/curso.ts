import { Aluno } from "./aluno";
import { Aula } from "./aula";

export interface Curso {
    id?: number;
    nome: string;
    descricao: string;
    idProfessor?: number;
    nomeProfessor: string;
    idAluno?: Aluno[];
    aulas?: Aula[];
    avaliacao?: number;
}