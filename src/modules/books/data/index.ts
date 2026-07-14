interface IBook {
  id: number;
  title: string;
  author: string;
}

const BOOKS_MOCK: IBook[] = [
  { id: 1, title: 'El Principito', author: 'Antoine de Saint-Exupéry' },
  { id: 2, title: 'Don Quijote de la Mancha', author: 'Miguel de Cervantes' }
]

export {
  BOOKS_MOCK, type IBook
};
